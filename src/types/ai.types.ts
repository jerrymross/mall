import type { SlotContent } from './content.types'
import type { AIContext } from './document.types'

export interface AIRequest {
  slotId: string
  slotType: string
  promptHint?: string
  aiContext: AIContext
  templateContext?: string
}

export interface AIResponse {
  slotId: string
  content: SlotContent
  model: string
}
