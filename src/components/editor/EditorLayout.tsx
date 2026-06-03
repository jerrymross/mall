import { useState } from 'react'
import type { TemplateDefinition } from '../../types/template.types'
import type { DesignSystem } from '../../types/designSystem.types'
import type { GradientDefinition } from '../../types/gradient.types'
import { useEditorStore } from '../../store/useEditorStore'
import { Canvas } from './Canvas'
import { ContentPanel } from './panels/ContentPanel'
import { InspectorPanel } from './panels/InspectorPanel'
import { AIContextForm } from '../ai/AIContextForm'
import { Button } from '../ui/Button'
import { usePDFExport } from '../../hooks/usePDFExport'
import { Undo2, Redo2, Download, Sparkles, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  template: TemplateDefinition
  designSystem: DesignSystem
  gradients: GradientDefinition[]
  title: string
}

export function EditorLayout({ template, designSystem, gradients, title }: Props) {
  const navigate = useNavigate()
  const { contentMap, selectedSlotId, setSelectedSlot, setSlotContent, undo, redo, undoStack, redoStack } = useEditorStore()
  const { exportDoc, isExporting } = usePDFExport()
  const [showAIContext, setShowAIContext] = useState(false)

  const page = template.pages[0]
  const selectedSlot = page?.slots.find((s) => s.id === selectedSlotId) ?? null

  function handleInlineUpdate(slotId: string, text: string) {
    const slot = page?.slots.find((s) => s.id === slotId)
    if (!slot) return
    const existing = contentMap[slotId]
    if (slot.type === 'heading' || slot.type === 'subheading') {
      setSlotContent(slotId, { ...(existing ?? {}), type: slot.type, text })
    } else if (slot.type === 'body-text') {
      setSlotContent(slotId, { ...(existing ?? {}), type: 'body-text', text })
    }
  }

  async function handleExport() {
    await exportDoc(template, contentMap, designSystem, gradients, title)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Toolbar */}
      <header className="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-200 shadow-sm z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm transition-colors"
        >
          <ChevronLeft size={16} />
          Tillbaka
        </button>
        <div className="w-px h-5 bg-slate-200" />
        <h1 className="font-semibold text-slate-800 text-sm flex-1 truncate">{title}</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!undoStack.length}
            className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Ångra (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={!redoStack.length}
            className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Gör om (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAIContext(!showAIContext)}
        >
          <Sparkles size={14} />
          AI-inställningar
        </Button>
        <Button
          size="sm"
          onClick={handleExport}
          loading={isExporting}
        >
          <Download size={14} />
          Exportera PDF
        </Button>
      </header>

      {/* AI Context Drawer */}
      {showAIContext && (
        <div className="absolute top-[53px] right-4 z-20 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-4">
          <AIContextForm />
        </div>
      )}

      {/* Main 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel – content nav */}
        <aside className="w-60 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {page && (
            <ContentPanel
              slots={page.slots}
              contentMap={contentMap}
              selectedSlotId={selectedSlotId}
              onSelectSlot={setSelectedSlot}
            />
          )}
        </aside>

        {/* Center – canvas */}
        <main
          className="flex-1 overflow-auto p-8 flex justify-center"
          onClick={() => setSelectedSlot(null)}
        >
          <div className="w-full max-w-2xl">
            <Canvas
              template={template}
              contentMap={contentMap}
              designSystem={designSystem}
              gradients={gradients}
              selectedSlotId={selectedSlotId}
              onSelectSlot={setSelectedSlot}
              onUpdateContent={handleInlineUpdate}
            />
          </div>
        </main>

        {/* Right panel – inspector */}
        <aside className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
          {selectedSlot ? (
            <div className="flex-1 overflow-y-auto p-4">
              <InspectorPanel
                slot={selectedSlot}
                designSystem={designSystem}
                gradients={gradients}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <span className="text-2xl">👆</span>
              </div>
              <p className="text-sm font-medium text-slate-600">Välj ett element</p>
              <p className="text-xs mt-1">Klicka på ett element i dokumentet för att redigera det</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
