import { useState, type CSSProperties, type ComponentType } from 'react'
import {
  Drawer,
  Tooltip,
  IconMessageSquare,
  IconHistory,
} from '@kapptivate/ui-kit'
import { collabEnabled } from '../../lib/supabase'
import { useCurrentUser } from '../../context/CurrentUser'
import { useActiveScreen } from '../../context/ScreenContext'
import { FONT } from './types'
import { useProtoComments } from './useProtoComments'
import { usePresence } from './usePresence'
import CommentPins from './CommentPins'
import CommentsDrawer from './CommentsDrawer'
import PresenceBar from './PresenceBar'

/**
 * Orchestre la collaboration sur un proto : présence, pins de commentaires,
 * historique. Rendu par ProtoFrame, à l'intérieur du ScreenProvider.
 * Ne s'active que si Supabase est configuré et l'utilisateur connu.
 */
const CollabLayer = ({ slug }: { slug: string }) => {
  const { user } = useCurrentUser()
  const activeScreen = useActiveScreen()
  const present = usePresence(slug, user)
  const {
    comments,
    replies,
    addComment,
    addReply,
    setResolved,
    deleteComment,
  } = useProtoComments(slug)

  const [commentMode, setCommentMode] = useState(false)
  const [showResolved, setShowResolved] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  if (!collabEnabled) return null

  const openCount = comments.filter((c) => !c.resolved).length

  return (
    <>
      <PresenceBar users={present} meEmail={user?.email} />

      <CommentPins
        activeScreen={activeScreen}
        me={user}
        comments={comments}
        replies={replies}
        commentMode={commentMode}
        showResolved={showResolved}
        selectedId={selectedId}
        onSelect={setSelectedId}
        addComment={addComment}
        addReply={addReply}
        setResolved={setResolved}
        deleteComment={deleteComment}
      />

      {/* Toolbar flottante, bas-centre (façon Figma). */}
      <div style={styles.toolbar}>
        <ToolBtn
          icon={IconMessageSquare}
          label={commentMode ? 'Comment mode: on' : 'Comment mode'}
          active={commentMode}
          onClick={() => setCommentMode((v) => !v)}
        />
        <span style={styles.divider} />
        <ToolBtn
          icon={IconHistory}
          label="Comment history"
          counter={openCount || undefined}
          onClick={() => setHistoryOpen(true)}
        />
      </div>

      <Drawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Comments"
        width={380}
      >
        <CommentsDrawer
          comments={comments}
          replies={replies}
          onSelect={(id) => {
            const c = comments.find((x) => x.id === id)
            if (c?.resolved) setShowResolved(true)
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
  label,
  active,
  counter,
  onClick,
}: {
  icon: ComponentType<{ size?: number }>
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
      <Icon size={17} />
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
