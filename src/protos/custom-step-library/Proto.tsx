import { useMemo, useState } from 'react'
import Prism from 'prismjs'
import {
  Breadcrumb,
  ButtonGroup,
  Button,
  Tabs,
  Banner,
  Modal,
  Alert,
  Input,
  Select,
  SearchInput,
  Dropdown,
  CircleIcon,
  TooltipText,
  useNotification,
  IconColouredLogo,
  IconCode,
  IconDownload,
  IconPencil,
  IconTrash,
  IconMinusCircle,
  IconPlus,
  IconBraces,
  IconArrowRight,
  IconZap,
  IconSparkle,
  IconPlay,
  IconClose,
  IconSquareArrowOutUpRight,
  IconMoreHorizontal,
  IconSave,
  IconLock,
  IconMonitor,
  IconStar,
  IconEye,
  IconBell,
  IconGauge,
  IconMonitorCheck,
  IconMonitorSmartphone,
  IconHistory,
  IconSmartphone,
  IconChromium,
  IconBot,
  IconFlag,
  IconGlobe,
  IconCommand,
  IconCornerDownLeft,
} from '@kapptivate/ui-kit'
import { useReportScreen } from '../../context/ScreenContext'
import styles from './custom-step-library.module.scss'
import {
  IN_HOUSE_STEPS,
  INSERTABLE_VARS,
  CHECK_URL_CODE,
  RANDOM_NUMBER_CODE,
  type LibStep,
} from './constants'

let uid = 100
const nextId = () => `cs${++uid}`

// Noms de tests fictifs pour le tooltip « Used in N tests ».
const TEST_NAMES = [
  'Checkout flow',
  'Login smoke test',
  'PDF invoice check',
  'Signup flow',
]
const usageTooltip = (n: number) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {TEST_NAMES.slice(0, n).map((t) => (
      <span key={t}>{t}</span>
    ))}
  </div>
)


// Générateur « IA » du proto : à partir d'un prompt, renvoie un bout de code
// custom plausible. Simple mapping par mots-clés + template générique.
const PDF_IMAGE_CODE = `await test.assert("PDF contains at least one image", async () => {
  const file = await step.getAttachment();
  const pdf = await parser.read(file);

  const images = pdf.pages.flatMap((page) => page.images);
  if (images.length === 0) {
    throw new Error("No image found in the PDF.");
  }

  return \`Found \${images.length} image(s) in the PDF.\`;
});`

const generateCode = (prompt: string): string => {
  const p = prompt.toLowerCase()
  if (p.includes('pdf') || p.includes('image')) return PDF_IMAGE_CODE
  if (p.includes('url')) return CHECK_URL_CODE
  if (p.includes('random') || p.includes('number')) return RANDOM_NUMBER_CODE
  const label = prompt.replace(/"/g, "'")
  return `await test.assert("${label}", async () => {
  // Generated from: ${label}
  const result = true;

  if (!result) {
    throw new Error("Assertion failed.");
  }

  return "Check passed.";
});`
}

/* -------------------------------------------------------------
 *  Éditeur de code : couche colorée (Prism) + textarea transparente.
 *  Deux thèmes via `dark` (inline light / plein écran dark).
 * ----------------------------------------------------------- */
const CodeEditor = ({
  value,
  onChange,
  dark,
  minRows = 6,
  placeholder,
  fixed,
}: {
  value: string
  onChange: (v: string) => void
  dark?: boolean
  minRows?: number
  placeholder?: string
  /** hauteur figée + scroll interne (panneau) pour que le footer ne bouge pas */
  fixed?: boolean
}) => {
  const html = useMemo(
    () => Prism.highlight(value, Prism.languages.javascript, 'javascript'),
    [value],
  )
  const rows = Math.max(minRows, value.split('\n').length)
  const gutter = Array.from({ length: rows }, (_, i) => i + 1).join('\n')
  return (
    <div
      className={`${styles.editor} ${dark ? styles.editorDark : styles.editorLight} ${
        fixed ? styles.editorScroll : ''
      }`}
    >
      <div className={styles.editorGutter}>{gutter}</div>
      <div className={styles.editorMain}>
        <pre
          aria-hidden
          className={styles.editorHl}
          dangerouslySetInnerHTML={{ __html: html + '\n' }}
        />
        <textarea
          className={styles.editorInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          rows={rows}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

type EditorTarget = { open: boolean; item: LibStep | null }
type AiMessage = { role: 'user' | 'ai'; text: string }

const Proto = () => {
  const { notification } = useNotification()

  // --- état de l'étape « Custom step » configurée dans le test ---
  // Une Custom step EST un éditeur de code par défaut. `libItem` renseigné =
  // la step est liée à une étape de la bibliothèque (édition propagée).
  const [code, setCode] = useState('') // code écrit à la main
  const [libItem, setLibItem] = useState<LibStep | null>(null) // étape liée à la lib

  // étape « Custom step » telle qu'affichée dans le canvas
  const [stepKind, setStepKind] = useState('custom')
  const [stepDesc, setStepDesc] = useState('')

  // sélection : null = aucune step sélectionnée → panneau test (Preview) à droite
  const [selStep, setSelStep] = useState<number | null>(null)

  // --- bibliothèque (mutable : on peut y ajouter une étape) ---
  const [library, setLibrary] = useState<LibStep[]>(IN_HOUSE_STEPS)

  // --- modales ---
  const [libOpen, setLibOpen] = useState(false)
  const [libQuery, setLibQuery] = useState('')
  const [editor, setEditor] = useState<EditorTarget>({ open: false, item: null })
  const [editorCode, setEditorCode] = useState('')
  const [consoleRan, setConsoleRan] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([])
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<LibStep | null>(null)
  const [addLibOpen, setAddLibOpen] = useState(false)
  const [addName, setAddName] = useState('')
  const [addDesc, setAddDesc] = useState('')

  useReportScreen(`csl:${selStep ? (libItem ? 'linked' : 'code') : 'test'}`)

  /* --------------------------- actions --------------------------- */

  // Ouvre l'éditeur plein écran. `item` renseigné → on édite une étape de la
  // bibliothèque (propagation), sinon on édite le code manuel du step.
  const openEditor = (item: LibStep | null, initial: string) => {
    setEditorCode(initial)
    setConsoleRan(false)
    setAiText('')
    setAiMessages([])
    setEditor({ open: true, item })
  }

  // Assistant IA du proto : le prompt génère du code inséré dans l'éditeur.
  const sendAi = () => {
    const prompt = aiText.trim()
    if (!prompt) return
    setEditorCode(generateCode(prompt))
    setAiMessages((m) => [
      ...m,
      { role: 'user', text: prompt },
      {
        role: 'ai',
        text: `Here's a custom step for "${prompt}". I've added it to the editor. Review it, then click Test code to run it.`,
      },
    ])
    setAiText('')
  }

  const closeEditor = () => setEditor({ open: false, item: null })

  const saveEditor = () => {
    // Étape de bibliothèque → le changement se propage : on confirme d'abord.
    if (editor.item) {
      setConfirmSave(true)
      return
    }
    // Code manuel : sauvegarde directe.
    setCode(editorCode)
    notification.success('Custom code saved successfully')
    closeEditor()
  }

  // Confirmé depuis la modale d'alerte de propagation.
  const confirmSaveLibrary = () => {
    const item = editor.item
    if (!item) return
    setLibrary((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, code: editorCode } : s)),
    )
    setLibItem((cur) => (cur && cur.id === item.id ? { ...cur, code: editorCode } : cur))
    const used = item.usedIn
    notification.success(
      `Changes saved. ${used} ${used > 1 ? 'tests' : 'test'} using this step ${used > 1 ? 'were' : 'was'} updated.`,
    )
    setConfirmSave(false)
    closeEditor()
  }

  const runCode = () => setConsoleRan(true)

  const insertVar = (name: string) => setEditorCode((c) => `${c}{{${name}}}`)

  // Utiliser une étape de la bibliothèque = la lier au step (pas une copie).
  // Pas de toast : ce n'est pas un « import », juste une réutilisation.
  const importStep = (step: LibStep) => {
    setLibItem(step)
    setStepDesc(step.name)
    setLibOpen(false)
  }

  const removeImported = () => {
    setLibItem(null)
    setStepDesc('')
  }

  // Suppression d'une étape de la bibliothèque : confirmée car elle est
  // utilisée dans des tests (la supprimer casse le step dans ces tests).
  const confirmDelete = () => {
    const t = deleteTarget
    if (!t) return
    setLibrary((prev) => prev.filter((x) => x.id !== t.id))
    if (libItem?.id === t.id) {
      setLibItem(null)
      setStepDesc('')
    }
    setDeleteTarget(null)
  }

  const submitAddToLibrary = () => {
    const name = addName.trim()
    if (!name) return
    const created: LibStep = {
      id: nextId(),
      name,
      description: addDesc.trim(),
      code,
      usedIn: 1,
    }
    setLibrary((prev) => [created, ...prev])
    setLibItem(created)
    setStepDesc(created.name)
    setAddLibOpen(false)
    setAddName('')
    setAddDesc('')
    notification.success('Custom step added to library successfully')
  }

  const filteredLib = library.filter((s) => {
    const q = libQuery.trim().toLowerCase()
    if (!q) return true
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    )
  })

  /* --------------------------- rendus --------------------------- */

  const varChips = (item: LibStep) =>
    item.vars && item.vars.length > 0 ? (
      <div className={styles.libCardVars}>
        {item.vars.map((v) => (
          <span
            key={v.label}
            className={v.kind === 'arrow' ? styles.varChipArrow : styles.varChip}
          >
            {v.kind === 'arrow' ? <IconArrowRight size={10} /> : <IconBraces size={10} />}
            {v.label}
          </span>
        ))}
      </div>
    ) : null

  // Corps de l'onglet General.
  // Défaut = éditeur de code (une Custom step EST du code). Si la step est liée
  // à une étape de la bibliothèque (`libItem`), on affiche la carte liée à la
  // place, dont l'édition se propage à tous les tests.
  const generalTab = () => {
    if (libItem) {
      return (
        <div className={styles.general}>
          <div className={styles.libCard} data-anchor="cs-lib-card">
            <CircleIcon variant="primary" icon={<IconCode />} size={40} />
            <div className={styles.libCardMain}>
              <span className={styles.libCardName}>{libItem.name}</span>
              {libItem.description && (
                <span className={styles.libCardDesc}>{libItem.description}</span>
              )}
              {varChips(libItem)}
            </div>
            <div className={styles.libCardActions}>
              <Button
                color="secondary"
                size="s"
                icon={IconEye}
                onClick={() => openEditor(libItem, libItem.code)}
              >
                View
              </Button>
              <Button
                color="danger-s"
                size="s"
                icon={IconMinusCircle}
                onClick={removeImported}
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={styles.general}>
        <div className={styles.codeBlock}>
          <div className={styles.codeHead}>
            <span className={styles.codeHeadTitle}>Custom code</span>
            <div className={styles.codeHeadActions}>
              <Button
                color="secondary"
                size="s"
                icon={IconDownload}
                onClick={() => setLibOpen(true)}
              >
                Use from library
              </Button>
              <Button
                color="secondary"
                size="s"
                icon={IconSave}
                disabled={!code.trim()}
                onClick={() => setAddLibOpen(true)}
              >
                Save as…
              </Button>
            </div>
          </div>
          <CodeEditor
            value={code}
            onChange={setCode}
            minRows={8}
            fixed
            placeholder="// Write your custom step here…"
          />
          <div className={styles.codeFooter}>
            <Button
              color="secondary"
              size="s"
              fullWidth
              icon={IconSquareArrowOutUpRight}
              onClick={() => openEditor(null, code)}
            >
              Open in fullscreen editor
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Panneau test (aucune step sélectionnée) : Live browser + Last results.
  const livePane = () => (
    <div className={styles.livePane}>
      <div className={styles.liveScreen}>
        <div className={styles.liveHint}>
          <span>Click</span>
          <Button color="secondary" size="s" icon={IconPlay}>Run</Button>
          <span>or press</span>
          <span className={styles.keycap}><IconCommand size={13} /></span>
          <span>+</span>
          <span className={styles.keycap}><IconCornerDownLeft size={13} /></span>
          <span>to see screenshots here.</span>
        </div>
      </div>
      <div className={styles.lastResults}>Last results (0)</div>
      <div className={styles.lastResultsBody} />
    </div>
  )

  const testPlaceholder = (label: string) => (
    <div className={styles.libEmpty}>{label} settings live here.</div>
  )

  const RAIL_SECTIONS = [
    [IconMonitorCheck, IconEye, IconBell, IconGauge],
    [IconSmartphone, IconMonitorSmartphone, IconZap, IconHistory],
    [IconSmartphone, IconChromium, IconBot],
  ]

  return (
    <div className={styles.app}>
      {/* ---------- rail ---------- */}
      <nav className={styles.rail}>
        <div className={styles.railLogo}>
          <img src="/logo-yellow.svg" alt="Kapptivate" className={styles.railLogoImg} />
          <button className={styles.railCollapse} aria-label="Collapse sidebar">
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5807 2H4.2474C3.51102 2 2.91406 2.59695 2.91406 3.33333V12.6667C2.91406 13.403 3.51102 14 4.2474 14H13.5807C14.3171 14 14.9141 13.403 14.9141 12.6667V3.33333C14.9141 2.59695 14.3171 2 13.5807 2Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.91406 2V14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.2461 6L12.2461 8L10.2461 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className={styles.railWorkspace}>
          <button className={styles.railWsMode} aria-label="Workspace mode">
            <IconEye size={16} />
          </button>
          <span className={styles.railWsLogo}>
            <img src="/operator-logo.svg" alt="" />
          </span>
        </div>

        <div className={styles.railSections}>
          {RAIL_SECTIONS.map((section, s) => (
            <div key={`s${s}`} className={styles.railSection}>
              {section.map((Icon, i) => (
                <button
                  key={`s${s}i${i}`}
                  className={Icon === IconZap ? styles.railItemActive : styles.railItem}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.railHelp}>
          <button className={styles.railHelpBtn} aria-label="Help">
            <svg width="32" height="34" viewBox="2 2 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="2" width="32" height="32" rx="16" fill="#1C4A47" />
              <rect x="0.5" y="2.5" width="31" height="31" rx="15.5" stroke="white" strokeOpacity="0.5" />
              <path d="M13.0898 14.9996C13.3249 14.3313 13.789 13.7677 14.3998 13.4087C15.0106 13.0498 15.7287 12.9185 16.427 13.0383C17.1253 13.1581 17.7587 13.5211 18.2149 14.0631C18.6712 14.6051 18.9209 15.2911 18.9198 15.9996C18.9198 17.9996 15.9198 18.9996 15.9198 18.9996" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 23H16.01" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ---------- workspace ---------- */}
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.crumb}>
            <Breadcrumb items={[{ title: 'Tests' }, { title: 'Checkout flow' }]} />
          </div>
          <div className={styles.topActions}>
            <ButtonGroup>
              <Button color="secondary" size="m" icon={IconLock} />
              <Button color="secondary" size="m" icon={IconMonitor} />
              <Button color="secondary" size="m" icon={IconStar} />
              <Button color="danger-s" size="m" icon={IconTrash} />
            </ButtonGroup>
            <Button color="secondary" size="m" icon={IconSave}>Save</Button>
            <Button color="primary" size="m" icon={IconZap}>Run</Button>
          </div>
        </header>

        <div className={styles.body}>
          {/* ---- canvas ---- (clic hors step = désélection → panneau test) */}
          <div className={styles.canvas} onClick={() => setSelStep(null)}>
            <div className={styles.canvasInner}>
              <div className={styles.startRow} data-anchor="start-row">
                <span className={styles.startFlag}><IconFlag size={16} /></span>
                <span className={styles.startLabel}>
                  <IconGlobe size={15} /> Navigate to starting page
                </span>
                <div className={styles.startField}>
                  <Input size="s" fullWidth value="https://app.example.com" mono onChange={() => {}} />
                </div>
              </div>

              <span className={styles.connector} />

              <div className={styles.stepGroup}>
                <div className={styles.stepGroupHead}>
                  <span className={styles.stepGroupMark}>
                    <IconColouredLogo size={32} />
                  </span>
                  <div>
                    <div className={styles.stepGroupTitle}>Step group #1</div>
                    <div className={styles.stepGroupSub}>1 step</div>
                  </div>
                  <button className={styles.stepGroupMore}>
                    <IconMoreHorizontal size={18} />
                  </button>
                </div>

                <div
                  className={selStep === 1 ? styles.stepBodySelected : styles.stepBody}
                  data-anchor="step-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelStep(1)
                  }}
                >
                  <div className={styles.stepCard}>
                    <div className={styles.stepTop}>
                      <span className={selStep === 1 ? styles.stepNumActive : styles.stepNum}>1</span>
                      <Select
                        size="s"
                        width="160px"
                        className={styles.stepActionSelect}
                        icon={IconCode}
                        options={[{ label: 'Custom step', value: 'custom' }]}
                        value={stepKind}
                        onChange={(...args: unknown[]) => {
                          const v = args.find((a) => typeof a === 'string') as string | undefined
                          if (v) setStepKind(v)
                        }}
                      />
                      <span className={styles.canvasField}>
                        <Input
                          size="s"
                          fullWidth
                          placeholder="Describe your step here…"
                          value={stepDesc}
                          onChange={(e) => setStepDesc(e.target.value)}
                        />
                      </span>
                      <button className={styles.stepGroupMore} aria-label="Step options">
                        <IconMoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.stepFooter}>
                  <Button color="invisible" size="s" icon={IconPlus}>Add step…</Button>
                  <Button color="secondary" size="s" icon={IconPlay}>Use recorder</Button>
                </div>
              </div>

              <span className={styles.connector} />
              <button className={styles.plusNode}>
                <IconPlus size={16} />
              </button>
            </div>
          </div>

          {/* ---- right panel : step sélectionnée → réglages ; sinon → panneau test ---- */}
          <aside className={styles.panel}>
            {selStep === 1 ? (
              <>
                <div className={styles.panelHeader} data-anchor="panel-header">
                  <span className={styles.panelTitleNum}>1</span>
                  <span className={styles.panelTitle}>Custom step</span>
                  <span className={styles.panelTitleEdit}><IconPencil size={13} /></span>
                  <div className={styles.panelHeaderActions}>
                    <Dropdown
                      trigger="click"
                      placement="bottomRight"
                      menu={{
                        items: [
                          { key: 'open', label: 'Open in new tab', icon: <IconSquareArrowOutUpRight size={14} /> },
                          { key: 'duplicate', label: 'Duplicate', icon: <IconCode size={14} /> },
                          { type: 'divider' as const },
                          { key: 'delete', label: 'Delete', danger: true, icon: <IconTrash size={14} /> },
                        ],
                      }}
                    >
                      <Button color="secondary" size="s" icon={IconMoreHorizontal} />
                    </Dropdown>
                  </div>
                </div>

                <Tabs
                  className={styles.panelTabs}
                  type="card"
                  activeKey="general"
                  tabs={[
                    { key: 'general', label: 'General', children: generalTab() },
                    { key: 'advanced', label: 'Advanced settings', children: <div className={styles.libEmpty}>No advanced settings.</div> },
                  ]}
                />
              </>
            ) : (
              <Tabs
                className={styles.panelTabs}
                type="card"
                activeKey="live"
                tabs={[
                  { key: 'live', label: 'Live browser', children: livePane() },
                  { key: 'settings', label: 'Test settings', children: testPlaceholder('Test') },
                  { key: 'history', label: 'Version history', children: testPlaceholder('Version history') },
                ]}
              />
            )}
          </aside>
        </div>
      </div>

      {/* ===================== LIBRARY MODAL ===================== */}
      {libOpen && (
        <Modal open width={800} title="Custom steps library" onCancel={() => setLibOpen(false)}>
          <Modal.Content>
                      <div className={styles.libModalHead}>
                        <div className={styles.libSearch}>
                          <SearchInput
                            placeholder="Search…"
                            value={libQuery}
                            onChange={(v: string) => setLibQuery(v)}
                          />
                        </div>
                        <div className={styles.libModalCreate}>
                          <Button
                            color="secondary"
                            size="m"
                            icon={IconPlus}
                            onClick={() => {
                              setLibOpen(false)
                              openEditor(null, '')
                            }}
                          >
                            Create custom step
                          </Button>
                        </div>
                      </div>

                      {filteredLib.length === 0 ? (
                        <div className={styles.libEmpty}>No custom step matches your search.</div>
                      ) : (
                        <div className={styles.libList}>
                          {filteredLib.map((s) => (
                            <div
                              key={s.id}
                              className={styles.libRow}
                              onClick={() => importStep(s)}
                            >
                              <CircleIcon variant="primary" icon={<IconCode />} size={32} />
                              <div className={styles.libRowMain}>
                                <span className={styles.libCardName}>{s.name}</span>
                                {s.description && (
                                  <span className={styles.libCardDesc}>{s.description}</span>
                                )}
                                {varChips(s)}
                              </div>
                              <div className={styles.libRowRight}>
                                <TooltipText
                                  size="sm"
                                  text={`Used in ${s.usedIn} ${s.usedIn > 1 ? 'tests' : 'test'}`}
                                  tooltip={usageTooltip(s.usedIn)}
                                />
                                <span onClick={(e) => e.stopPropagation()}>
                                  <Dropdown
                                    trigger="click"
                                    placement="bottomRight"
                                    menu={{
                                      items: [
                                        {
                                          key: 'edit',
                                          label: 'Edit',
                                          icon: <IconPencil size={14} />,
                                          onClick: () => openEditor(s, s.code),
                                        },
                                        { type: 'divider' as const },
                                        {
                                          key: 'delete',
                                          label: 'Delete',
                                          danger: true,
                                          icon: <IconTrash size={14} />,
                                          onClick: () => setDeleteTarget(s),
                                        },
                                      ],
                                    }}
                                  >
                                    <Button color="secondary" size="s" icon={IconMoreHorizontal} />
                                  </Dropdown>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
          </Modal.Content>
        </Modal>
      )}

      {/* ===================== FULLSCREEN EDITOR MODAL ===================== */}
      {editor.open && (
        <Modal
          open
          width="92vw"
          className={styles.editorModal}
          onCancel={closeEditor}
          title={editor.item ? `Edit custom step "${editor.item.name}"` : 'Edit custom step'}
          // extraHeaderRight (non typé dans l'ui-kit) rend le contenu juste à
          // gauche de la croix → boutons parfaitement alignés à droite.
          {...({
            extraHeaderRight: (
              <Button color="primary" size="m" onClick={saveEditor}>
                Save changes
              </Button>
            ),
          } as any)}
        >
          <Modal.Content hasPadding={false}>
            {editor.item && (
              <Banner
                className={styles.flushBanner}
                variant="primary"
                description="You are editing a library step. Any changes will automatically update this step in all other tests where it is used."
              />
            )}
            <div className={styles.editorStage}>
              {/* colonne IA */}
              <div className={styles.aiPane}>
                {aiMessages.length === 0 ? (
                  <div className={styles.aiHint}>
                    <span className={styles.aiSparkle}><IconSparkle size={18} /></span>
                    <span>
                      Need help to write your custom step?
                      <br />
                      Ask our AI!
                    </span>
                  </div>
                ) : (
                  <div className={styles.aiThread}>
                    {aiMessages.map((m, i) => (
                      <div
                        key={i}
                        className={m.role === 'user' ? styles.aiMsgUser : styles.aiMsgAi}
                      >
                        {m.role === 'ai' && (
                          <span className={styles.aiMsgSparkle}><IconSparkle size={13} /></span>
                        )}
                        {m.text}
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.aiInput}>
                  <input
                    className={styles.aiInputField}
                    placeholder="Ask anything"
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendAi()
                    }}
                  />
                  <button className={styles.aiSend} aria-label="Send" onClick={sendAi}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                      <path d="m21.854 2.147-10.94 10.939" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* colonne code */}
              <div className={styles.codePane}>
                <div className={styles.codePaneTop}>
                  <div className={styles.codeTools}>
                    <Dropdown
                      trigger="click"
                      placement="bottomRight"
                      menu={{
                        items: INSERTABLE_VARS.map((v) => ({
                          key: v,
                          label: v,
                          icon: <IconBraces size={14} />,
                          onClick: () => insertVar(v),
                        })),
                      }}
                    >
                      <button className={styles.codeToolBtn}>
                        <IconPlus size={12} /> Insert variable
                      </button>
                    </Dropdown>
                    <button className={styles.codeToolBtn} onClick={runCode}>
                      <IconPlay size={12} /> Test code
                    </button>
                  </div>
                  <CodeEditor
                    value={editorCode}
                    onChange={setEditorCode}
                    dark
                    minRows={20}
                    placeholder="// Write your custom step here, or ask the AI to generate it"
                  />
                </div>

                <div className={styles.consoleBar}>
                  <span className={styles.consoleBarTitle}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m7 11 2-2-2-2" />
                      <path d="M11 13h4" />
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                    </svg>
                    Console
                  </span>
                  <div className={styles.consoleBarActions}>
                    <button className={styles.consoleBtn} onClick={() => setConsoleRan(false)}>
                      Clear
                    </button>
                    <button className={styles.consoleIconBtn} aria-label="Close console">
                      <IconClose size={12} />
                    </button>
                  </div>
                </div>

                <div className={styles.consolePane}>
                  {consoleRan ? (
                    <>
                      <div className={styles.consoleLine}><span className={styles.consoleDim}>&gt;</span> Running custom step…</div>
                      <div className={styles.consoleLine}>Executing in sandbox…</div>
                      <div className={`${styles.consoleLine} ${styles.consoleOk}`}>✓ Step executed successfully in 42ms</div>
                    </>
                  ) : (
                    <div className={styles.consoleEmpty}>
                      No logs yet. Click "Test code" to run your code.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal.Content>
        </Modal>
      )}

      {/* Confirmation de propagation avant de sauver une étape de bibliothèque */}
      <Alert
        open={confirmSave}
        title="Save changes to this custom step?"
        okText="Save changes"
        cancelText="Cancel"
        onOk={confirmSaveLibrary}
        onCancel={() => setConfirmSave(false)}
      >
        {editor.item
          ? `"${editor.item.name}" is used in ${editor.item.usedIn} ${
              editor.item.usedIn > 1 ? 'tests' : 'test'
            }. Saving will update this step in every test that uses it.`
          : ''}
      </Alert>

      {/* Confirmation de suppression d'une étape utilisée */}
      <Alert
        open={!!deleteTarget}
        danger
        title="Delete this custom step?"
        okText="Delete"
        cancelText="Cancel"
        onOk={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      >
        {deleteTarget
          ? `"${deleteTarget.name}" is used in ${deleteTarget.usedIn} ${
              deleteTarget.usedIn > 1 ? 'tests' : 'test'
            }. Deleting it will remove this step from those tests.`
          : ''}
      </Alert>

      {/* ===================== ADD TO LIBRARY MODAL ===================== */}
      {addLibOpen && (
        <Modal
          open
          width={600}
          title="Add custom step to library"
          className={styles.bannerModal}
          onCancel={() => setAddLibOpen(false)}
        >
          <Banner
            className={styles.flushBanner}
            variant="primary"
            description="Add your custom coded steps to the library to easily reuse them later."
          />
          <Modal.Content>
            <div className={styles.addLibForm}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Custom step name</span>
                <Input
                  fullWidth
                  placeholder="Check URL"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Description (optional)</span>
                <Input
                  fullWidth
                  placeholder="This custom step checks…"
                  value={addDesc}
                  onChange={(e) => setAddDesc(e.target.value)}
                />
              </div>
            </div>
          </Modal.Content>
          <Modal.Footer>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button color="invisible" onClick={() => setAddLibOpen(false)}>Cancel</Button>
              <Button color="primary" disabled={!addName.trim()} onClick={submitAddToLibrary}>
                Add to library
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}

export default Proto
