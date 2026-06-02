export type ColorTokenKey =
  | 'brand-primary'
  | 'brand-secondary'
  | 'brand-accent'
  | 'brand-coral'
  | 'neutral-100'
  | 'neutral-200'
  | 'neutral-300'
  | 'neutral-800'
  | 'neutral-900'
  | 'surface-light'
  | 'surface-dark'

export interface ColorToken {
  key: ColorTokenKey
  label: string
  hex: string
  usageNotes?: string
}

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

export interface TypographyToken {
  key: string
  fontFamily: string
  fontWeight: FontWeight
  sizeRem: number
  lineHeight: number
  letterSpacing?: string
  colorTokenKey: ColorTokenKey
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
}

export interface SpacingToken {
  key: string
  valueRem: number
}

export interface LogoRule {
  minWidthPx: number
  clearspaceMultiplier: number
  allowedVariants: ('full-color' | 'white' | 'black')[]
  allowedPlacements: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')[]
}

export interface DesignSystem {
  id: string
  name: string
  version: string
  colors: ColorToken[]
  typography: TypographyToken[]
  spacing: SpacingToken[]
  logoRules: LogoRule
  logoAssetUrl: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
