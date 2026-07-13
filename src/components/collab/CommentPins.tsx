import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react'
import { Button, Text, IconCheck, IconTrash } from '@kapptivate/ui-kit'
import { deriveIdentity, type CurrentUser } from '../../context/CurrentUser'
import { FONT, type Comment, type Reply } from './types'
import { fullDate, timeAgo } from './time'
import UserAvatar from './UserAvatar'

type Props = {
  activeScreen: string
  me: CurrentUser | null
  comments: Comment[]
  replies: Reply[]
  commentMode: boolean
  showResolved: boolean
  selectedId: string | null
  onSelect: (id: string | null) => void
  addComment: (input: {
    screen_id: string
    x: number
    y: number
    body: string
    author_email: string
  }) => Promise<Comment | null>
  addReply: (commentId: string, body: string, authorEmail: string) => void
  setResolved: (id: string, resolved: boolean) => void
  deleteComment: (id: string) => void
}

const Z = 2147483646

const CommentPins = ({
  activeScreen,
  me,
  comments,
  replies,
  commentMode,
  showResolved,
  selectedId,
  onSelect,
  addComment,
  addReply,
  setResolved,
  deleteComment,
}: Props) => {
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null)

  // Ne montrer que les pins de l'écran affiché.
  const visible = comments.filter(
    (c) => c.screen_id === activeScreen && (showResolved || !c.resolved),
  )

  // Sortie du mode / Échap : on ferme le brouillon et le thread ouvert.
  useEffect(() => {
    if (!commentMode) setDraft(null)
  }, [commentMode])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDraft(null)
        onSelect(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSelect])

  const placePin = (e: MouseEvent<HTMLDivElement>) => {
    if (!commentMode) return
    setDraft({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    onSelect(null)
  }

  const selected = visible.find((c) => c.id === selectedId) ?? null

  return (
    <div
      style={{
        ...styles.layer,
        pointerEvents: commentMode ? 'auto' : 'none',
        cursor: commentMode ? 'crosshair' : 'default',
      }}
      onClick={placePin}
    >
      {visible.map((c) => (
        <Pin
          key={c.id}
          comment={c}
          selected={c.id === selectedId}
          onClick={(e) => {
            e.stopPropagation()
            setDraft(null)
            onSelect(c.id === selectedId ? null : c.id)
          }}
        />
      ))}

      {selected && me && (
        <ThreadCard
          comment={selected}
          replies={replies.filter((r) => r.comment_id === selected.id)}
          me={me}
          onClose={() => onSelect(null)}
          onReply={(body) => addReply(selected.id, body, me.email)}
          onToggleResolved={() => setResolved(selected.id, !selected.resolved)}
          onDelete={() => {
            deleteComment(selected.id)
            onSelect(null)
          }}
        />
      )}

      {draft && me && (
        <Composer
          x={draft.x}
          y={draft.y}
          me={me}
          onCancel={() => setDraft(null)}
          onSubmit={async (body) => {
            const created = await addComment({
              screen_id: activeScreen,
              x: draft.x,
              y: draft.y,
              body,
              author_email: me.email,
            })
            setDraft(null)
            if (created) onSelect(created.id)
          }}
        />
      )}
    </div>
  )
}

/* ------------------------------- Pin marker ------------------------------- */

const Pin = ({
  comment,
  selected,
  onClick,
}: {
  comment: Comment
  selected: boolean
  onClick: (e: MouseEvent) => void
}) => {
  const who = deriveIdentity(comment.author_email)
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${who.name} · ${timeAgo(comment.created_at)}`}
      style={{
        ...styles.pin,
        left: `${comment.x * 100}%`,
        top: `${comment.y * 100}%`,
        opacity: comment.resolved ? 0.55 : 1,
        boxShadow: selected
          ? '0 0 0 3px rgba(210,99,52,0.9), 0 4px 12px rgba(16,24,40,0.25)'
          : '0 2px 8px rgba(16,24,40,0.25)',
      }}
    >
      <UserAvatar email={comment.author_email} size="small" />
      {comment.resolved && (
        <span style={styles.resolvedBadge}>
          <IconCheck size={10} />
        </span>
      )}
    </button>
  )
}

/* ------------------------------- Thread card ------------------------------ */

const anchorStyle = (x: number, y: number): CSSProperties => {
  const flipX = x > 0.6
  const flipY = y > 0.6
  return {
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    transform: `translate(${flipX ? 'calc(-100% - 20px)' : '20px'}, ${
      flipY ? 'calc(-100% + 4px)' : '-4px'
    })`,
  }
}

const ThreadCard = ({
  comment,
  replies,
  me,
  onClose,
  onReply,
  onToggleResolved,
  onDelete,
}: {
  comment: Comment
  replies: Reply[]
  me: CurrentUser
  onClose: () => void
  onReply: (body: string) => void
  onToggleResolved: () => void
  onDelete: () => void
}) => {
  const [text, setText] = useState('')
  const submit = () => {
    const body = text.trim()
    if (!body) return
    onReply(body)
    setText('')
  }
  return (
    <div
      style={{ ...styles.card, ...anchorStyle(comment.x, comment.y) }}
      onClick={(e) => e.stopPropagation()}
    >
      <Message
        authorEmail={comment.author_email}
        body={comment.body}
        createdAt={comment.created_at}
      />

      {replies.length > 0 && (
        <div style={styles.replies}>
          {replies.map((r) => (
            <Message
              key={r.id}
              authorEmail={r.author_email}
              body={r.body}
              createdAt={r.created_at}
            />
          ))}
        </div>
      )}

      <textarea
        autoFocus
        value={text}
        placeholder="Reply…"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
        }}
        style={styles.textarea}
      />

      <div style={styles.actions}>
        <Button
          size="s"
          color={comment.resolved ? 'secondary' : 'primary'}
          icon={IconCheck}
          onClick={onToggleResolved}
        >
          {comment.resolved ? 'Reopen' : 'Resolve'}
        </Button>
        <div style={{ flex: 1 }} />
        {comment.author_email === me.email && (
          <Button size="s" color="danger-s" icon={IconTrash} onClick={onDelete}>
            Delete
          </Button>
        )}
        <Button size="s" color="secondary" onClick={submit} disabled={!text.trim()}>
          Reply
        </Button>
      </div>

      <button type="button" onClick={onClose} style={styles.close} title="Close">
        ×
      </button>
    </div>
  )
}

/* --------------------------------- Message -------------------------------- */

const Message = ({
  authorEmail,
  body,
  createdAt,
}: {
  authorEmail: string
  body: string
  createdAt: string
}) => {
  const who = deriveIdentity(authorEmail)
  return (
    <div style={styles.msg}>
      <UserAvatar email={authorEmail} size="small" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.msgHead}>
          <Text size="s" weight="bold">
            {who.name}
          </Text>
          <span style={styles.time} title={fullDate(createdAt)}>
            {timeAgo(createdAt)}
          </span>
        </div>
        <div style={styles.body}>{body}</div>
      </div>
    </div>
  )
}

/* -------------------------------- Composer -------------------------------- */

const Composer = ({
  x,
  y,
  me,
  onCancel,
  onSubmit,
}: {
  x: number
  y: number
  me: CurrentUser
  onCancel: () => void
  onSubmit: (body: string) => void
}) => {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => ref.current?.focus(), [])
  const submit = () => {
    const body = text.trim()
    if (body) onSubmit(body)
  }
  return (
    <>
      <span
        style={{ ...styles.draftDot, left: `${x * 100}%`, top: `${y * 100}%` }}
        aria-hidden
      />
      <div
        style={{ ...styles.card, ...anchorStyle(x, y) }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.composerHead}>
          <UserAvatar email={me.email} size="small" />
          <Text size="s" weight="bold">
            {me.name}
          </Text>
        </div>
        <textarea
          ref={ref}
          value={text}
          placeholder="Add a comment…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
          }}
          style={styles.textarea}
        />
        <div style={styles.actions}>
          <Button size="s" color="invisible" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="s" color="primary" onClick={submit} disabled={!text.trim()}>
            Comment
          </Button>
        </div>
      </div>
    </>
  )
}

/* --------------------------------- Styles --------------------------------- */

const styles: Record<string, CSSProperties> = {
  layer: { position: 'fixed', inset: 0, zIndex: Z, fontFamily: FONT },
  pin: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'auto',
    padding: 2,
    background: '#fff',
    border: 'none',
    borderRadius: '999px 999px 999px 3px',
    cursor: 'pointer',
    lineHeight: 0,
  },
  resolvedBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 15,
    height: 15,
    borderRadius: 999,
    background: '#2e8b57',
    color: '#fff',
    boxShadow: '0 0 0 2px #fff',
  },
  card: {
    position: 'absolute',
    pointerEvents: 'auto',
    width: 300,
    maxWidth: '80vw',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    background: 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid #ececf0',
    borderRadius: 12,
    boxShadow: '0 8px 28px rgba(16,24,40,0.20)',
  },
  msg: { display: 'flex', gap: 8, alignItems: 'flex-start' },
  msgHead: { display: 'flex', alignItems: 'baseline', gap: 6 },
  time: { fontSize: 11, color: '#98a2b3' },
  body: {
    fontSize: 13,
    lineHeight: 1.45,
    color: '#1a1a1a',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  replies: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingLeft: 10,
    borderLeft: '2px solid #f0f0f3',
  },
  composerHead: { display: 'flex', alignItems: 'center', gap: 8 },
  textarea: {
    width: '100%',
    minHeight: 60,
    resize: 'vertical',
    padding: '8px 10px',
    fontSize: 13,
    fontFamily: FONT,
    color: '#1a1a1a',
    background: '#fff',
    border: '1px solid #e4e4e7',
    borderRadius: 8,
    outline: 'none',
    boxSizing: 'border-box',
  },
  actions: { display: 'flex', alignItems: 'center', gap: 8 },
  close: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 22,
    height: 22,
    padding: 0,
    fontSize: 18,
    lineHeight: '20px',
    color: '#98a2b3',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  draftDot: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: 12,
    height: 12,
    borderRadius: '999px 999px 999px 2px',
    background: '#d26334',
    boxShadow: '0 0 0 3px rgba(210,99,52,0.3)',
    pointerEvents: 'none',
  },
}

export default CommentPins
