/**
 * Stubs des briques de l'app produit (kapptigalaxy) dont dépend SlateInputTag
 * mais qui ne sont pas disponibles dans le proto kapptidrafts. On reproduit
 * l'API minimale nécessaire (types + composants), sans le backend.
 */
import type { ReactNode } from 'react'
import classnames from 'classnames/bind'
import styles from './input-tag.module.scss'
import type { BuiltInParams, BuiltInType } from './types'

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
  'list.variable.createGlobal': 'Create variable',
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
export const VariableModal = (_props: {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess: (variable: Variable) => void
  defaultValue?: string
}) => null

export const CustomBuiltInModal = (_props: {
  open: boolean
  setOpen: (open: boolean) => void
  onSave: (type: BuiltInType, params: BuiltInParams) => void
  initialValues?: BuiltInParams
  initialType?: BuiltInType
}) => null
