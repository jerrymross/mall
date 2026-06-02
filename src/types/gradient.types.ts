import type { ColorTokenKey } from './designSystem.types'

export interface ColorStop {
  colorTokenKey: ColorTokenKey
  position: number
  opacity: number
}

export type GradientType = 'linear' | 'radial'

export interface GradientDefinition {
  id: string
  name: string
  type: GradientType
  angle?: number
  shape?: 'circle' | 'ellipse'
  stops: ColorStop[]
  isPreset: boolean
}
