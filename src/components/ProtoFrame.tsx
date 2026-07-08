import type { ReactNode, CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/kapptidrafts-logo.svg'

/**
 * Chrome léger autour d'un prototype (effet « mise en abyme ») :
 *  - un fil d'Ariane discret en haut à gauche (retour à l'index)
 *  - un fin liseré autour du viewport
 * Le tout en overlay `position: fixed` + `pointer-events` maîtrisés, pour ne
 * pas perturber la mise en page des protos plein écran.
 */
const ProtoFrame = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <>
    {children}

    {/* Liseré (décoratif, ne capte pas les clics) */}
    <div style={styles.ring} aria-hidden />

    {/* Fil d'Ariane */}
    <div style={styles.crumb}>
      <Link to="/" style={styles.home} title="Retour à l'index">
        <img src={logo} alt="kapptiDrafts" style={styles.logo} />
      </Link>
      <span style={styles.sep}>/</span>
      <span style={styles.title}>{title}</span>
    </div>
  </>
)

const styles: Record<string, CSSProperties> = {
  ring: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    boxShadow: 'inset 0 0 0 4px rgba(28,74,71,0.12)',
    zIndex: 2147483646,
  },
  crumb: {
    position: 'fixed',
    top: 12,
    left: 12,
    zIndex: 2147483647,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 10px',
    fontSize: 11,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    color: '#475467',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid #ececf0',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(16,24,40,0.10)',
  },
  home: { display: 'inline-flex', alignItems: 'center' },
  logo: { height: 13, width: 'auto', display: 'block' },
  sep: { color: '#c0c4cc' },
  title: { fontWeight: 600, color: '#1a1a1a' },
}

export default ProtoFrame
