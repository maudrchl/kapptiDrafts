import { useMemo } from 'react'
import Prism from 'prismjs'
import styles from './code-editor.module.scss'

/**
 * Éditeur de code : couche colorée (Prism) + textarea transparente par-dessus,
 * avec gouttière de numéros de ligne. Deux thèmes via `dark` (clair pour un
 * panneau inline, sombre pour un plein écran).
 *
 * Extrait du proto `custom-step-library` pour être partagé entre protos.
 */
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

export default CodeEditor
