import { useMemo, useState, type CSSProperties } from 'react'
import {
  Segmented,
  Text,
  EmptyState,
  IconMessageSquare,
} from '@kapptivate/ui-kit'
import { deriveIdentity } from '../../context/CurrentUser'
import { FONT, type Comment, type Reply } from './types'
import { timeAgo } from './time'
import UserAvatar from './UserAvatar'

/**
 * Historique de tous les commentaires du proto (tous écrans confondus), filtrable
 * ouverts / résolus. Cliquer une entrée sélectionne le pin correspondant.
 */
const CommentsDrawer = ({
  comments,
  replies,
  unreadByComment,
  onSelect,
}: {
  comments: Comment[]
  replies: Reply[]
  /** comment_id → nombre de réponses non lues pour l'utilisateur courant. */
  unreadByComment: Record<string, number>
  onSelect: (id: string) => void
}) => {
  const [filter, setFilter] = useState<'open' | 'resolved'>('open')

  const list = useMemo(
    () =>
      comments
        .filter((c) => (filter === 'resolved' ? c.resolved : !c.resolved))
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [comments, filter],
  )

  const openCount = comments.filter((c) => !c.resolved).length
  const resolvedCount = comments.length - openCount

  return (
    <div style={styles.wrap}>
      <Segmented
        value={filter}
        onChange={(v) => setFilter(v as 'open' | 'resolved')}
        options={[
          { label: `Open (${openCount})`, value: 'open' },
          { label: `Resolved (${resolvedCount})`, value: 'resolved' },
        ]}
      />

      {list.length === 0 ? (
        <div style={{ paddingTop: 32 }}>
          <EmptyState
            icon={<IconMessageSquare color="var(--color-text-secondary)" />}
            text={filter === 'open' ? 'No open comments' : 'No resolved comments'}
            description={
              filter === 'open'
                ? 'Turn on comment mode and click anywhere on the proto to leave one.'
                : 'Resolved comments will show up here.'
            }
          />
        </div>
      ) : (
        <div style={styles.list}>
          {list.map((c) => {
            const who = deriveIdentity(c.author_email)
            const count = replies.filter((r) => r.comment_id === c.id).length
            const unread = unreadByComment[c.id] ?? 0
            return (
              <button
                key={c.id}
                type="button"
                style={styles.item}
                onClick={() => onSelect(c.id)}
              >
                <span style={styles.avatarWrap}>
                  <UserAvatar email={c.author_email} size="small" />
                  {unread > 0 && (
                    <span style={styles.unreadBadge}>{unread > 9 ? '9+' : unread}</span>
                  )}
                </span>
                <div style={styles.itemBody}>
                  <div style={styles.itemHead}>
                    <Text size="s" weight="bold">
                      {who.name}
                    </Text>
                    <span style={styles.time}>{timeAgo(c.created_at)}</span>
                  </div>
                  <div style={styles.snippet}>{c.body}</div>
                  {count > 0 && (
                    <span style={styles.replyCount}>
                      {count} {count > 1 ? 'replies' : 'reply'}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    height: '100%',
    fontFamily: FONT,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 4, overflow: 'auto' },
  item: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    padding: '10px 8px',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    width: '100%',
  },
  avatarWrap: { position: 'relative', flexShrink: 0, lineHeight: 0 },
  unreadBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 16,
    height: 16,
    padding: '0 4px',
    borderRadius: 999,
    background: '#d26334',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 1,
    boxShadow: '0 0 0 2px #fff',
  },
  itemBody: { flex: 1, minWidth: 0 },
  itemHead: { display: 'flex', alignItems: 'baseline', gap: 6 },
  time: { fontSize: 11, color: '#98a2b3' },
  snippet: {
    fontSize: 13,
    lineHeight: 1.4,
    color: '#475467',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  replyCount: { fontSize: 11, color: '#d26334', fontWeight: 600 },
}

export default CommentsDrawer
