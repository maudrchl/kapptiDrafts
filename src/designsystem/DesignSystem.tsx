import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { SearchInput, BackButton, Button, IconCopy, IconCheck } from '@kapptivate/ui-kit'
import { GROUPS, ALL_PAGES } from './registry'
import { domToMarkdown } from './toMarkdown'
import logo from '../assets/kapptidesign-logo.svg'
import './designsystem.css'

const CopyMarkdownButton = ({ getRoot }: { getRoot: () => HTMLElement | null }) => {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    const root = getRoot()
    if (!root) return
    navigator.clipboard?.writeText(domToMarkdown(root)).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }
  return (
    <div className="dsMdCopy">
      <Button
        color="secondary"
        size="s"
        icon={copied ? IconCheck : IconCopy}
        onClick={copy}
      >
        {copied ? 'Copied' : 'Copy as Markdown'}
      </Button>
    </div>
  )
}

const DesignSystem = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [query, setQuery] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)

  const current = ALL_PAGES.find((p) => p.slug === slug) ?? ALL_PAGES[0]
  const Current = current.Component

  useEffect(() => {
    document.title = `kapptiDrafts | Design System · ${current.name}`
  }, [current.name])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GROUPS
    return GROUPS.map((g) => ({
      ...g,
      pages: g.pages.filter((p) => p.name.toLowerCase().includes(q)),
    })).filter((g) => g.pages.length > 0)
  }, [query])

  return (
    <div className="ds">
      <aside className="dsSidebar">
        <div className="dsBack">
          <BackButton onClick={() => navigate('/')} size="m" disabled={false} className="">Back</BackButton>
        </div>

        <div className="dsBrand">
          <img src={logo} alt="kapptiDesign" className="dsBrandLogo" />
        </div>

        <div className="dsSearch">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search…"
            fullwidth
            size="m"
          />
        </div>

        {groups.map((group) => (
          <div key={group.label} className="dsNavGroup">
            <div className="dsNavGroupLabel">{group.label}</div>
            {group.pages.map((page) => (
              <Link
                key={page.slug}
                to={`/design-system/${page.slug}`}
                className={`dsNavLink${page.slug === current.slug ? ' active' : ''}`}
              >
                {page.name}
              </Link>
            ))}
          </div>
        ))}
      </aside>

      <main className="dsContent">
        <CopyMarkdownButton getRoot={() => contentRef.current} />
        <div ref={contentRef}>
          <Current />
        </div>
      </main>
    </div>
  )
}

export default DesignSystem
