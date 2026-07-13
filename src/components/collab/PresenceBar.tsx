import { type CSSProperties } from 'react'
import { Tooltip } from '@kapptivate/ui-kit'
import { FONT } from './types'
import UserAvatar from './UserAvatar'
import type { PresentUser } from './usePresence'

/**
 * Pile d'avatars « qui regarde ce proto », en haut au centre. On exclut la
 * personne courante (on ne se compte pas soi-même, comme dans Figma).
 */
const PresenceBar = ({
  users,
  meEmail,
}: {
  users: PresentUser[]
  meEmail?: string
}) => {
  const others = users.filter((u) => u.email !== meEmail)
  if (others.length === 0) return null

  return (
    <div style={styles.bar}>
      <div style={styles.stack}>
        {others.slice(0, 5).map((u, i) => (
          <div key={u.email} style={{ ...styles.slot, zIndex: 10 - i }}>
            <Tooltip content={`${u.name} is viewing`}>
              <span
                style={{
                  ...styles.avatarWrap,
                  // Halo « actif » façon Figma : anneau blanc + anneau couleur + glow.
                  boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${u.color}, 0 0 0 7px ${u.color}33`,
                }}
              >
                <UserAvatar email={u.email} size="small" />
              </span>
            </Tooltip>
          </div>
        ))}
      </div>
      {others.length > 5 && (
        <span style={styles.more}>+{others.length - 5}</span>
      )}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  bar: {
    position: 'fixed',
    top: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2147483647,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid #ececf0',
    borderRadius: 999,
    boxShadow: '0 2px 8px rgba(16,24,40,0.10)',
    fontFamily: FONT,
  },
  stack: { display: 'flex', alignItems: 'center' },
  slot: { marginLeft: 2, borderRadius: 999 },
  avatarWrap: {
    display: 'inline-flex',
    borderRadius: 999,
  },
  more: { fontSize: 11, fontWeight: 600, color: '#475467' },
}

export default PresenceBar
