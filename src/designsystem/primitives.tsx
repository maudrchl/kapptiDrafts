import { useState, type ReactNode } from 'react'
import { Title, Text, IconCopy, IconCheck } from '@kapptivate/ui-kit'

/** En-tête + corps d'une page de doc composant. */
export const Page = ({
  title,
  description,
  importCode,
  children,
}: {
  title: string
  description?: ReactNode
  importCode?: string
  children: ReactNode
}) => (
  <div>
    <div className="dsPageHead">
      <Title size="h2">{title}</Title>
    </div>
    {description && (
      <div className="dsPageDesc">
        <Text color="secondary" size="lg">
          {description}
        </Text>
      </div>
    )}
    {importCode && <Code>{importCode}</Code>}
    {children}
  </div>
)

/** Une section de démo : titre + description + surface d'aperçu. */
export const Demo = ({
  title,
  description,
  column,
  children,
}: {
  title: string
  description?: ReactNode
  /** empile les enfants verticalement plutôt qu'en ligne */
  column?: boolean
  children: ReactNode
}) => (
  <section className="dsSection">
    <div className="dsSectionHead">
      <Title size="h5">{title}</Title>
      {description && (
        <div style={{ marginTop: 4 }}>
          <Text size="s" color="secondary">
            {description}
          </Text>
        </div>
      )}
    </div>
    <div className={`dsSurface${column ? ' dsSurfaceColumn' : ''}`}>
      {children}
    </div>
  </section>
)

export const Row = ({ children }: { children: ReactNode }) => (
  <div className="dsRow">{children}</div>
)

export type PropRow = {
  name: string
  type: string
  default?: string
  required?: boolean
  description?: ReactNode
}

/** Tableau des props d'un composant (nom, type, défaut, description). */
export const PropsTable = ({
  title = 'Props',
  rows,
}: {
  title?: string
  rows: PropRow[]
}) => (
  <section className="dsSection">
    <div className="dsSectionHead">
      <Title size="h5">{title}</Title>
    </div>
    <div className="dsPropsWrap">
      <table className="dsProps">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>
                <code className="dsPropName">{r.name}</code>
                {r.required && <span className="dsPropReq" title="Required">*</span>}
              </td>
              <td><code className="dsPropType">{r.type}</code></td>
              <td>{r.default ? <code className="dsPropDefault">{r.default}</code> : <span className="dsPropDash">—</span>}</td>
              <td className="dsPropDesc">{r.description ?? <span className="dsPropDash">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

export const Stack = ({ children }: { children: ReactNode }) => (
  <div className="dsStack">{children}</div>
)

/** Bloc de code avec bouton copier. */
export const Code = ({ children }: { children: string }) => {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(children).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    })
  }
  return (
    <div className="dsCode">
      <button className="dsCodeCopy" onClick={copy} type="button">
        {copied ? (
          <IconCheck size={12} style={{ verticalAlign: '-2px' }} />
        ) : (
          <IconCopy size={12} style={{ verticalAlign: '-2px' }} />
        )}{' '}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre>{children}</pre>
    </div>
  )
}
