import type { ContentMap } from './content.types'

export type DocumentStatus = 'draft' | 'ready' | 'exported'

export interface AIContext {
  productName: string
  targetAudience?: string
  tone?: 'formal' | 'friendly' | 'inspiring' | 'technical'
  keywords?: string[]
  language: 'sv' | 'en'
}

export interface ProductSheet {
  id: string
  title: string
  templateId: string
  designSystemId: string
  contentMap: ContentMap
  aiContext: AIContext
  status: DocumentStatus
  exportedPdfUrl?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}
