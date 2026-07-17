import { useEffect, useRef, type CSSProperties } from 'react'
import { FONT } from './types'
import { EMOJI_GROUPS } from './emojiData'

const Z = 2147483647

/**
 * Sélecteur d'emojis « façon Meet » ouvert par le bouton « + » de la palette.
 * Popover scrollable, emojis groupés par catégorie. Se ferme sur Échap ou clic
 * en dehors ; choisir un emoji appelle `onPick` (puis le parent ferme).
 */
const EmojiPicker = ({
  onPick,
  onClose,
}: {
  onPick: (emoji: string) => void
  onClose: () => void
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      // Ne pas se fermer si on clique dans le picker ou sur le bouton « + ».
      if (ref.current?.contains(t) || t?.closest('[data-emoji-more]')) return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onDown, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown, true)
    }
  }, [onClose])

  return (
    <div ref={ref} style={styles.panel} role="dialog" aria-label="Pick an emoji">
      {EMOJI_GROUPS.map((group) => (
        <div key={group.label} style={styles.group}>
          <div style={styles.groupLabel}>{group.label}</div>
          <div style={styles.grid}>
            {group.emojis.map((e, i) => (
              <button
                key={`${e}-${i}`}
                type="button"
                onClick={() => onPick(e)}
                aria-label={`Emoji ${e}`}
                style={styles.cell}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  panel: {
    position: 'fixed',
    bottom: 112,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: Z,
    width: 320,
    maxWidth: 'calc(100vw - 24px)',
    maxHeight: 300,
    overflowY: 'auto',
    padding: 12,
    background: 'rgba(255,255,255,0.98)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid #ececf0',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(16,24,40,0.18)',
    fontFamily: FONT,
  },
  group: { marginBottom: 8 },
  groupLabel: {
    position: 'sticky',
    top: -12,
    padding: '4px 2px',
    fontSize: 11,
    fontWeight: 600,
    color: '#98a2b3',
    background: 'rgba(255,255,255,0.98)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: 2,
  },
  cell: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    fontSize: 18,
    lineHeight: 1,
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
}

export default EmojiPicker
