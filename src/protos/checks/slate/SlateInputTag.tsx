import * as React from 'react'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BaseEditor, createEditor, Descendant, Editor, Element as SlateElement, Range, Transforms } from 'slate'
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useFocused,
  useSelected,
  withReact,
} from 'slate-react'
import { HistoryEditor, withHistory } from 'slate-history'
import { Button, Flex, IconBraces, IconPlus, Popover, PreventDnD, Separator, Tabs, Text } from '@kapptivate/ui-kit'
import classnames from 'classnames/bind'
import styles from './input-tag.module.scss'
import { DateBuiltInParams, NumberBuiltInParams, TextBuiltInParams } from './types'
import {
  CustomBuiltInModal,
  GlobalVarLabel,
  VariableModal,
  VariableTag,
  useTranslation,
  useVariableGroupVariables,
  type Variable,
} from './stubs'
import { useParams } from 'react-router-dom'

const cx = classnames.bind(styles)

// To be able to render ABOVE modals.
const POPOVER_Z_INDEX = 2001

const VARIABLE_GROUP_TECHNICAL_NAME_PREFIX = 'variable_group_variable|'

const VARIABLE_TAG_COLOR = 'blue'

const parseVariableGroupId = (technicalName?: string): number | undefined => {
  if (!technicalName?.startsWith(VARIABLE_GROUP_TECHNICAL_NAME_PREFIX)) return undefined
  const idStr = technicalName.slice(VARIABLE_GROUP_TECHNICAL_NAME_PREFIX.length)
  const id = Number(idStr)
  return Number.isFinite(id) && id > 0 ? id : undefined
}

let tagIdCounter = 0

export type Color = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'blue'

export type TagInputValue = {
  value: string
} & (TagInputText | TagInputTag)

export type TagInputText = {
  type: 'text'
}

export type TagInputTag = {
  type: 'tag'
  color: Color
  id: string
  value: string
  customParams?: TextBuiltInParams | NumberBuiltInParams | DateBuiltInParams
  technicalName?: string
}

export type SuggestionItem = {
  id: string
  label: JSX.Element
  color: Color
  value: string
  technicalName?: string
  groupId?: number
}

export type Suggestions = {
  name: string
  key: 'previous_steps' | 'built_in' | 'variables'
  suggestions: SuggestionItem[]
  emptyState?: JSX.Element
}

type SlateInputTagProps = {
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  label?: string
  suggestions?: Suggestions[]
  value: TagInputValue[]
  onChange: React.Dispatch<React.SetStateAction<TagInputValue[]>>
  invalid?: boolean
  placeholder?: string
  onBlur?: React.FocusEventHandler<HTMLDivElement>
  onFocus?: React.FocusEventHandler<HTMLDivElement>
  borderless?: boolean
}

type CustomElement =
  | { type: 'paragraph'; children: (CustomText | CustomInlineElement)[] }
  | { type: 'tag'; data: TagInputTag; children: CustomText[] }

type CustomInlineElement = {
  type: 'tag'
  data: TagInputTag
  children: CustomText[]
}

type CustomText = {
  text: string
  bold?: boolean
}

type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}

const SlateInputTag = ({
  className,
  disabled,
  fullWidth,
  label,
  suggestions,
  value = [],
  onChange = () => {},
  invalid,
  placeholder = '',
  onBlur,
  onFocus,
  borderless,
}: SlateInputTagProps) => {
  const [t] = useTranslation('variables')
  const [openSuggestions, setOpenSuggestions] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [tab, setTab] = useState(suggestions?.[0]?.key || null)
  const [savedSelection, setSavedSelection] = useState<Range | null>(null)
  const [showFakeSelection, setShowFakeSelection] = useState(false)
  const [fakeSelectionRect, setFakeSelectionRect] = useState<DOMRect | null>(null)
  const [createVariableModalOpen, setCreateVariableModalOpen] = useState(false)

  const inputRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)
  const previousValue = useRef<TagInputValue[]>(value)

  const editor = useMemo(() => {
    const baseEditor = withHistory(withReact(createEditor()))

    const { isInline } = baseEditor

    baseEditor.isInline = (element) => {
      return element.type === 'tag' ? true : isInline(element)
    }

    baseEditor.insertBreak = () => {
      return
    }

    const originalInsertData = baseEditor.insertData
    baseEditor.insertData = (data: DataTransfer) => {
      const slateFragment = data.getData('application/x-slate-fragment')
      if (slateFragment) {
        try {
          const decoded = decodeURIComponent(window.atob(slateFragment))
          const parsed = JSON.parse(decoded) as Descendant[]
          const hasTags = parsed.some(
            (node) =>
              SlateElement.isElement(node) &&
              node.children?.some((child) => SlateElement.isElement(child) && child.type === 'tag'),
          )
          if (hasTags) {
            originalInsertData(data)
            return
          }
        } catch {
          // Fall through to plain text
        }
      }

      const text = data.getData('text/plain')
      if (!text) {
        originalInsertData(data)
        return
      }

      // Pass `at` explicitly. Editor.insertText silently no-ops when
      // editor.selection is null, which is what the regression looked like:
      // visually Slate would still reflect the pasted text via the browser's
      // contentEditable, but the controlled state never received an
      // insert_text operation and never propagated upward.
      // Transforms.insertText already handles expanded ranges internally
      // (delete-then-insert), so we just forward `at` and let it do the work.
      const sanitizedText = text.replace(/\r?\n/g, ' ')
      const at = baseEditor.selection ?? Editor.end(baseEditor, [])
      Transforms.insertText(baseEditor, sanitizedText, { at })
    }

    return baseEditor
  }, [])

  const editingTag = value.find((tag) => tag.type === 'tag' && tag.id === editingTagId) as TagInputTag | undefined

  const convertToSlateValue = useCallback((inputValue: TagInputValue[]): Descendant[] => {
    if (inputValue.length === 0) {
      return [{ type: 'paragraph', children: [{ text: '' }] }]
    }

    const children: (CustomText | CustomInlineElement)[] = []

    inputValue.forEach((item) => {
      if (item.type === 'text') {
        children.push({ text: item.value })
      } else if (item.type === 'tag') {
        children.push({
          type: 'tag',
          data: item,
          children: [{ text: item.value }],
        })
      }
    })

    return [{ type: 'paragraph', children }]
  }, [])

  const convertFromSlateValue = useCallback((slateValue: Descendant[]): TagInputValue[] => {
    const result: TagInputValue[] = []

    slateValue.forEach((node) => {
      if (SlateElement.isElement(node) && node.type === 'paragraph') {
        node.children.forEach((child) => {
          if (SlateElement.isElement(child) && child.type === 'tag') {
            const tagData = child.data
            const displayText = child.children[0]?.text || ''

            const valueToUse = tagData.customParams && tagData.value ? tagData.value : displayText || tagData.value || ''

            result.push({
              type: 'tag',
              value: valueToUse.trim(),
              color: tagData.color,
              id: tagData.id,
              customParams: tagData.customParams,
              technicalName: tagData.technicalName,
            })
          } else if ('text' in child && child.text) {
            result.push({
              type: 'text',
              value: child.text,
            })
          }
        })
      }
    })

    return result.filter((item) => item.value.trim() !== '')
  }, [])

  const [slateValue, setSlateValue] = useState<Descendant[]>(() => convertToSlateValue(value))

  const shouldHideStartPadding = useMemo(() => {
    if (!slateValue[0] || !SlateElement.isElement(slateValue[0])) return false

    const paragraph = slateValue[0]
    const firstChild = paragraph.children[0]
    const secondChild = paragraph.children[1]

    if (SlateElement.isElement(firstChild) && firstChild.type === 'tag') {
      return true
    }

    if ('text' in firstChild && firstChild.text === '' && SlateElement.isElement(secondChild) && secondChild.type === 'tag') {
      return true
    }

    return false
  }, [slateValue])

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }

    const newSlateValue = convertToSlateValue(value)
    setSlateValue(newSlateValue)
    previousValue.current = value
    Editor.withoutNormalizing(editor, () => {
      const point = { path: [0, 0], offset: 0 }
      Transforms.select(editor, point)

      for (let i = editor.children.length - 1; i >= 0; i--) {
        Transforms.removeNodes(editor, { at: [i] })
      }

      Transforms.insertNodes(editor, newSlateValue, { at: [0] })
    })

    setTimeout(() => {
      inputRef.current?.scrollTo({
        top: 0,
        left: inputRef.current?.scrollWidth,
        behavior: 'instant',
      })
    })
  }, [value])

  const handleSlateChange = useCallback(
    (newValue: Descendant[]) => {
      setSlateValue(newValue)
      isInternalChange.current = true
      const convertedValue = convertFromSlateValue(newValue)
      onChange(convertedValue)
      previousValue.current = convertedValue
    },
    [convertFromSlateValue, onChange],
  )

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'tag':
        return <TagElement {...props} setEditingTagId={setEditingTagId} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <span {...props.attributes}>{props.children}</span>
  }, [])

  const handleTagDeletion = (direction: 'backward' | 'forward') => {
    const { selection } = editor
    if (!selection || Range.isExpanded(selection)) return false

    const matches = Array.from(
      Editor.nodes(editor, {
        match: (n) => SlateElement.isElement(n) && n.type === 'tag',
        mode: 'highest',
      }),
    )

    if (matches.length > 0) {
      const [, tagPath] = matches[0]

      let targetPosition = null
      try {
        const adjacentPosition = direction === 'backward' ? Editor.before(editor, tagPath) : Editor.after(editor, tagPath)
        if (adjacentPosition) {
          const [adjacentNode] = Editor.node(editor, adjacentPosition)
          if ('text' in adjacentNode) {
            targetPosition = adjacentPosition
          }
        }
      } catch (error) {}

      Transforms.removeNodes(editor, {
        match: (n) => SlateElement.isElement(n) && n.type === 'tag',
        mode: 'highest',
      })

      const fallbackPosition = direction === 'backward' ? Editor.start(editor, [0]) : Editor.end(editor, [0])

      if (targetPosition) {
        try {
          Transforms.select(editor, targetPosition)
        } catch (error) {
          Transforms.select(editor, fallbackPosition)
        }
      } else {
        Transforms.select(editor, fallbackPosition)
      }
      return true
    }

    const { anchor } = selection
    const [currentNode] = Editor.node(editor, anchor.path)

    if (!('text' in currentNode)) return false

    const isAtBoundary = direction === 'backward' ? anchor.offset === 0 : anchor.offset === currentNode.text.length

    if (isAtBoundary) {
      const [parent] = Editor.parent(editor, anchor.path)
      if (SlateElement.isElement(parent) && parent.type === 'paragraph') {
        const childIndex = anchor.path[anchor.path.length - 1]
        const siblingIndex = direction === 'backward' ? childIndex - 1 : childIndex + 1

        if (
          (direction === 'backward' && childIndex > 0) ||
          (direction === 'forward' && childIndex < parent.children.length - 1)
        ) {
          const sibling = parent.children[siblingIndex]
          if (SlateElement.isElement(sibling) && sibling.type === 'tag') {
            const tagPath = [...anchor.path.slice(0, -1), siblingIndex]

            let targetPathInfo: { index: number; offset: number } | null = null

            if (direction === 'backward' && siblingIndex >= 1) {
              const beforeTagSibling = parent.children[siblingIndex - 1]
              if ('text' in beforeTagSibling) {
                const textLength = beforeTagSibling.text.length
                targetPathInfo = { index: siblingIndex - 1, offset: textLength }
              }
            } else if (direction === 'forward') {
              if (siblingIndex + 1 < parent.children.length) {
                const afterTagSibling = parent.children[siblingIndex + 1]
                if ('text' in afterTagSibling) {
                  targetPathInfo = { index: siblingIndex, offset: 0 }
                }
              }
              if (!targetPathInfo) {
                targetPathInfo = { index: childIndex, offset: currentNode.text.length }
              }
            }

            Transforms.removeNodes(editor, {
              at: tagPath,
            })

            setTimeout(() => {
              try {
                if (targetPathInfo) {
                  const targetPath = [...anchor.path.slice(0, -1), targetPathInfo.index]
                  try {
                    const [targetNode] = Editor.node(editor, targetPath)
                    if ('text' in targetNode) {
                      Transforms.select(editor, { path: targetPath, offset: targetPathInfo.offset })
                    } else {
                      const fallbackPosition = direction === 'backward' ? Editor.start(editor, [0]) : Editor.end(editor, [0])
                      Transforms.select(editor, fallbackPosition)
                    }
                  } catch (error) {
                    const fallbackPosition = direction === 'backward' ? Editor.start(editor, [0]) : Editor.end(editor, [0])
                    Transforms.select(editor, fallbackPosition)
                  }
                } else {
                  const start = Editor.start(editor, [0])
                  Transforms.select(editor, start)
                }
              } catch (error) {
                try {
                  const fallbackPosition = direction === 'backward' ? Editor.start(editor, [0]) : Editor.end(editor, [0])
                  Transforms.select(editor, fallbackPosition)
                } catch {}
              }
            })
            return true
          }
        }
      }
    }

    return false
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      return
    }

    if (event.key === 'a' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      Transforms.select(editor, {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      })
      return
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const { selection } = editor
      if (!selection || Range.isExpanded(selection)) return

      const isArrowRight = event.key === 'ArrowRight'

      try {
        const [currentNode, currentPath] = Editor.node(editor, selection.anchor.path)

        if (SlateElement.isElement(currentNode) && currentNode.type === 'tag') {
          event.preventDefault()
          if (isArrowRight) {
            const after = Editor.after(editor, currentPath)
            if (after) {
              Transforms.select(editor, after)
            } else {
              Transforms.select(editor, Editor.end(editor, [0]))
            }
          } else {
            const before = Editor.before(editor, currentPath)
            if (before) {
              Transforms.select(editor, before)
            } else {
              Transforms.select(editor, Editor.start(editor, [0]))
            }
          }
          return
        }

        if ('text' in currentNode) {
          const [parentNode] = Editor.parent(editor, currentPath)

          if (SlateElement.isElement(parentNode) && parentNode.type === 'paragraph') {
            const currentChildIndex = currentPath[currentPath.length - 1]
            const currentOffset = selection.anchor.offset

            if (isArrowRight) {
              if (currentOffset === currentNode.text.length) {
                const nextSibling = parentNode.children[currentChildIndex + 1]
                if (SlateElement.isElement(nextSibling) && nextSibling.type === 'tag') {
                  event.preventDefault()
                  const afterTag =
                    currentChildIndex + 2 < parentNode.children.length
                      ? { path: [...currentPath.slice(0, -1), currentChildIndex + 2], offset: 0 }
                      : Editor.end(editor, [0])
                  Transforms.select(editor, afterTag)
                  return
                }
              }
            } else {
              if (currentOffset === 0 && currentChildIndex > 0) {
                const prevSibling = parentNode.children[currentChildIndex - 1]
                if (SlateElement.isElement(prevSibling) && prevSibling.type === 'tag') {
                  event.preventDefault()
                  const beforeTag =
                    currentChildIndex - 2 >= 0
                      ? {
                          path: [...currentPath.slice(0, -1), currentChildIndex - 2],
                          offset:
                            parentNode.children[currentChildIndex - 2] && 'text' in parentNode.children[currentChildIndex - 2]
                              ? (parentNode.children[currentChildIndex - 2] as any).text.length
                              : 0,
                        }
                      : Editor.start(editor, [0])
                  Transforms.select(editor, beforeTag)
                  return
                }
              }
            }
          }
        }
      } catch (error) {}
    }

    if (event.key === 'Backspace') {
      const handled = handleTagDeletion('backward')
      if (handled) {
        event.preventDefault()
      }
      return
    }

    if (event.key === 'Delete') {
      const handled = handleTagDeletion('forward')
      if (handled) {
        event.preventDefault()
      }
      return
    }
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.shiftKey) {
      event.preventDefault()
      ReactEditor.focus(editor)
      try {
        const range = ReactEditor.findEventRange(editor, event.nativeEvent as MouseEvent)
        if (range) {
          Transforms.select(editor, range)
        } else {
          const end = Editor.end(editor, [0])
          Transforms.select(editor, end)
        }
      } catch (error) {
        const end = Editor.end(editor, [0])
        Transforms.select(editor, end)
      }
    }
  }

  const addTag = (tag: string, color: Color, value?: string, params?: TagInputTag['customParams'], technicalName?: string) => {
    const newTagElement: CustomInlineElement = {
      type: 'tag',
      data: {
        type: 'tag',
        value: value || '',
        color: color,
        id: `tag_${++tagIdCounter}`,
        customParams: params,
        technicalName: technicalName,
      },
      children: [{ text: tag }],
    }

    let targetSelection = savedSelection
    if (!targetSelection) {
      const endPoint = Editor.end(editor, [0])
      targetSelection = { anchor: endPoint, focus: endPoint }
    } else {
      try {
        const [parentNode] = Editor.parent(editor, targetSelection.anchor.path)

        if (SlateElement.isElement(parentNode) && parentNode.type === 'tag') {
          const afterTag = Editor.after(editor, targetSelection.anchor.path.slice(0, -1))
          if (afterTag) {
            targetSelection = { anchor: afterTag, focus: afterTag }
          } else {
            const endPoint = Editor.end(editor, [0])
            targetSelection = { anchor: endPoint, focus: endPoint }
          }
        }
      } catch (error) {
        const endPoint = Editor.end(editor, [0])
        targetSelection = { anchor: endPoint, focus: endPoint }
      }
    }

    Editor.withoutNormalizing(editor, () => {
      Transforms.select(editor, targetSelection)

      if (Range.isExpanded(targetSelection)) {
        Transforms.delete(editor)
      }

      Transforms.insertNodes(editor, newTagElement)
    })

    setTimeout(() => {
      handleSlateChange(editor.children)

      Editor.withoutNormalizing(editor, () => {
        const end = Editor.end(editor, [0])
        Transforms.select(editor, end)
        setSavedSelection({ anchor: end, focus: end })
      })

      ReactEditor.focus(editor)
    }, 0)

    setOpenSuggestions(false)
    hideFakeSelection()

    setTimeout(() => {
      const tagElement = document.getElementById(newTagElement.data.id)
      if (tagElement) {
        tagElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'end',
        })
      } else {
        inputRef.current?.scrollTo({
          top: 0,
          left: inputRef.current?.scrollWidth,
          behavior: 'smooth',
        })
      }
    }, 100)
  }

  const renderLabel = () => {
    return (
      <label className={styles.label}>
        <Text size="sm" weight="medium" color={invalid ? 'error' : 'secondary'}>
          {label}
        </Text>
      </label>
    )
  }

  const renderSuggestions = () => {
    const current = suggestions?.find((suggestion) => suggestion.key === tab)
    const currentSuggestions = current?.suggestions
    if (!currentSuggestions) return null

    return (
      <PreventDnD>
        <Flex vertical className={styles.popOverContainer}>
          {suggestions && suggestions?.length > 1 && (
            <div className={styles.slateTabsContainer}>
              <Tabs
                className={styles.suggestionTabs}
                activeKey={tab || undefined}
                onChange={(key: string) => setTab(key as 'previous_steps' | 'built_in' | 'variables')}
                type="card"
                tabs={suggestions.map((suggestion) => {
                  return {
                    key: suggestion.key,
                    label: suggestion.name,
                  }
                })}
              />
            </div>
          )}

          <Flex gap={3} vertical className={cx(styles.suggestionList, styles.fullWidth)}>
            {currentSuggestions.map((suggestion) => {
              if (suggestion.groupId != null) {
                return (
                  <Popover
                    key={suggestion.id}
                    trigger="hover"
                    placement="rightTop"
                    arrow={false}
                    noPadding
                    zIndex={POPOVER_Z_INDEX}
                    content={
                      <VariableGroupPopoverContent
                        groupId={suggestion.groupId}
                        onSelect={(variable) => {
                          addTag(variable.name, 'blue', undefined, undefined, `variable_group_variable|${suggestion.groupId}`)
                        }}
                      />
                    }
                  >
                    <div className={cx(styles.groupItem, styles.fullWidth)}>{suggestion.label}</div>
                  </Popover>
                )
              }

              return (
                <Fragment key={suggestion.id}>
                  {suggestion.value === 'custom' && <Separator type="horizontal" />}
                  <div
                    key={suggestion.id}
                    onClick={() => {
                      if (tab === 'built_in' && suggestion.value === 'custom') {
                        setOpenModal(true)
                        setOpenSuggestions(false)
                      } else {
                        addTag(suggestion.value, suggestion.color, undefined, undefined, suggestion.technicalName)
                      }
                    }}
                    className={cx({ suggestionItem: typeof suggestion.label === 'string' }, styles.fullWidth)}
                  >
                    {suggestion.label}
                  </div>
                </Fragment>
              )
            })}
            {currentSuggestions.length === 0 && current?.emptyState ? current.emptyState : null}
          </Flex>
          {tab === 'variables' && (
            <div className={styles.createVariableButton}>
              <Button
                fullWidth
                size="s"
                icon={IconPlus}
                onClick={() => {
                  setCreateVariableModalOpen(true)
                  setOpenSuggestions(false)
                }}
              >
                {t('list.variable.createGlobal')}
              </Button>
            </div>
          )}
        </Flex>
      </PreventDnD>
    )
  }

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (editor.selection) {
      setSavedSelection(editor.selection)
      if (openSuggestions) {
        showFakeSelectionAt(editor.selection)
      }
    }
    onBlur?.(event)
  }

  const showFakeSelectionAt = useCallback(
    (selection: Range) => {
      try {
        const domRange = ReactEditor.toDOMRange(editor, selection)
        const rects = domRange.getClientRects()
        const containerRect = containerRef.current?.getBoundingClientRect()

        if (rects.length > 0 && containerRect) {
          let left = Infinity
          let right = -Infinity
          for (const r of Array.from(rects)) {
            left = Math.min(left, r.left)
            right = Math.max(right, r.right)
          }
          setFakeSelectionRect({
            left: left - containerRect.left,
            top: 0,
            width: Range.isExpanded(selection) ? right - left : 2,
            height: containerRect.height,
          } as DOMRect)
          setShowFakeSelection(true)
        }
      } catch (error) {
        setShowFakeSelection(false)
      }
    },
    [editor],
  )

  const hideFakeSelection = useCallback(() => {
    setShowFakeSelection(false)
    setFakeSelectionRect(null)
  }, [])

  useEffect(() => {
    if (editingTagId) {
      setOpenModal(true)
    }
  }, [editingTagId])

  const handleVariableSuccess = (variable: Variable) => {
    addTag(variable.name, 'blue', variable.name, undefined, variable.name)
  }

  return (
    <>
      <Flex vertical className={cx({ fullWidth: fullWidth })}>
        {label && renderLabel()}
        <Flex className={cx(styles.inputContainer, { fullWidth: fullWidth }, className)}>
          <div
            ref={containerRef}
            className={cx(styles.input, styles.slateContainer, {
              disabled: disabled,
              fullWidth: fullWidth,
              noStartPadding: shouldHideStartPadding,
              borderless,
            })}
          >
            <Slate editor={editor} initialValue={slateValue} onValueChange={handleSlateChange}>
              <Editable
                placeholder={placeholder}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                onFocus={onFocus}
                onBlur={handleBlur}
                ref={inputRef}
                className={cx(styles.slateEditable, {
                  noStartPadding: shouldHideStartPadding,
                })}
                onKeyDown={handleKeyDown}
                onMouseDown={handleMouseDown}
                disabled={disabled}
                readOnly={disabled}
              />
            </Slate>
            {showFakeSelection && fakeSelectionRect && (
              <div
                style={{
                  position: 'absolute',
                  left: fakeSelectionRect.left,
                  width: fakeSelectionRect.width,
                  height: 26,
                  backgroundColor: Range.isExpanded(savedSelection || ({} as Range)) ? 'rgba(0, 123, 255, 0.3)' : 'transparent',
                  borderLeft: Range.isExpanded(savedSelection || ({} as Range)) ? 'none' : '1px solid #007bff',
                  pointerEvents: 'none',
                  zIndex: 1000,
                }}
              />
            )}
          </div>
          <Popover
            noPadding
            arrow={false}
            placement="bottomLeft"
            zIndex={POPOVER_Z_INDEX}
            content={renderSuggestions()}
            open={openSuggestions}
            setOpen={(open) => {
              setOpenSuggestions(open)
              if (!open) {
                hideFakeSelection()
              }
            }}
            active={openSuggestions && !!suggestions?.length && !disabled}
          >
            <div
              className={cx(styles.suffix, { borderless })}
              onClick={(e) => {
                if (disabled !== true && !!suggestions?.length) {
                  if (!openSuggestions && savedSelection) {
                    showFakeSelectionAt(savedSelection)
                  }
                  setOpenSuggestions(!openSuggestions)
                  if (openSuggestions) {
                    hideFakeSelection()
                  }
                }
              }}
            >
              <IconBraces color="var(--color-text-primary)" size={12} />
            </div>
          </Popover>
        </Flex>
      </Flex>
      <VariableModal
        open={createVariableModalOpen}
        setOpen={setCreateVariableModalOpen}
        onSuccess={handleVariableSuccess}
        defaultValue={savedSelection && Range.isExpanded(savedSelection) ? Editor.string(editor, savedSelection) : undefined}
      />
      {openModal && (
        <CustomBuiltInModal
          open={openModal}
          setOpen={(open) => {
            setOpenModal(open)
            if (!open) {
              setEditingTagId(null)
            }
          }}
          onSave={(type, params) => {
            const tagName = type === 'random_text' ? 'Random text' : type === 'random_number' ? 'Random number' : 'Random date'
            if (!!editingTag) {
              const newTag = {
                ...editingTag,
                customParams: params,
              }

              let tagFound = false

              isInternalChange.current = true
              Editor.withoutNormalizing(editor, () => {
                for (let i = 0; i < editor.children.length; i++) {
                  const paragraph = editor.children[i]
                  if (SlateElement.isElement(paragraph) && paragraph.type === 'paragraph') {
                    for (let j = 0; j < paragraph.children.length; j++) {
                      const child = paragraph.children[j]
                      if (SlateElement.isElement(child) && child.type === 'tag' && child.data.id === editingTag.id) {
                        Transforms.setNodes(
                          editor,
                          {
                            data: newTag,
                          },
                          { at: [i, j] },
                        )

                        tagFound = true
                        break
                      }
                    }
                    if (tagFound) break
                  }
                }
              })

              setTimeout(() => {
                const convertedValue = convertFromSlateValue(editor.children)
                onChange(convertedValue)
                previousValue.current = convertedValue
              })
            } else {
              addTag(tagName, 'tertiary', tagName, params as any, type)
            }
            setOpenModal(false)
            setEditingTagId(null)
          }}
          initialValues={editingTag?.customParams}
          initialType={editingTag?.technicalName as any}
        />
      )}
    </>
  )
}

const DefaultElement = (props: RenderElementProps) => {
  return (
    <div {...props.attributes} className={cx(styles.defaultElement)}>
      {props.children}
    </div>
  )
}

const TagElement = (props: RenderElementProps & { setEditingTagId: (id: string) => void }) => {
  const { element } = props
  const selected = useSelected()
  const focused = useFocused()
  if (element.type === 'tag') {
    const tagData = element.data
    const isVariable = tagData.color === VARIABLE_TAG_COLOR

    if (isVariable) {
      const variableGroupId = parseVariableGroupId(tagData.technicalName)
      const bucket = variableGroupId ? { variable_group_id: variableGroupId } : null

      return (
        <span
          id={tagData.id}
          {...props.attributes}
          contentEditable={false}
          className={cx(styles.tagWrapper, { tagSelected: selected && focused })}
        >
          <VariableTag variable={tagData.value || ''} bucket={bucket}>
            {props.children}
          </VariableTag>
        </span>
      )
    }

    return (
      <span {...props.attributes} contentEditable={false} className={cx(styles.tagWrapper, { tagSelected: selected && focused })}>
        <span
          id={tagData.id}
          className={cx(styles.tag, `tag--${tagData.color}`, { clickable: !!element.data.customParams })}
          onClick={() => {
            if (!!element.data.customParams) {
              props.setEditingTagId(tagData.id)
            }
          }}
        >
          {props.children}
        </span>
      </span>
    )
  }
  return <span {...props.attributes}>{props.children}</span>
}

type VariableGroupPopoverContentProps = {
  groupId: number
  onSelect: (variable: Variable) => void
}

const VariableGroupPopoverContent = ({ groupId, onSelect }: VariableGroupPopoverContentProps) => {
  const { product } = useParams()
  const [t] = useTranslation('variables')
  const { variableGroupVariables } = useVariableGroupVariables(product, groupId)

  return (
    <Flex vertical className={styles.subPopoverContainer}>
      <Flex gap={3} vertical className={cx(styles.suggestionList, styles.fullWidth)}>
        {(variableGroupVariables ?? []).map((variable: Variable) => (
          <div
            key={`groupVar_${variable.id}`}
            onClick={() => onSelect(variable)}
            className={cx(styles.suggestionItem, styles.fullWidth)}
          >
            <GlobalVarLabel label={variable.name} />
          </div>
        ))}
        {variableGroupVariables?.length === 0 && (
          <Text size="sm" color="third">
            {t('drawer.noVariables.title')}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}

export default SlateInputTag
