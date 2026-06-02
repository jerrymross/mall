import { create } from 'zustand'
import type { SlotContent } from '../types/content.types'

interface AIStore {
  generatingSlotIds: Set<string>
  suggestions: Record<string, SlotContent>
  setGenerating: (slotId: string, generating: boolean) => void
  setSuggestion: (slotId: string, content: SlotContent) => void
  clearSuggestion: (slotId: string) => void
}

export const useAIStore = create<AIStore>((set) => ({
  generatingSlotIds: new Set(),
  suggestions: {},

  setGenerating: (slotId, generating) =>
    set((state) => {
      const next = new Set(state.generatingSlotIds)
      if (generating) next.add(slotId)
      else next.delete(slotId)
      return { generatingSlotIds: next }
    }),

  setSuggestion: (slotId, content) =>
    set((state) => ({ suggestions: { ...state.suggestions, [slotId]: content } })),

  clearSuggestion: (slotId) =>
    set((state) => {
      const next = { ...state.suggestions }
      delete next[slotId]
      return { suggestions: next }
    }),
}))
