import { type CSSProperties } from 'react'
import { Tooltip } from '@kapptivate/ui-kit'
import UserAvatar from './UserAvatar'
import type { PresentUser } from './usePresence'

/**
 * Pile d'avatars « qui regarde ce proto », version compacte pour une ligne de
 * tableau (home). Même halo actif façon Figma que la PresenceBar, mais réduit.
 * Rendu vide (rien) si personne n'est présent.
 */
const MAX = 3

const RowPresence = ({ users }: { users: PresentUser[] }) => {
  if (users.length === 0) return null
  const shown = users.slice(0, MAX)
  const extra = users.length - shown.length

  return (
    <div style={styles.row}>
      <div style={styles.stack}>
        {shown.map((u, i) => (
          <div
            key={u.email}
            style={{ ...styles.slot, marginLeft: i === 0 ? 0 : -6, zIndex: 10 - i }}
          >
            <Tooltip content={`${u.name} is viewing`}>
              <span
                style={{
                  ...styles.avatarWrap,
                  boxShadow: `0 0 0 2px var(--color-background, #fff), 0 0 0 3.5px ${u.color}`,
                }}
              >
                <UserAvatar email={u.email} size="small" />
              </span>
            </Tooltip>
          </div>
        ))}
      </div>
      {extra > 0 && <span style={styles.more}>+{extra}</span>}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  row: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  stack: { display: 'flex', alignItems: 'center' },
  // Chevauchement des avatars (marge négative gérée inline), premier au-dessus.
  slot: { borderRadius: 999 },
  avatarWrap: { display: 'inline-flex', borderRadius: 999 },
  more: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
}

export default RowPresence
