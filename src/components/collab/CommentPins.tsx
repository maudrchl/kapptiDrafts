import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { Button, Text, IconCheck, IconTrash } from '@kapptivate/ui-kit'
import { deriveIdentity, type CurrentUser } from '../../context/CurrentUser'
import { FONT, type Comment, type Reply } from './types'
import { fullDate, timeAgo } from './time'
import { captureAnchor, resolveAnchorPoint } from './anchor'
import UserAvatar from './UserAvatar'

export type PlacementMode = 'off' | 'comment' | 'emoji'

type Props = {
  activeScreen: string
  me: CurrentUser | null
  comments: Comment[]
  replies: Reply[]
  mode: PlacementMode
  activeEmoji: string
  showResolved: boolean
  /** Affiche/masque tous les marqueurs (pins de commentaires + stamps emoji). */
  showMarkers: boolean
  /** L'utilisateur courant peut supprimer les emojis des autres. */
  isAdmin: boolean
  selectedId: string | null
  onSelect: (id: string | null) => void
  addComment: (input: {
    screen_id: string
    x: number
    y: number
    body: string
    author_email: string
    anchor?: string | null
  }) => Promise<Comment | null>
  addStamp: (input: {
    screen_id: string
    x: number
    y: number
    emoji: string
    author_email: string
    anchor?: string | null
  }) => Promise<Comment | null>
  addReply: (commentId: string, body: string, authorEmail: string) => void
  setResolved: (id: string, resolved: boolean) => void
  deleteComment: (id: string) => void
  deleteReply: (id: string) => void
}

const Z = 2147483646

const URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi
const linkify = (text: string): ReactNode[] => {
  const out: ReactNode[] = []
  let last = 0
  text.replace(URL_RE, (match: string, _g: string, offset: number) => {
    if (offset > last) out.push(text.slice(last, offset))
    const trailing = match.match(/[.,;:!?)\]}'"]+$/)
    const tail = trailing ? trailing[0] : ''
    const url = tail ? match.slice(0, -tail.length) : match
    const href = url.startsWith('www.') ? `https://${url}` : url
    out.push(
      <a
        key={offset}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>,
    )
    if (tail) out.push(tail)
    last = offset + match.length
    return match
  })
  if (last < text.length) out.push(text.slice(last))
  return out
}

const linkStyle: CSSProperties = {
  color: '#d26334',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
  wordBreak: 'break-all',
}

const CommentPins = ({
  activeScreen,
  me,
  comments,
  replies,
  mode,
  activeEmoji,
  showResolved,
  showMarkers,
  isAdmin,
  selectedId,
  onSelect,
  addComment,
  addStamp,
  addReply,
  setResolved,
  deleteComment,
  deleteReply,
}: Props) => {
  const [draft, setDraft] = useState<{ anchor: string | null; x: number; y: number } | null>(null)
  const layerRef = useRef<HTMLDivElement>(null)

  // Suivi live des positions : les pins sont ancrés à des éléments dont la
  // position change (scroll, resize, ouverture de drawer). Un tick par frame
  // relit les rects — coût négligeable pour une poignée de pins.
  const [, setTick] = useState(0)
  useEffect(() => {
    let raf = 0
    const loop = () => {
      setTick((t) => (t + 1) % 1_000_000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (mode === 'off') setDraft(null)
  }, [mode])

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

  // Clic en dehors du thread ouvert (et hors d'un pin) → ferme le thread.
  useEffect(() => {
    if (!selectedId) return
    const onDown = (e: globalThis.MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.closest('[data-comment-card]') || t?.closest('[data-comment-pin]')) return
      onSelect(null)
    }
    window.addEventListener('mousedown', onDown, true)
    return () => window.removeEventListener('mousedown', onDown, true)
  }, [selectedId, onSelect])

  // Un marqueur est-il affichable ? (visibilité globale + type + résolu)
  const isVisible = (c: Comment) => {
    if (!showMarkers) return false
    if (c.kind === 'emoji') return true
    if (c.resolved && !showResolved) return false
    return true
  }

  const placed = comments
    .filter(isVisible)
    .map((c) => {
      // Ancre explicite (id unique) : visible dès que l'élément est dans le DOM.
      // Viewport legacy ou sélecteur structurel `@…` (non unique entre écrans) :
      // on filtre par écran pour éviter un match sur un écran voisin.
      const globallyUnique = !!c.anchor && !c.anchor.startsWith('@')
      if (!globallyUnique && c.screen_id !== activeScreen) return null
      const pt = resolveAnchorPoint(c)
      if (!pt) return null
      return { c, pt }
    })
    .filter((v): v is { c: Comment; pt: { left: number; top: number } } => v !== null)

  const onLayerClick = (e: MouseEvent<HTMLDivElement>) => {
    if (mode === 'off') return
    const hit = captureAnchor(e.clientX, e.clientY, layerRef.current)
    if (mode === 'emoji') {
      if (me) {
        addStamp({
          screen_id: activeScreen,
          x: hit.x,
          y: hit.y,
          anchor: hit.anchor,
          emoji: activeEmoji,
          author_email: me.email,
        })
      }
      return
    }
    // comment
    setDraft(hit)
    onSelect(null)
  }

  const selectedEntry = placed.find((p) => p.c.id === selectedId && p.c.kind === 'comment') ?? null
  const draftPt = draft ? resolveAnchorPoint(draft) : null

  return (
    <div
      ref={layerRef}
      style={{
        ...styles.layer,
        pointerEvents: mode !== 'off' ? 'auto' : 'none',
        cursor: mode !== 'off' ? 'crosshair' : 'default',
      }}
      onClick={onLayerClick}
    >
      {placed.map(({ c, pt }) =>
        c.kind === 'emoji' ? (
          <EmojiStamp
            key={c.id}
            comment={c}
            pt={pt}
            mine={c.author_email === me?.email}
            // Admin : peut retirer les réactions des autres.
            canRemove={c.author_email === me?.email || isAdmin}
            onRemove={(e) => {
              e.stopPropagation()
              deleteComment(c.id)
            }}
          />
        ) : (
          <Pin
            key={c.id}
            comment={c}
            pt={pt}
            selected={c.id === selectedId}
            onClick={(e) => {
              e.stopPropagation()
              setDraft(null)
              onSelect(c.id === selectedId ? null : c.id)
            }}
          />
        ),
      )}

      {selectedEntry && me && (
        <ThreadCard
          comment={selectedEntry.c}
          pt={selectedEntry.pt}
          replies={replies.filter((r) => r.comment_id === selectedEntry.c.id)}
          me={me}
          isAdmin={isAdmin}
          onClose={() => onSelect(null)}
          onReply={(body) => addReply(selectedEntry.c.id, body, me.email)}
          onDeleteReply={deleteReply}
          onToggleResolved={() => setResolved(selectedEntry.c.id, !selectedEntry.c.resolved)}
          onDelete={() => {
            deleteComment(selectedEntry.c.id)
            onSelect(null)
          }}
        />
      )}

      {draft && draftPt && me && (
        <Composer
          pt={draftPt}
          me={me}
          onCancel={() => setDraft(null)}
          onSubmit={async (body) => {
            const created = await addComment({
              screen_id: activeScreen,
              anchor: draft.anchor,
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

/* --------------------------- Author hover card ---------------------------- */

/**
 * Petite carte de survol : qui a laissé ce marqueur + depuis quand. S'affiche
 * au-dessus du marqueur (ou en dessous s'il est trop haut). `pointer-events`
 * désactivés pour ne pas gêner le clic sur le marqueur.
 */
const AuthorHover = ({
  email,
  createdAt,
  suffix,
  flipBelow,
}: {
  email: string
  createdAt: string
  suffix?: string
  flipBelow: boolean
}) => {
  const who = deriveIdentity(email)
  return (
    <div style={{ ...styles.hover, ...(flipBelow ? styles.hoverBelow : styles.hoverAbove) }}>
      <UserAvatar email={email} size="small" />
      <div style={styles.hoverText}>
        <span style={styles.hoverName}>{who.name}</span>
        <span style={styles.hoverMeta}>{suffix ?? timeAgo(createdAt)}</span>
      </div>
    </div>
  )
}

/* ------------------------------- Pin marker ------------------------------- */

const Pin = ({
  comment,
  pt,
  selected,
  onClick,
}: {
  comment: Comment
  pt: { left: number; top: number }
  selected: boolean
  onClick: (e: MouseEvent) => void
}) => {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      data-comment-pin
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.pin,
        left: pt.left,
        top: pt.top,
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
      {hover && !selected && (
        <AuthorHover
          email={comment.author_email}
          createdAt={comment.created_at}
          flipBelow={pt.top < 72}
        />
      )}
    </button>
  )
}

/* ------------------------------ Emoji stamp ------------------------------- */

const EmojiStamp = ({
  comment,
  pt,
  mine,
  canRemove,
  onRemove,
}: {
  comment: Comment
  pt: { left: number; top: number }
  /** La réaction est-elle de l'utilisateur courant ? */
  mine: boolean
  /** Peut-on la retirer ? (la sienne, ou admin sur celle d'un autre) */
  canRemove: boolean
  onRemove: (e: MouseEvent) => void
}) => {
  const [hover, setHover] = useState(false)
  const who = deriveIdentity(comment.author_email)
  // Libellé de survol : sienne → "you", admin sur une autre → nom + "(admin)".
  const suffix = !canRemove
    ? timeAgo(comment.created_at)
    : mine
      ? 'you · click to remove'
      : `${who.name} · click to remove (admin)`
  return (
    <button
      type="button"
      onClick={canRemove ? onRemove : (e) => e.stopPropagation()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...styles.stamp, left: pt.left, top: pt.top, cursor: canRemove ? 'pointer' : 'default' }}
    >
      <span style={styles.stampEmoji}>{comment.emoji}</span>
      {hover && (
        <AuthorHover
          email={comment.author_email}
          createdAt={comment.created_at}
          suffix={suffix}
          flipBelow={pt.top < 72}
        />
      )}
    </button>
  )
}

/* ------------------------------- Thread card ------------------------------ */

const anchorStyle = (pt: { left: number; top: number }): CSSProperties => {
  const flipX = pt.left > window.innerWidth * 0.6
  const flipY = pt.top > window.innerHeight * 0.6
  return {
    left: pt.left,
    top: pt.top,
    transform: `translate(${flipX ? 'calc(-100% - 20px)' : '20px'}, ${
      flipY ? 'calc(-100% + 4px)' : '-4px'
    })`,
  }
}

const ThreadCard = ({
  comment,
  pt,
  replies,
  me,
  isAdmin,
  onClose,
  onReply,
  onDeleteReply,
  onToggleResolved,
  onDelete,
}: {
  comment: Comment
  pt: { left: number; top: number }
  replies: Reply[]
  me: CurrentUser
  isAdmin: boolean
  onClose: () => void
  onReply: (body: string) => void
  onDeleteReply: (id: string) => void
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
    <div data-comment-card style={{ ...styles.card, ...anchorStyle(pt) }} onClick={(e) => e.stopPropagation()}>
      <Message authorEmail={comment.author_email} body={comment.body} createdAt={comment.created_at} />

      {replies.length > 0 && (
        <div style={styles.replies}>
          {replies.map((r) => (
            <Message
              key={r.id}
              authorEmail={r.author_email}
              body={r.body}
              createdAt={r.created_at}
              onDelete={
                r.author_email === me.email || isAdmin ? () => onDeleteReply(r.id) : undefined
              }
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
        <Button size="s" color="secondary" icon={IconCheck} onClick={onToggleResolved}>
          {comment.resolved ? 'Reopen' : 'Resolve'}
        </Button>
        <div style={{ flex: 1 }} />
        {(comment.author_email === me.email || isAdmin) && (
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
  onDelete,
}: {
  authorEmail: string
  body: string
  createdAt: string
  /** Si fourni, affiche un bouton de suppression au survol (auteur ou admin). */
  onDelete?: () => void
}) => {
  const who = deriveIdentity(authorEmail)
  const [hover, setHover] = useState(false)
  return (
    <div
      style={styles.msg}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
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
        <div style={styles.body}>{linkify(body)}</div>
      </div>
      {onDelete && hover && (
        <button type="button" onClick={onDelete} title="Delete message" style={styles.msgDelete}>
          <IconTrash size={13} />
        </button>
      )}
    </div>
  )
}

/* -------------------------------- Composer -------------------------------- */

const Composer = ({
  pt,
  me,
  onCancel,
  onSubmit,
}: {
  pt: { left: number; top: number }
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
      <span style={{ ...styles.draftDot, left: pt.left, top: pt.top }} aria-hidden />
      <div style={{ ...styles.card, ...anchorStyle(pt) }} onClick={(e) => e.stopPropagation()}>
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
  stamp: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #ececf0',
    borderRadius: '999px 999px 999px 3px',
    boxShadow: '0 2px 8px rgba(16,24,40,0.22)',
  },
  stampEmoji: { fontSize: 16, lineHeight: 1 },
  hover: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '5px 9px 5px 5px',
    whiteSpace: 'nowrap',
    background: 'rgba(26,26,26,0.92)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    borderRadius: 999,
    boxShadow: '0 4px 14px rgba(16,24,40,0.28)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  hoverAbove: { bottom: 'calc(100% + 8px)' },
  hoverBelow: { top: 'calc(100% + 8px)' },
  hoverText: { display: 'flex', flexDirection: 'column', lineHeight: 1.2 },
  hoverName: { fontSize: 12, fontWeight: 600, color: '#fff' },
  hoverMeta: { fontSize: 10.5, color: 'rgba(255,255,255,0.65)' },
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
  msgDelete: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    padding: 0,
    color: '#98a2b3',
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
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
