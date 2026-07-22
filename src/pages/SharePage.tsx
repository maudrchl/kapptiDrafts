import { useEffect, useState, type CSSProperties } from 'react'
import { useParams } from 'react-router-dom'
import { Button, EmptyState, Input, PageLoader, Text, IconLink } from '@kapptivate/ui-kit'
import ProtoFrame from '../components/ProtoFrame'
import { protos } from '../protos/registry'
import { resolveShare } from '../lib/shares'
import { useCurrentUser } from '../context/CurrentUser'

/**
 * Lien d'exploration scopé (user interview), public, hors auth Google (cf.
 * middleware). Résout le token → proto et n'affiche QUE ce proto, sans le
 * chrome de l'app (`scoped`). La couche collab reste active : l'invité, une
 * fois son prénom saisi, peut laisser des commentaires (identité invité).
 */
const SharePage = () => {
  const { token } = useParams<{ token: string }>()
  const { user, loading: userLoading, setGuest } = useCurrentUser()
  // undefined = en cours, null = introuvable, string = slug résolu
  const [slug, setSlug] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    if (!token) {
      setSlug(null)
      return
    }
    resolveShare(token).then((s) => {
      if (!cancelled) setSlug(s)
    })
    return () => {
      cancelled = true
    }
  }, [token])

  if (slug === undefined) return <PageLoader />

  // Partage = protos React uniquement (les archives HTML ne sont pas partageables :
  // l'iframe /folder/* est bloquée par le middleware hors login → cf. bouton Share
  // masqué sur ces docs). Un token HTML retombe donc sur "lien indisponible".
  const entry = slug ? protos.find((p) => p.slug === slug) : undefined
  if (!entry) {
    return (
      <div style={styles.center}>
        <EmptyState
          icon={<IconLink color="var(--color-text-secondary)" />}
          text="This link is no longer available"
          description="Ask your contact at Kapptivate for a fresh interview link."
        />
      </div>
    )
  }

  // Identité invité requise pour être attribué (présence + commentaires).
  if (!user) {
    if (userLoading) return <PageLoader />
    return <GuestGate title={entry.title} onJoin={setGuest} />
  }

  const { Component, title } = entry
  return (
    <ProtoFrame title={title} slug={entry.slug} scoped>
      <Component />
    </ProtoFrame>
  )
}

/* Petit écran d'accueil : le prénom sert à signer les commentaires laissés. */
const GuestGate = ({ title, onJoin }: { title: string; onJoin: (name: string) => void }) => {
  const [name, setName] = useState('')
  const join = () => {
    const n = name.trim()
    if (n) onJoin(n)
  }
  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <Text size="lg" weight="bold">
          {title}
        </Text>
        <Text size="s" color="secondary">
          You've been invited to explore this prototype. Enter your name so your comments are attributed.
        </Text>
        <Input
          value={name}
          size="m"
          fullWidth
          placeholder="Your name"
          onChange={(e) => setName(e.target.value)}
          onPressEnter={join}
        />
        <Button color="primary" onClick={join} disabled={!name.trim()}>
          Start exploring
        </Button>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: 'var(--color-surface-grey, #fafafb)',
  },
  card: {
    width: 360,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    padding: 24,
    background: '#fff',
    border: '1px solid #ececf0',
    borderRadius: 14,
    boxShadow: '0 8px 28px rgba(16,24,40,0.12)',
  },
}

export default SharePage
