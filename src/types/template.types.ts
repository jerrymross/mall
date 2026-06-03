import type { ColorTokenKey } from './designSystem.types'
import type { SlotContent } from './content.types'

export type SlotType =
  | 'heading'
  | 'subheading'
  | 'body-text'
  | 'bullet-list'
  | 'cta'
  | 'contact'
  | 'image'
  | 'gradient-background'
  | 'logo'
  | 'table'
  | 'divider'

export type PageOrientation = 'portrait' | 'landscape'

export interface SlotPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface SlotConstraints {
  typographyTokenKey?: string
  colorTokenKey?: ColorTokenKey
  bgColorTokenKey?: ColorTokenKey
  gradientId?: string
  logoVariant?: 'full-color' | 'white' | 'black'
  maxChars?: number
  maxBullets?: number
  imageAspectRatio?: number
  required?: boolean
  borderRadius?: number
}

export interface TemplateSlot {
  id: string
  type: SlotType
  label: string
  position: SlotPosition
  constraints: SlotConstraints
  aiPromptHint?: string
  zIndex: number
  visible: boolean
  locked?: boolean
  defaultContent?: SlotContent
}

export interface TemplatePage {
  pageNumber: number
  orientation: PageOrientation
  backgroundGradientId?: string
  backgroundColorTokenKey?: ColorTokenKey
  slots: TemplateSlot[]
}

export interface TemplateDefinition {
  id: string
  name: string
  description: string
  thumbnailUrl: string
  category: string
  designSystemId: string
  pages: TemplatePage[]
  isPublished: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}
