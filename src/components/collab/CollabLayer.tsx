import {
  useEffect,
  useState,
  type CSSProperties,
  type ComponentType,
  type ReactNode,
} from 'react'
import {
  Drawer,
  Tooltip,
  IconMessageSquare,
  IconHistory,
  IconEye,
  IconEyeOff,
  IconCode,
  IconLink,
} from '@kapptivate/ui-kit'
import { collabEnabled } from '../../lib/supabase'
import { useCurrentUser, isAdmin } from '../../context/CurrentUser'
import { useActiveScreen, useGoToScreen } from '../../context/ScreenContext'
import { FONT } from './types'
import { useProtoComments } from './useProtoComments'
import { usePresence } from './usePresence'
import CommentPins, { type PlacementMode } from './CommentPins'
import CommentsDrawer from './CommentsDrawer'
import PresenceBar from './PresenceBar'
import EmojiPicker from './EmojiPicker'

const EMOJIS = ['🔥', '❤️', '👏', '🎉', '😍', '🚀', '👀', '💡']

/**
 * Orchestre la collaboration sur un proto : présence, pins de commentaires,
 * stamps emoji, historique. Rendu par ProtoFrame, dans le ScreenProvider.
 */
const CollabLayer = ({
  slug,
  onOpenCode,
  onToggleShare,
  shareActive,
}: {
  slug: string
  /** Ouvre le drawer de code (chrome ProtoFrame). Absent en vue scoped. */
  onOpenCode?: () => void
  /** Ouvre/ferme le panneau de liens de partage. Absent si scoped / collab off. */
  onToggleShare?: () => void
  shareActive?: boolean
}) => {
  const { user } = useCurrentUser()
  const activeScreen = useActiveScreen()
  const goToScreen = useGoToScreen()
  const present = usePresence(slug, user, activeScreen)
  const {
    comments,
    replies,
    addComment,
    addStamp,
    addReply,
    setResolved,
    deleteComment,
    deleteReply,
  } = useProtoComments(slug)

  const [mode, setMode] = useState<PlacementMode>('off')
  const [activeEmoji, setActiveEmoji] = useState(EMOJIS[0])
  // Sélecteur d'emojis complet (bouton « + » de la palette).
  const [pickerOpen, setPickerOpen] = useState(false)
  const [showResolved, setShowResolved] = useState(false)
  // Masque TOUS les marqueurs (pins de commentaires + stamps emoji).
  const [markersHidden, setMarkersHidden] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  // Raccourcis clavier : Échap quitte le placement ; « @ » bascule l'affichage
  // des marqueurs (ignoré pendant la saisie de texte).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMode('off')
      if (e.key === '@') {
        const t = e.target as HTMLElement | null
        const typing =
          !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
        if (!typing) {
          e.preventDefault()
          setMarkersHidden((v) => !v)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Quitter le mode emoji referme le sélecteur.
  useEffect(() => {
    if (mode !== 'emoji') setPickerOpen(false)
  }, [mode])

  if (!collabEnabled) return null

  const openCount = comments.filter((c) => c.kind !== 'emoji' && !c.resolved).length

  return (
    <>
      <PresenceBar users={present} meEmail={user?.email} onFollow={goToScreen} />

      <CommentPins
        activeScreen={activeScreen}
        me={user}
        comments={comments}
        replies={replies}
        // Suspend le placement tant que le drawer historique est ouvert.
        mode={historyOpen ? 'off' : mode}
        activeEmoji={activeEmoji}
        showResolved={showResolved}
        showMarkers={!markersHidden}
        isAdmin={isAdmin(user)}
        selectedId={selectedId}
        onSelect={setSelectedId}
        addComment={addComment}
        addStamp={addStamp}
        addReply={addReply}
        setResolved={setResolved}
        deleteComment={deleteComment}
        deleteReply={deleteReply}
      />

      {/* Palette emoji (au-dessus de la toolbar, en mode emoji). Le « + » ouvre
          le sélecteur complet (tous les emojis, façon Meet). */}
      {mode === 'emoji' && !historyOpen && (
        <div style={styles.palette}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setActiveEmoji(e)}
              aria-label={`Emoji ${e}`}
              aria-pressed={e === activeEmoji}
              style={{ ...styles.emojiBtn, ...(e === activeEmoji ? styles.emojiBtnActive : null) }}
            >
              {e}
            </button>
          ))}
          <span style={styles.divider} />
          <button
            data-emoji-more
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            aria-label="More emojis"
            aria-pressed={pickerOpen}
            style={{ ...styles.emojiBtn, ...(pickerOpen ? styles.emojiBtnActive : null) }}
          >
            +
          </button>
        </div>
      )}

      {mode === 'emoji' && !historyOpen && pickerOpen && (
        <EmojiPicker
          onPick={(e) => {
            setActiveEmoji(e)
            setPickerOpen(false)
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {/* Toolbar flottante, bas-centre (façon Figma). */}
      <div style={styles.toolbar}>
        <ToolBtn
          icon={IconMessageSquare}
          label={mode === 'comment' ? 'Comment mode: on' : 'Comment mode'}
          active={mode === 'comment'}
          onClick={() => setMode((m) => (m === 'comment' ? 'off' : 'comment'))}
        />
        <ToolBtn
          glyph={<span style={{ fontSize: 16, lineHeight: 1 }}>{activeEmoji}</span>}
          label={mode === 'emoji' ? 'Emoji mode: on' : 'Emoji reactions'}
          active={mode === 'emoji'}
          onClick={() => setMode((m) => (m === 'emoji' ? 'off' : 'emoji'))}
        />
        <span style={styles.divider} />
        <ToolBtn
          icon={markersHidden ? IconEyeOff : IconEye}
          label={markersHidden ? 'Show comments & reactions (@)' : 'Hide comments & reactions (@)'}
          active={markersHidden}
          onClick={() => setMarkersHidden((v) => !v)}
        />
        <ToolBtn
          icon={IconHistory}
          label="Comment history"
          counter={openCount || undefined}
          onClick={() => setHistoryOpen(true)}
        />
        {(onToggleShare || onOpenCode) && <span style={styles.divider} />}
        {onToggleShare && (
          <ToolBtn
            icon={IconLink}
            label="Share this proto"
            active={shareActive}
            onClick={onToggleShare}
          />
        )}
        {onOpenCode && (
          <ToolBtn icon={IconCode} label="View this proto's source code" onClick={onOpenCode} />
        )}
      </div>

      <Drawer open={historyOpen} onClose={() => setHistoryOpen(false)} title="Comments" width={380}>
        <CommentsDrawer
          comments={comments}
          replies={replies}
          onSelect={(id) => {
            const c = comments.find((x) => x.id === id)
            if (!c) return
            if (c.resolved) setShowResolved(true)
            // Ramène l'utilisateur sur l'écran où le commentaire a été posé
            // (le proto ré-ouvre l'onglet / le drawer → l'ancre réapparaît).
            goToScreen(c.screen_id)
            setSelectedId(id)
            setHistoryOpen(false)
          }}
        />
      </Drawer>
    </>
  )
}

/* --------------------------- Toolbar button --------------------------- */

const ToolBtn = ({
  icon: Icon,
  glyph,
  label,
  active,
  counter,
  onClick,
}: {
  icon?: ComponentType<{ size?: number }>
  glyph?: ReactNode
  label: string
  active?: boolean
  counter?: number
  onClick: () => void
}) => (
  <Tooltip content={label}>
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      style={{
        ...styles.btn,
        ...(active ? styles.btnActive : null),
      }}
    >
      {glyph ?? (Icon ? <Icon size={17} /> : null)}
      {counter != null && <span style={styles.counter}>{counter}</span>}
    </button>
  </Tooltip>
)

const styles: Record<string, CSSProperties> = {
  toolbar: {
    position: 'fixed',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2147483647,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: 5,
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid #ececf0',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(16,24,40,0.16)',
    fontFamily: FONT,
  },
  palette: {
    position: 'fixed',
    bottom: 66,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2147483647,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: 5,
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid #ececf0',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(16,24,40,0.16)',
    fontFamily: FONT,
  },
  emojiBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    fontSize: 17,
    lineHeight: 1,
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  emojiBtnActive: { background: '#f4e9e2', boxShadow: 'inset 0 0 0 1px #d26334' },
  divider: { width: 1, height: 22, background: '#ececf0' },
  btn: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    color: '#475467',
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  btnActive: { background: '#d26334', color: '#fff' },
  counter: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 15,
    height: 15,
    padding: '0 3px',
    fontSize: 10,
    fontWeight: 700,
    lineHeight: '15px',
    color: '#fff',
    background: '#d26334',
    borderRadius: 999,
    boxShadow: '0 0 0 2px #fff',
  },
}

export default CollabLayer
