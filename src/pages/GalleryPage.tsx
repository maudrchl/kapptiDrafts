import { useState, type ReactNode, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Title,
  Text,
  Button,
  StatusTag,
  Tag,
  TrendTag,
  ProgressBar,
  Banner,
  Input,
  SearchInput,
  Select,
  Toggle,
  Segmented,
  CounterCard,
  Avatar,
  EmptyState,
  Dropdown,
  IconArrowLeft,
  IconPlus,
  IconDownload,
  IconTrash,
  IconPencil,
  IconChevronDown,
  IconFolder,
} from 'ui-kit'

/** Une section thématique avec un titre et une grille de specimens. */
const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section style={styles.section}>
    <Title size="h5">{title}</Title>
    <div style={styles.grid}>{children}</div>
  </section>
)

/** Un specimen = une tuile étiquetée contenant un exemple live. */
const Specimen = ({
  label,
  wide,
  children,
}: {
  label: string
  wide?: boolean
  children: ReactNode
}) => (
  <div style={{ ...styles.specimen, ...(wide ? styles.specimenWide : null) }}>
    <div style={styles.specimenLabel}>{label}</div>
    <div style={styles.specimenBody}>{children}</div>
  </div>
)

const GalleryPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [text, setText] = useState('')
  const [seg, setSeg] = useState('week')
  const [selectVal, setSelectVal] = useState<string>()
  const [toggle, setToggle] = useState(true)

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <Button
          color="invisible"
          icon={IconArrowLeft}
          onClick={() => navigate('/')}
        >
          Retour
        </Button>
      </div>
      <Title size="h2">Galerie de composants</Title>
      <Text size="s" color="secondary">
        Référence live du design system — pioche visuellement quand tu montes un
        prototype.
      </Text>

      {/* Typographie */}
      <Section title="Typographie">
        <Specimen label="Titles">
          <div style={styles.stack}>
            <Title size="h1">Heading 1</Title>
            <Title size="h2">Heading 2</Title>
            <Title size="h3">Heading 3</Title>
            <Title size="h4">Heading 4</Title>
          </div>
        </Specimen>
        <Specimen label="Text — tailles">
          <div style={styles.stack}>
            <Text size="lg">Text large</Text>
            <Text>Text base</Text>
            <Text size="s">Text small</Text>
            <Text size="xs">Text xs</Text>
            <Text mono>Text mono 12.4M</Text>
          </div>
        </Specimen>
        <Specimen label="Text — couleurs">
          <div style={styles.stack}>
            <Text color="secondary">Secondary</Text>
            <Text color="third">Third</Text>
            <Text color="success">Success</Text>
            <Text color="error">Error</Text>
          </div>
        </Specimen>
      </Section>

      {/* Boutons */}
      <Section title="Boutons">
        <Specimen label="Couleurs">
          <div style={styles.row}>
            <Button color="primary">Primary</Button>
            <Button color="secondary">Secondary</Button>
            <Button color="invisible">Invisible</Button>
            <Button color="danger-p">Danger</Button>
            <Button color="danger-s">Danger soft</Button>
          </div>
        </Specimen>
        <Specimen label="Tailles">
          <div style={styles.row}>
            <Button color="secondary" size="s">
              Small
            </Button>
            <Button color="secondary" size="m">
              Medium
            </Button>
            <Button color="secondary" size="l">
              Large
            </Button>
          </div>
        </Specimen>
        <Specimen label="Icône & états">
          <div style={styles.row}>
            <Button color="primary" icon={IconPlus}>
              Créer
            </Button>
            <Button color="secondary" icon={IconDownload}>
              Export
            </Button>
            <Button color="danger-s" icon={IconTrash}>
              Supprimer
            </Button>
            <Button color="primary" isLoading>
              Loading
            </Button>
            <Button color="primary" disabled>
              Disabled
            </Button>
          </div>
        </Specimen>
      </Section>

      {/* Statuts & tags */}
      <Section title="Statuts & tags">
        <Specimen label="StatusTag — couleurs">
          <div style={styles.row}>
            <StatusTag variant="ghost" color="success">
              déployé
            </StatusTag>
            <StatusTag variant="ghost" color="info">
              en cours dev
            </StatusTag>
            <StatusTag variant="ghost" color="warning">
              en cours design
            </StatusTag>
            <StatusTag variant="ghost" color="failed">
              failed
            </StatusTag>
            <StatusTag variant="ghost" color="neutral">
              neutral
            </StatusTag>
          </div>
        </Specimen>
        <Specimen label="StatusTag — variants">
          <div style={styles.row}>
            <StatusTag variant="filled" color="success">
              filled
            </StatusTag>
            <StatusTag variant="outline" color="info">
              outline
            </StatusTag>
            <StatusTag variant="ghost" color="alert">
              ghost
            </StatusTag>
          </div>
        </Specimen>
        <Specimen label="Tags">
          <div style={styles.row}>
            <Tag color="blue">blue</Tag>
            <Tag color="green">green</Tag>
            <Tag color="orange">orange</Tag>
            <Tag color="purple">purple</Tag>
            <Tag color="red">red</Tag>
            <Tag color="grey" uppercase>
              uppercase
            </Tag>
          </div>
        </Specimen>
      </Section>

      {/* Métriques */}
      <Section title="Métriques">
        <Specimen label="CounterCard">
          <CounterCard
            title="Active users"
            value={100000}
            trend={<TrendTag current={110} previous={100} />}
          />
        </Specimen>
        <Specimen label="CounterCard — trend inversé">
          <CounterCard
            title="Error rate"
            value="2.4%"
            trend={<TrendTag current={40} previous={55} invertColor />}
          />
        </Specimen>
        <Specimen label="ProgressBar">
          <div style={styles.stack}>
            <ProgressBar value={30} />
            <ProgressBar value={70} />
            <ProgressBar value={92} />
          </div>
        </Specimen>
      </Section>

      {/* Champs & contrôles */}
      <Section title="Champs & contrôles">
        <Specimen label="Input">
          <Input
            label="Label"
            placeholder="Placeholder…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Specimen>
        <Specimen label="SearchInput">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher…"
            fullwidth
          />
        </Specimen>
        <Specimen label="Select">
          <Select
            label="Sélecteur"
            placeholder="Choisir…"
            value={selectVal}
            onChange={(_e, v) => setSelectVal(v)}
            fullWidth
            options={[
              { label: 'Option 1', value: '1' },
              { label: 'Option 2', value: '2' },
              { label: 'Option 3', value: '3' },
            ]}
          />
        </Specimen>
        <Specimen label="Segmented">
          <Segmented
            value={seg}
            onChange={setSeg}
            options={[
              { label: 'Jour', value: 'day' },
              { label: 'Semaine', value: 'week' },
              { label: 'Mois', value: 'month' },
            ]}
          />
        </Specimen>
        <Specimen label="Toggle">
          <Toggle
            title="Notifications"
            description="Recevoir les alertes par email"
            value={toggle}
            onChange={setToggle}
          />
        </Specimen>
        <Specimen label="Dropdown">
          <Dropdown
            menu={{
              items: [
                { key: 'edit', label: 'Éditer', icon: <IconPencil size={12} /> },
                { key: 'dup', label: 'Dupliquer' },
                { type: 'divider' },
                {
                  key: 'del',
                  label: 'Supprimer',
                  danger: true,
                  icon: <IconTrash size={12} />,
                },
              ],
            }}
          >
            <Button color="secondary">
              Menu
              <IconChevronDown size={14} style={{ marginLeft: 6 }} />
            </Button>
          </Dropdown>
        </Specimen>
      </Section>

      {/* Feedback & médias */}
      <Section title="Feedback & médias">
        <Specimen label="Banners" wide>
          <div style={styles.stack}>
            <Banner variant="primary" description="Message d'information" />
            <Banner
              variant="warning"
              description="Attention, quota bientôt atteint"
            />
            <Banner variant="error" description="Une erreur est survenue" />
          </div>
        </Specimen>
        <Specimen label="Avatar">
          <div style={styles.row}>
            <Avatar name="Maud" size="small" />
            <Avatar name="Maud" additionalName="Rochel" />
            <Avatar name="Kapptivate" size="large" />
          </div>
        </Specimen>
        <Specimen label="EmptyState" wide>
          <EmptyState
            icon={<IconFolder color="var(--color-text-secondary)" />}
            text="Rien à afficher"
            description="Les éléments apparaîtront ici."
          />
        </Specimen>
      </Section>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  // flex:1 + minWidth:0 car AntdTheme enveloppe l'app dans un conteneur flex
  page: { flex: 1, minWidth: 0, padding: '2rem 3rem 5rem' },
  section: { marginTop: 40 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
    marginTop: 16,
  },
  specimen: {
    border: '1px solid #ececf0',
    borderRadius: 12,
    background: '#fff',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  specimenWide: { gridColumn: '1 / -1' },
  specimenLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#98a2b3',
    padding: '10px 14px',
    borderBottom: '1px solid #f2f4f7',
    background: '#fcfcfd',
  },
  specimenBody: {
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  stack: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
}

export default GalleryPage
