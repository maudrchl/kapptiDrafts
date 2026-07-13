import { type CSSProperties } from 'react'
import { deriveIdentity } from '../../context/CurrentUser'
import { FONT } from './types'

/**
 * Petit avatar en initiales, coloré de façon déterministe par email (chaque
 * personne a sa couleur). L'Avatar ui-kit est monochrome, donc on le
 * remplace ici pour distinguer les auteurs. Tailles alignées sur antd :
 * small 24 / default 32 / large 40.
 */
const PX = { small: 24, default: 32, large: 40 } as const

const UserAvatar = ({
  email,
  size = 'small',
}: {
  email: string
  size?: keyof typeof PX
}) => {
  const { initials, color } = deriveIdentity(email)
  const px = PX[size]
  const style: CSSProperties = {
    width: px,
    height: px,
    borderRadius: 999,
    background: color,
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: Math.round(px * 0.4),
    fontWeight: 700,
    fontFamily: `"Clash Grotesk", ${FONT}`,
    lineHeight: 1,
    flexShrink: 0,
    userSelect: 'none',
  }
  return <span style={style}>{initials}</span>
}

export default UserAvatar
