import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-scss'
import 'prismjs/themes/prism-tomorrow.css'
import {
  Drawer,
  Select,
  Loader,
  Button,
  Text,
  IconCopy,
  IconCheck,
} from '@kapptivate/ui-kit'

/**
 * Charge à la demande les sources d'un proto (via glob raw non-eager) et les
 * affiche colorées dans un Drawer. Un seul glob couvre tous les protos.
 */
const rawFiles = import.meta.glob('../protos/**/*.{tsx,ts,scss,css}', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

type ProtoFile = {
  path: string
  /** Chemin relatif au repo, ex. src/protos/ai-usage/Proto.tsx */
  repoPath: string
  name: string
  lang: string
  code: string
}

const langOf = (path: string): string => {
  if (path.endsWith('.tsx')) return 'tsx'
  if (path.endsWith('.ts')) return 'typescript'
  if (path.endsWith('.scss')) return 'scss'
  if (path.endsWith('.css')) return 'css'
  return 'tsx'
}

const basename = (path: string) => path.split('/').pop() ?? path

// Proto.tsx en premier, meta ensuite, puis alphabétique.
const rank = (name: string) =>
  name === 'Proto.tsx' ? 0 : name === 'meta.ts' ? 1 : 2

const CodeDrawer = ({
  slug,
  open,
  onClose,
}: {
  slug: string
  open: boolean
  onClose: () => void
}) => {
  const [files, setFiles] = useState<ProtoFile[] | null>(null)
  const [active, setActive] = useState<string>()
  const [copied, setCopied] = useState(false)
  const [copiedPath, setCopiedPath] = useState(false)

  useEffect(() => {
    if (!open || files) return
    let cancelled = false
    const prefix = `../protos/${slug}/`
    const paths = Object.keys(rawFiles)
      .filter((p) => p.startsWith(prefix))
      .sort(
        (a, b) =>
          rank(basename(a)) - rank(basename(b)) ||
          basename(a).localeCompare(basename(b)),
      )
    Promise.all(
      paths.map(async (path) => ({
        path,
        repoPath: path.replace('../', 'src/'),
        name: basename(path),
        lang: langOf(path),
        code: await rawFiles[path](),
      })),
    ).then((loaded) => {
      if (cancelled) return
      setFiles(loaded)
      setActive(loaded[0]?.name)
    })
    return () => {
      cancelled = true
    }
  }, [open, slug, files])

  const current = files?.find((f) => f.name === active) ?? files?.[0]

  const html = useMemo(() => {
    if (!current) return ''
    const grammar = Prism.languages[current.lang] ?? Prism.languages.tsx
    return Prism.highlight(current.code, grammar, current.lang)
  }, [current])

  const copy = () => {
    if (!current) return
    navigator.clipboard?.writeText(current.code).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    })
  }

  const copyPath = () => {
    if (!current) return
    navigator.clipboard?.writeText(current.repoPath).then(() => {
      setCopiedPath(true)
      window.setTimeout(() => setCopiedPath(false), 1400)
    })
  }

  return (
    <Drawer open={open} onClose={onClose} title="Source code" width={780}>
      {!files ? (
        <div style={styles.center}>
          <Loader size="medium" />
        </div>
      ) : files.length === 0 ? (
        <Text color="secondary">No source found for this proto.</Text>
      ) : (
        <div style={styles.wrap}>
          <div style={styles.toolbar}>
            <div style={{ minWidth: 220 }}>
              <Select
                value={active}
                onChange={(_e, v) => setActive(v)}
                options={files.map((f) => ({ label: f.name, value: f.name }))}
                fullWidth
              />
            </div>
            <Button
              color="secondary"
              size="m"
              icon={copied ? IconCheck : IconCopy}
              onClick={copy}
            >
              {copied ? 'Copied' : 'Copy code'}
            </Button>
          </div>
          <div style={styles.pathBar}>
            <Text size="s" color="secondary" mono>
              {current?.repoPath}
            </Text>
            <Button
              color="invisible"
              size="s"
              icon={copiedPath ? IconCheck : IconCopy}
              onClick={copyPath}
            >
              {copiedPath ? 'Copied' : 'Copy path'}
            </Button>
          </div>
          <div style={styles.codeScroll}>
            <pre className={`language-${current?.lang}`} style={styles.pre}>
              <code
                className={`language-${current?.lang}`}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </pre>
          </div>
        </div>
      )}
    </Drawer>
  )
}

const styles: Record<string, CSSProperties> = {
  center: { display: 'flex', justifyContent: 'center', padding: '3rem 0' },
  wrap: { display: 'flex', flexDirection: 'column', gap: 12, height: '100%' },
  toolbar: { display: 'flex', alignItems: 'center', gap: 12 },
  pathBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '6px 10px',
    background: 'var(--color-surface-grey, #fafafb)',
    border: '1px solid var(--color-border-grey, #e4e4e7)',
    borderRadius: 8,
  },
  codeScroll: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    borderRadius: 10,
    border: '1px solid #2d2d2d',
    background: '#2d2d2d',
  },
  pre: {
    margin: 0,
    padding: 16,
    fontSize: 12.5,
    lineHeight: 1.6,
    minWidth: 'min-content',
  },
}

export default CodeDrawer
