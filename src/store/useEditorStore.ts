import { create } from 'zustand'
import type { ContentMap, SlotContent } from '../types/content.types'
import type { AIContext } from '../types/document.types'

const MAX_UNDO = 50

interface EditorStore {
  documentId: string | null
  templateId: string | null
  contentMap: ContentMap
  aiContext: AIContext
  selectedSlotId: string | null
  isDirty: boolean
  undoStack: ContentMap[]
  redoStack: ContentMap[]

  setDocumentId: (id: string) => void
  setTemplateId: (id: string) => void
  setContentMap: (map: ContentMap) => void
  setSlotContent: (slotId: string, content: SlotContent) => void
  setSelectedSlot: (slotId: string | null) => void
  setAIContext: (ctx: Partial<AIContext>) => void
  setDirty: (dirty: boolean) => void
  undo: () => void
  redo: () => void
  reset: () => void
}

const defaultAIContext: AIContext = {
  productName: '',
  language: 'sv',
  tone: 'formal',
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  documentId: null,
  templateId: null,
  contentMap: {},
  aiContext: defaultAIContext,
  selectedSlotId: null,
  isDirty: false,
  undoStack: [],
  redoStack: [],

  setDocumentId: (id) => set({ documentId: id }),
  setTemplateId: (id) => set({ templateId: id }),

  setContentMap: (map) => set({ contentMap: map, isDirty: false }),

  setSlotContent: (slotId, content) => {
    const { contentMap, undoStack } = get()
    const newUndo = [...undoStack, contentMap].slice(-MAX_UNDO)
    set({
      contentMap: { ...contentMap, [slotId]: content },
      undoStack: newUndo,
      redoStack: [],
      isDirty: true,
    })
  },

  setSelectedSlot: (slotId) => set({ selectedSlotId: slotId }),

  setAIContext: (ctx) =>
    set((state) => ({ aiContext: { ...state.aiContext, ...ctx } })),

  setDirty: (dirty) => set({ isDirty: dirty }),

  undo: () => {
    const { undoStack, contentMap, redoStack } = get()
    if (!undoStack.length) return
    const prev = undoStack[undoStack.length - 1]
    set({
      contentMap: prev,
      undoStack: undoStack.slice(0, -1),
      redoStack: [contentMap, ...redoStack].slice(0, MAX_UNDO),
      isDirty: true,
    })
  },

  redo: () => {
    const { redoStack, contentMap, undoStack } = get()
    if (!redoStack.length) return
    const next = redoStack[0]
    set({
      contentMap: next,
      redoStack: redoStack.slice(1),
      undoStack: [...undoStack, contentMap].slice(-MAX_UNDO),
      isDirty: true,
    })
  },

  reset: () =>
    set({
      documentId: null,
      templateId: null,
      contentMap: {},
      aiContext: defaultAIContext,
      selectedSlotId: null,
      isDirty: false,
      undoStack: [],
      redoStack: [],
    }),
}))

if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__editorStore = useEditorStore
}
