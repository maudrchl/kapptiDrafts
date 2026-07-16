import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'

export type Person = { email: string; name: string }

/** Emails mentionnés dans un texte, d'après l'annuaire (match `@Nom`). */
export const mentionsIn = (text: string, dir: Person[]): string[] =>
  dir.filter((p) => text.includes(`@${p.name}`)).map((p) => p.email)

const TOKEN = /@([\p{L}\p{N}._-]*)$/u

type Props = {
  value: string
  onChange: (v: string) => void
  /** Cmd/Ctrl+Enter (hors menu de mentions). */
  onSubmit: () => void
  directory: Person[]
  placeholder?: string
  autoFocus?: boolean
  style?: CSSProperties
}

/**
 * Textarea avec autocomplétion `@mention`. Tape `@` puis un nom → menu des
 * personnes ; ↑/↓ pour naviguer, Entrée/Tab pour choisir, Échap pour fermer.
 * Hors menu, Cmd/Ctrl+Entrée soumet.
 */
export default function MentionTextarea({
  value,
  onChange,
  onSubmit,
  directory,
  placeholder,
  autoFocus,
  style,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [hi, setHi] = useState(0)

  const filtered =
    query === null
      ? []
      : directory
          .filter(
            (p) =>
              p.name.toLowerCase().includes(query.toLowerCase()) ||
              p.email.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 6)
  const open = query !== null && filtered.length > 0

  const recompute = (el: HTMLTextAreaElement) => {
    const upto = el.value.slice(0, el.selectionStart ?? el.value.length)
    const m = upto.match(TOKEN)
    setQuery(m ? m[1] : null)
    setHi(0)
  }

  const pick = (p: Person) => {
    const el = ref.current
    if (!el) return
    const caret = el.selectionStart ?? value.length
    const before = value.slice(0, caret).replace(TOKEN, `@${p.name} `)
    const after = value.slice(caret)
    onChange(before + after)
    setQuery(null)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(before.length, before.length)
    })
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (open) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHi((h) => (h + 1) % filtered.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHi((h) => (h - 1 + filtered.length) % filtered.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        pick(filtered[hi])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setQuery(null)
        return
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={ref}
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value)
          recompute(e.target)
        }}
        onKeyUp={(e) => recompute(e.currentTarget)}
        onClick={(e) => recompute(e.currentTarget)}
        onKeyDown={onKey}
        style={style}
      />
      {open && (
        <div style={menuStyle}>
          {filtered.map((p, i) => (
            <button
              key={p.email}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                pick(p)
              }}
              style={{ ...itemStyle, ...(i === hi ? itemActive : null) }}
            >
              <span style={avatarStyle}>{p.name.slice(0, 1).toUpperCase()}</span>
              <span style={nameStyle}>{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const menuStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 'calc(100% + 4px)',
  background: '#fff',
  border: '1px solid #e4e7ec',
  borderRadius: 8,
  boxShadow: '0 8px 26px rgba(38,36,31,0.12)',
  padding: 4,
  zIndex: 10,
  maxHeight: 220,
  overflowY: 'auto',
}
const itemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '6px 8px',
  border: 0,
  borderRadius: 6,
  background: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  font: 'inherit',
  fontSize: 13,
  color: '#24292f',
}
const itemActive: CSSProperties = { background: '#f6f7f8' }
const avatarStyle: CSSProperties = {
  flex: 'none',
  width: 22,
  height: 22,
  borderRadius: '50%',
  background: '#eceff3',
  color: '#667085',
  display: 'grid',
  placeItems: 'center',
  fontSize: 11,
  fontWeight: 700,
}
const nameStyle: CSSProperties = {
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}
