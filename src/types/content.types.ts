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

export interface ImageContent {
  type: 'image'
  storageUrl: string
  altText?: string
  objectFit?: 'cover' | 'contain'
  focalPoint?: { x: number; y: number }
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

export type ContentMap = Record<string, SlotContent>
