export interface HeadingContent {
  type: 'heading'
  text: string
}

export interface SubheadingContent {
  type: 'subheading'
  text: string
}

export interface BodyTextContent {
  type: 'body-text'
  text: string
}

export interface BulletListContent {
  type: 'bullet-list'
  items: string[]
}

export interface CTAContent {
  type: 'cta'
  label: string
  url?: string
}

export interface ContactContent {
  type: 'contact'
  name?: string
  title?: string
  email?: string
  phone?: string
  photoUrl?: string
}

export interface OverlayStop {
  colorTokenKey: string
  opacity: number      // 0–1
  position: number     // 0–100 (%)
}

export interface ImageOverlay {
  type: 'linear' | 'radial'
  angle: number        // grader (linear), ignoreras för radial
  stops: OverlayStop[]
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'color-burn'
}

export interface ImageContent {
  type: 'image'
  storageUrl: string
  altText?: string
  objectFit?: 'cover' | 'contain'
  overlay?: ImageOverlay
  focalPoint?: { x: number; y: number }
}

export type CellAlign = 'left' | 'center' | 'right'

export interface TableCell {
  text: string
  align?: CellAlign
  bold?: boolean
}

export interface TableContent {
  type: 'table'
  rows: TableCell[][]
  colWidths: number[]
  headerRow: boolean
  headerBgColorTokenKey: string
  evenBgColorTokenKey: string
  oddBgColorTokenKey: string
  textColorTokenKey: string
  headerTextColorTokenKey: string
  fontSize: number
  showBorders: boolean
  borderColorTokenKey?: string
}

export interface GradientBackgroundContent {
  type: 'gradient-background'
  gradientId: string
}

export interface LogoContent {
  type: 'logo'
  variant: 'full-color' | 'white' | 'black'
}

export type SlotContent =
  | HeadingContent
  | SubheadingContent
  | BodyTextContent
  | BulletListContent
  | CTAContent
  | ContactContent
  | ImageContent
  | GradientBackgroundContent
  | LogoContent
  | TableContent

export type ContentMap = Record<string, SlotContent>
