export type BuiltInType = 'random_text' | 'random_number' | 'random_date'

export type TextBuiltInParams = {
  length: number
  include_uppercase: boolean
  include_lowercase: boolean
  include_numerical: boolean
  include_special: boolean
  min_numerical: number
  min_special: number
}

export type NumberBuiltInParams = {
  min?: number | null
  max?: number | null
  nb_digits?: number | null
}

export type DateBuiltInParams = {
  format?: 1 | 2 | 3 | 4 | 5
  range?: {
    start: string
    end: string
  } | null
  offset?: {
    unit: string
    value: number
  } | null
}

export type BuiltInParams = TextBuiltInParams | NumberBuiltInParams | DateBuiltInParams

export type BaseBuiltInProps<T extends BuiltInParams> = {
  setValues: (values: T) => void
  values?: T
  currentType: BuiltInType
  setCurrentType: (type: BuiltInType) => void
}
