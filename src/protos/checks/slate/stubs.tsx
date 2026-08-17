/**
 * Stubs des briques de l'app produit (kapptigalaxy) dont dépend SlateInputTag
 * mais qui ne sont pas disponibles dans le proto kapptidrafts. On reproduit
 * l'API minimale nécessaire (types + composants), sans le backend.
 */
import { useEffect, useState, type ReactNode } from 'react'
import { Button, IconBraces, IconList, IconLock, Input, Modal, Select } from '@kapptivate/ui-kit'
import classnames from 'classnames/bind'
import styles from './input-tag.module.scss'
import type { BuiltInParams, BuiltInType, NumberBuiltInParams, TextBuiltInParams } from './types'

const cx = classnames.bind(styles)

// --- Variable (routes/Configurations/Variables/types) ---
export type Variable = {
  id: number | string
  name: string
  type?: string
  default_value?: string | number | null
  variable_group?: number
}

// --- i18n (react-i18next) : le proto n'a pas i18next → petit dictionnaire des
// clés utilisées par SlateInputTag, avec repli sur la clé.
const LABELS: Record<string, string> = {
  'list.variable.createGlobal': 'Create global variable',
  'drawer.noVariables.title': 'No variables',
}
export const useTranslation = (_namespace?: string): [(key: string) => string] => [
  (key: string) => LABELS[key] ?? key,
]

// --- VariableTag (routes/Configurations/components/VariableTag) ---
// Version simplifiée : pilule bleue (tag--blue) qui porte les enfants Slate.
export const VariableTag = ({
  variable,
  children,
}: {
  variable: string | Variable
  bucket?: unknown
  children?: ReactNode
}) => {
  const name = typeof variable === 'string' ? variable : variable.name
  return <span className={cx('tag', 'tag--blue')}>{children ?? name}</span>
}

// --- GlobalVarLabel (routes/.../useFormattedGlobalVariables) ---
export const GlobalVarLabel = ({ label }: { label: string }) => <>{label}</>

// --- useVariableGroupVariables : pas de groupes de variables dans le proto ---
export const useVariableGroupVariables = (
  _product?: string | null,
  _groupId?: number,
): { variableGroupVariables: Variable[] } => ({
  variableGroupVariables: [],
})

// --- Modales de création / built-in : non gérées dans le proto ---
/** Libellé d'un type de variable : icône + nom, comme dans le produit. */
const typeLabel = (Icon: (p: { size?: number }) => ReactNode, label: string) => (
  <span className={styles.cvType}>
    <Icon size={12} />
    {label}
  </span>
)

/**
 * Modale de création d'une variable globale (Configurations), reprise du
 * produit : nom encadré de { }, type, description, valeur. Le stub d'origine
 * renvoyait `null`, donc le bouton du picker ne faisait rien.
 */
export const VariableModal = ({
  open,
  setOpen,
  onSuccess,
  defaultValue,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess: (variable: Variable) => void
  defaultValue?: string
}) => {
  const [name, setName] = useState('')
  const [type, setType] = useState('single')
  const [description, setDescription] = useState('')
  const [value, setValue] = useState(defaultValue ?? '')

  useEffect(() => {
    if (open) {
      setName('')
      setType('single')
      setDescription('')
      setValue(defaultValue ?? '')
    }
  }, [open, defaultValue])

  if (!open) return null

  const create = () => {
    if (!name.trim()) return
    onSuccess({ id: name, name: name.trim(), type, default_value: value })
    setOpen(false)
  }

  return (
    <Modal open width={620} title="Create global variable" onCancel={() => setOpen(false)}>
      <Modal.Content>
        <div className={styles.cvBody}>
          <div className={styles.cvRow}>
            <div className={styles.cvField}>
              <label className={styles.cvLabel} htmlFor="cv-name">
                Name
              </label>
              {/* l'Input du DS ne rend pas la boîte suffixe : { } faits main */}
              <span className={styles.cvName}>
                <span className={styles.cvBrace}>{'{'}</span>
                <input
                  id="cv-name"
                  className={styles.cvNameInput}
                  placeholder="e.g. user_email"
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/\s/g, ''))}
                />
                <span className={styles.cvBrace}>{'}'}</span>
              </span>
              <span className={styles.cvHint}>No spaces or other special characters allowed.</span>
            </div>
            <div className={styles.cvField}>
              <label className={styles.cvLabel}>Type</label>
              <Select
                size="l"
                fullWidth
                value={type}
                onChange={(a: any, b: any) => setType(typeof a === 'string' ? a : (b ?? 'single'))}
                options={[
                  { label: typeLabel(IconBraces, 'Single value'), value: 'single' },
                  { label: typeLabel(IconLock, 'Secret'), value: 'secret' },
                  { label: typeLabel(IconList, 'Choice'), value: 'choice' },
                ]}
              />
            </div>
          </div>

          <div className={styles.cvField}>
            <label className={styles.cvLabel} htmlFor="cv-desc">
              Description (optional)
            </label>
            <Input
              size="l"
              fullWidth
              name="cv-desc"
              placeholder="Variable description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.cvField}>
            <label className={styles.cvLabel} htmlFor="cv-value">
              Value
            </label>
            <Input
              size="l"
              fullWidth
              name="cv-value"
              placeholder="Enter value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <div className={styles.cvFooter}>
          <Button color="invisible" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button color="primary" disabled={!name.trim()} onClick={create}>
            Create
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

/**
 * Personnalisation d'une valeur générée (item « Custom » de l'onglet Random).
 * Le portage câble déjà l'enregistrement et la réédition d'un tag existant ;
 * seul le formulaire manquait.
 */
export const CustomBuiltInModal = ({
  open,
  setOpen,
  onSave,
  initialValues,
  initialType,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onSave: (type: BuiltInType, params: BuiltInParams) => void
  initialValues?: BuiltInParams
  initialType?: BuiltInType
}) => {
  const [type, setType] = useState<BuiltInType>(initialType ?? 'random_text')
  const [length, setLength] = useState(String((initialValues as TextBuiltInParams)?.length ?? 10))
  const [min, setMin] = useState(String((initialValues as NumberBuiltInParams)?.min ?? 0))
  const [max, setMax] = useState(String((initialValues as NumberBuiltInParams)?.max ?? 100))

  useEffect(() => {
    if (open) setType(initialType ?? 'random_text')
  }, [open, initialType])

  if (!open) return null

  const save = () => {
    if (type === 'random_text') {
      onSave(type, {
        length: Number(length) || 10,
        include_uppercase: true,
        include_lowercase: true,
        include_numerical: true,
        include_special: false,
        min_numerical: 0,
        min_special: 0,
      })
    } else if (type === 'random_number') {
      onSave(type, { min: Number(min) || 0, max: Number(max) || 100 })
    } else {
      onSave(type, { format: 1 })
    }
    setOpen(false)
  }

  return (
    <Modal open width={520} title="Custom random value" onCancel={() => setOpen(false)}>
      <Modal.Content>
        <div className={styles.cvBody}>
          <div className={styles.cvField}>
            <label className={styles.cvLabel}>Kind</label>
            <Select
              size="l"
              fullWidth
              value={type}
              onChange={(a: any, b: any) =>
                setType((typeof a === 'string' ? a : (b ?? 'random_text')) as BuiltInType)
              }
              options={[
                { label: 'Text', value: 'random_text' },
                { label: 'Number', value: 'random_number' },
                { label: 'Date', value: 'random_date' },
              ]}
            />
          </div>

          {type === 'random_text' && (
            <div className={styles.cvField}>
              <label className={styles.cvLabel} htmlFor="cb-len">
                Length
              </label>
              <Input
                size="l"
                fullWidth
                name="cb-len"
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>
          )}

          {type === 'random_number' && (
            <div className={styles.cvRow}>
              <div className={styles.cvField}>
                <label className={styles.cvLabel} htmlFor="cb-min">
                  Minimum
                </label>
                <Input
                  size="l"
                  fullWidth
                  name="cb-min"
                  type="number"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                />
              </div>
              <div className={styles.cvField}>
                <label className={styles.cvLabel} htmlFor="cb-max">
                  Maximum
                </label>
                <Input
                  size="l"
                  fullWidth
                  name="cb-max"
                  type="number"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                />
              </div>
            </div>
          )}

          {type === 'random_date' && (
            <span className={styles.cvHint}>A date picked at random when the run starts.</span>
          )}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <div className={styles.cvFooter}>
          <Button color="invisible" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={save}>
            Save
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}
