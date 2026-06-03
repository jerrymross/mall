import { useState } from 'react'
import type { TemplateDefinition } from '../../types/template.types'
import type { DesignSystem } from '../../types/designSystem.types'
import type { GradientDefinition } from '../../types/gradient.types'
import { useEditorStore } from '../../store/useEditorStore'
import { Canvas } from './Canvas'
import { ContentPanel } from './panels/ContentPanel'
import { InspectorPanel } from './panels/InspectorPanel'
import { AIContextForm } from '../ai/AIContextForm'
import { usePDFExport } from '../../hooks/usePDFExport'
import { Undo2, Redo2, Download, Sparkles, ChevronLeft, MousePointer2 } from 'lucide-react'
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fafafa', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Toolbar */}
      <header style={{
        height: 52, display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 16px', flexShrink: 0,
        background: 'rgba(250,250,250,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb', zIndex: 20,
      }}>
        <button onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, fontWeight: 500, padding: '4px 8px', borderRadius: 6, flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
        >
          <ChevronLeft size={15} /> Tillbaka
        </button>

        <span style={{ width: 1, height: 16, background: '#e5e7eb', flexShrink: 0 }} />

        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>
          {title}
        </span>

        {/* Undo/redo */}
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <ToolBtn onClick={undo} disabled={!undoStack.length} title="Ångra (Ctrl+Z)"><Undo2 size={14} /></ToolBtn>
          <ToolBtn onClick={redo} disabled={!redoStack.length} title="Gör om (Ctrl+Y)"><Redo2 size={14} /></ToolBtn>
        </div>

        <span style={{ width: 1, height: 16, background: '#e5e7eb', flexShrink: 0 }} />

        <button
          onClick={() => setShowAIContext(!showAIContext)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
            borderRadius: 7, border: '1px solid #e5e7eb',
            background: showAIContext ? '#eff6ff' : '#f8fafc',
            color: showAIContext ? '#2563eb' : '#374151',
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
          }}>
          <Sparkles size={13} /> AI-inställningar
        </button>

        <button
          onClick={handleExport}
          disabled={isExporting}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 7, border: 'none',
            background: isExporting ? '#e5e7eb' : '#111827',
            color: isExporting ? '#9ca3af' : '#fff',
            fontSize: 12.5, fontWeight: 600, cursor: isExporting ? 'not-allowed' : 'pointer', flexShrink: 0,
          }}>
          {isExporting
            ? <span style={{ width: 12, height: 12, border: '2px solid #9ca3af', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
            : <Download size={13} />}
          Exportera PDF
        </button>
      </header>

      {/* AI drawer */}
      {showAIContext && (
        <div style={{
          position: 'absolute', top: 60, right: 12, zIndex: 30,
          width: 300, background: '#fff',
          border: '1px solid #e5e7eb', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: 16,
        }}>
          <AIContextForm />
        </div>
      )}

      {/* 3-panel layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left — slot list */}
        <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          {page && (
            <ContentPanel
              slots={page.slots}
              contentMap={contentMap}
              selectedSlotId={selectedSlotId}
              onSelectSlot={setSelectedSlot}
            />
          )}
        </aside>

        {/* Center — canvas */}
        <main
          style={{ flex: 1, overflow: 'auto', padding: 32, display: 'flex', justifyContent: 'center', background: '#f1f5f9' }}
        >
          <div style={{ width: '100%', maxWidth: 680 }}>
            <Canvas
              template={template}
              contentMap={contentMap}
              designSystem={designSystem}
              gradients={gradients}
              selectedSlotId={selectedSlotId}
              onSelectSlot={(id) => setSelectedSlot(id || null)}
              onUpdateContent={handleInlineUpdate}
            />
          </div>
        </main>

        {/* Right — inspector */}
        <aside style={{ width: 272, background: '#fff', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          {selectedSlot ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              <InspectorPanel slot={selectedSlot} designSystem={designSystem} gradients={gradients} />
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <MousePointer2 size={18} color="#94a3b8" />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Välj ett element</p>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>Klicka på ett element i dokumentet för att redigera</p>
            </div>
          )}
        </aside>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function ToolBtn({ children, onClick, disabled, title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      style={{
        width: 30, height: 30, borderRadius: 6, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: disabled ? '#d1d5db' : '#6b7280', transition: 'all 0.1s',
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}
