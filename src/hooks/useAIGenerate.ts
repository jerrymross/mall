import { useCallback } from 'react'
import { generateSlotContent } from '../lib/aiClient'
import { useEditorStore } from '../store/useEditorStore'
import { useAIStore } from '../store/useAIStore'
import type { TemplateSlot } from '../types/template.types'

export function useAIGenerate() {
  const { aiContext, setSlotContent } = useEditorStore()
  const { setGenerating, setSuggestion, clearSuggestion, suggestions, generatingSlotIds } =
    useAIStore()

  const generate = useCallback(
    async (slot: TemplateSlot) => {
      if (generatingSlotIds.has(slot.id)) return
      setGenerating(slot.id, true)
      try {
        const response = await generateSlotContent({
          slotId: slot.id,
          slotType: slot.type,
          promptHint: slot.aiPromptHint,
          aiContext,
        })
        setSuggestion(slot.id, response.content)
      } catch (err) {
        console.error('AI generation failed:', err)
      } finally {
        setGenerating(slot.id, false)
      }
    },
    [aiContext, generatingSlotIds, setGenerating, setSuggestion],
  )

  const accept = useCallback(
    (slotId: string) => {
      const suggestion = suggestions[slotId]
      if (suggestion) {
        setSlotContent(slotId, suggestion)
        clearSuggestion(slotId)
      }
    },
    [suggestions, setSlotContent, clearSuggestion],
  )

  const reject = useCallback(
    (slotId: string) => clearSuggestion(slotId),
    [clearSuggestion],
  )

  return { generate, accept, reject, suggestions, generatingSlotIds }
}
