/* Converts a rendered design-system page (live DOM) into clean Markdown.
   Works off computed styles rather than hard-coded classes, so it stays
   correct across every doc page (tone of voice, components, foundations…). */

const BLOCK_DISPLAY = /(^|\s)(block|grid|flex|table|list-item|flow-root)/
const SKIP_TAGS = new Set(['svg', 'img', 'input', 'button', 'style', 'script', 'noscript'])

/** page title → #, section (h5) → ##, sub-section (h6) → ### */
const HEADING_LEVEL: Record<string, number> = { h1: 1, h2: 1, h3: 2, h4: 2, h5: 2, h6: 3 }

const ws = (s: string) => s.replace(/\s+/g, ' ')

const style = (el: Element) => window.getComputedStyle(el)

const isHidden = (el: Element) => style(el).display === 'none'

const isMono = (el: Element) => style(el).fontFamily.toLowerCase().includes('mono')

const isBlock = (el: Element) => BLOCK_DISPLAY.test(style(el).display)

const hasBlockChild = (el: Element) =>
  Array.from(el.children).some((c) => !isHidden(c) && isBlock(c))

/** Inline Markdown for a node's subtree (bold / italic / code / links / breaks). */
function inlineMd(node: Node): string {
  let out = ''
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += child.textContent ?? ''
      return
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return
    const el = child as Element
    const tag = el.tagName.toLowerCase()
    if (SKIP_TAGS.has(tag) || isHidden(el)) return
    if (tag === 'br') {
      out += ' '
      return
    }
    const inner = inlineMd(el)
    if (!inner.trim()) return
    if (tag === 'strong' || tag === 'b') out += `**${inner}**`
    else if (tag === 'em' || tag === 'i') out += `*${inner}*`
    else if (tag === 'code' || (isMono(el) && !isBlock(el))) out += `\`${inner}\``
    else if (tag === 'a') out += `[${inner}](${(el as HTMLAnchorElement).getAttribute('href') ?? ''})`
    else out += inner
  })
  return out
}

function tableMd(table: HTMLTableElement): string {
  const rowText = (row: HTMLTableRowElement) =>
    Array.from(row.cells).map((c) => ws(inlineMd(c)).trim().replace(/\|/g, '\\|'))
  const head = table.tHead?.rows[0]
  const bodyRows = Array.from(table.tBodies).flatMap((b) => Array.from(b.rows))
  const cols = head ? rowText(head) : rowText(bodyRows[0])
  const lines = [`| ${cols.join(' | ')} |`, `| ${cols.map(() => '---').join(' | ')} |`]
  ;(head ? bodyRows : bodyRows.slice(1)).forEach((r) => lines.push(`| ${rowText(r).join(' | ')} |`))
  return lines.join('\n')
}

function listMd(list: Element, ordered: boolean): string {
  return Array.from(list.children)
    .filter((li) => li.tagName.toLowerCase() === 'li' && !isHidden(li))
    .map((li, i) => `${ordered ? `${i + 1}.` : '-'} ${ws(inlineMd(li)).trim()}`)
    .join('\n')
}

/** Walk an element's children into a list of Markdown blocks (paragraphs, headings…). */
function toBlocks(root: Element): string[] {
  const blocks: string[] = []
  let lines: string[] = []

  const flush = () => {
    const joined = lines.map((l) => l.trim()).filter(Boolean).join('  \n')
    if (joined.trim()) blocks.push(joined)
    lines = []
  }

  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = ws(node.textContent ?? '')
      if (t.trim()) lines.push(t)
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as Element
    const tag = el.tagName.toLowerCase()
    if (SKIP_TAGS.has(tag) || isHidden(el)) return

    if (tag in HEADING_LEVEL) {
      flush()
      blocks.push(`${'#'.repeat(HEADING_LEVEL[tag])} ${ws(inlineMd(el)).trim()}`)
      return
    }
    if (tag === 'pre') {
      flush()
      blocks.push(`\`\`\`\n${(el.textContent ?? '').replace(/\n+$/, '')}\n\`\`\``)
      return
    }
    if (tag === 'table') {
      flush()
      blocks.push(tableMd(el as HTMLTableElement))
      return
    }
    if (tag === 'ul' || tag === 'ol') {
      flush()
      blocks.push(listMd(el, tag === 'ol'))
      return
    }

    if (!isBlock(el)) {
      lines.push(inlineMd(el))
      return
    }

    // Block element: recurse when it wraps other blocks, otherwise emit one line.
    if (hasBlockChild(el)) {
      flush()
      toBlocks(el).forEach((b) => blocks.push(b))
    } else {
      let text = ws(inlineMd(el)).trim()
      if (!text) return
      if (isMono(el)) text = `\`${text}\``
      else if (/^(do|don'?t|don['’]t)$/i.test(text)) text = `**${text}**`
      lines.push(text)
    }
  })

  flush()
  return blocks
}

export function domToMarkdown(root: HTMLElement): string {
  return toBlocks(root)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .concat('\n')
}
