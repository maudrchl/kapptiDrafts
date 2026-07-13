import { useEffect, useState, type ReactNode, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { IconCode, IconLink, IconCheck, IconTrash } from '@kapptivate/ui-kit'
import logo from '../assets/kapptidrafts-logo.svg'
import CodeDrawer from './CodeDrawer'
import { ScreenProvider } from '../context/ScreenContext'
import CollabLayer from './collab/CollabLayer'
import { createShare, listShares, revokeShare, shareUrl, type ShareRow } from '../lib/shares'
import { collabEnabled } from '../lib/supabase'

/**
 * Chrome léger autour d'un prototype (effet « mise en abyme ») :
 *  - un fil d'Ariane discret en haut à gauche (retour à l'index)
 *  - un bouton « Code » en haut à droite (affiche les sources du proto)
 *  - un fin liseré autour du viewport
 * Le tout en overlay `position: fixed` + `pointer-events` maîtrisés, pour ne
 * pas perturber la mise en page des protos plein écran.
 */
const ProtoFrame = ({
  title,
  slug,
  children,
  scoped = false,
}: {
  title: string
  slug: string
  children: ReactNode
  /** Vue « lien d'interview » : masque le chrome de l'app (garde la collab). */
  scoped?: boolean
}) => {
  const [codeOpen, setCodeOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shares, setShares] = useState<ShareRow[]>([])
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    document.title = `kapptiDrafts | ${title}`
  }, [title])

  const flagCopied = (key: string) => {
    setCopied(key)
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800)
  }
  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl(token))
      flagCopied(token)
    } catch {
      // clipboard indisponible
    }
  }
  const toggleSharePanel = async () => {
    const next = !shareOpen
    setShareOpen(next)
    if (next) setShares(await listShares(slug))
  }
  const onCreate = async () => {
    setCreating(true)
    const token = await createShare(slug)
    setCreating(false)
    if (!token) return
    setShares(await listShares(slug))
    await copy(token)
  }
  const onRevoke = async (token: string) => {
    const ok = await revokeShare(token)
    if (ok) setShares((cur) => cur.filter((s) => s.token !== token))
  }

  return (
    <ScreenProvider>
      {children}

      {/* Collaboration : présence, commentaires épinglés, historique.
          Active aussi sur un lien d'interview (l'invité peut commenter). */}
      <CollabLayer slug={slug} />

      {/* Liseré (décoratif, ne capte pas les clics) */}
      <div style={styles.ring} aria-hidden />

      {!scoped && (
        <>
          {/* Fil d'Ariane */}
          <div style={styles.crumb}>
            <Link to="/" style={styles.home} title="Back to index">
              <span style={styles.arrow}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </span>
              <img src={logo} alt="kapptiDrafts" style={styles.logo} />
            </Link>
            <span style={styles.sep}>/</span>
            <span style={styles.title}>{title}</span>
          </div>

          <div style={styles.topRight}>
            {collabEnabled && (
              <button
                type="button"
                style={{ ...styles.chromeBtn, ...(shareOpen ? styles.chromeBtnActive : null) }}
                onClick={toggleSharePanel}
                title="Interview links for this proto"
              >
                <IconLink size={13} />
                <span>Share</span>
              </button>
            )}
            <button
              type="button"
              style={styles.chromeBtn}
              onClick={() => setCodeOpen(true)}
              title="View this proto's source code"
            >
              <IconCode size={13} />
              <span>Code</span>
            </button>
          </div>

          {shareOpen && (
            <div style={styles.sharePanel}>
              <div style={styles.sharePanelHead}>
                <span style={styles.sharePanelTitle}>Interview links</span>
                <button type="button" style={styles.panelClose} onClick={() => setShareOpen(false)} title="Close">
                  ×
                </button>
              </div>
              <p style={styles.shareHint}>
                A scoped link opens only this proto, no login. Anyone with the link can view and comment.
              </p>
              <button type="button" style={styles.createBtn} onClick={onCreate} disabled={creating}>
                <IconLink size={13} />
                <span>{creating ? 'Creating…' : 'Create a new link'}</span>
              </button>
              <div style={styles.shareList}>
                {shares.length === 0 ? (
                  <span style={styles.shareEmpty}>No active link yet.</span>
                ) : (
                  shares.map((s) => (
                    <div key={s.token} style={styles.shareRow}>
                      <code style={styles.shareToken}>/share/{s.token}</code>
                      <button
                        type="button"
                        style={styles.shareIconBtn}
                        onClick={() => copy(s.token)}
                        title="Copy link"
                      >
                        {copied === s.token ? <IconCheck size={13} /> : <IconLink size={13} />}
                      </button>
                      <button
                        type="button"
                        style={{ ...styles.shareIconBtn, color: '#e0372e' }}
                        onClick={() => onRevoke(s.token)}
                        title="Revoke link"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <CodeDrawer slug={slug} open={codeOpen} onClose={() => setCodeOpen(false)} />
        </>
      )}
    </ScreenProvider>
  )
}

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
  home: { display: 'inline-flex', alignItems: 'center', gap: 4 },
  arrow: { display: 'inline-flex', color: '#98a2b3' },
  logo: { height: 13, width: 'auto', display: 'block' },
  sep: { color: '#c0c4cc' },
  title: { fontWeight: 600, color: '#1a1a1a' },
  topRight: {
    position: 'fixed',
    top: 12,
    right: 12,
    zIndex: 2147483647,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  chromeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 11px',
    fontSize: 12,
    fontWeight: 600,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    color: '#475467',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid #ececf0',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(16,24,40,0.10)',
  },
  chromeBtnActive: { background: '#1c4a47', color: '#fff', borderColor: '#1c4a47' },
  sharePanel: {
    position: 'fixed',
    top: 52,
    right: 12,
    zIndex: 2147483647,
    width: 320,
    maxWidth: 'calc(100vw - 24px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 14,
    background: '#fff',
    border: '1px solid #ececf0',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(16,24,40,0.18)',
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  sharePanelHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sharePanelTitle: { fontSize: 13, fontWeight: 700, color: '#1a1a1a' },
  panelClose: {
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
  shareHint: { margin: 0, fontSize: 12, lineHeight: 1.4, color: '#667085' },
  createBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '8px 11px',
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    background: '#d26334',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  shareList: { display: 'flex', flexDirection: 'column', gap: 6 },
  shareEmpty: { fontSize: 12, color: '#98a2b3' },
  shareRow: { display: 'flex', alignItems: 'center', gap: 6 },
  shareToken: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 12,
    fontFamily: "'Geist Mono', ui-monospace, monospace",
    color: '#475467',
    background: '#f5f5f7',
    padding: '5px 8px',
    borderRadius: 6,
  },
  shareIconBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    color: '#475467',
    background: 'transparent',
    border: '1px solid #ececf0',
    borderRadius: 6,
    cursor: 'pointer',
    flexShrink: 0,
  },
}

export default ProtoFrame
