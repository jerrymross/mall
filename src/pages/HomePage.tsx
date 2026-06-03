import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BUILT_IN_TEMPLATES } from '../config/templates'
import { fetchCustomTemplates, deleteTemplate } from '../lib/templateService'
import type { TemplateDefinition } from '../types/template.types'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useEditorStore } from '../store/useEditorStore'
import { Settings, FileText, Sparkles, Trash2, PenTool, Pencil, ArrowRight, Zap } from 'lucide-react'

const categoryLabel: Record<string, string> = {
  course: 'Kurs',
  product: 'Produkt',
  event: 'Event',
  komvux: 'KOMVUX',
  custom: 'Egen',
}

const gradientFrom: Record<string, string> = {
  course:  'linear-gradient(160deg,#1e40af,#3730a3)',
  product: 'linear-gradient(160deg,#065f46,#0f766e)',
  event:   'linear-gradient(160deg,#92400e,#b45309)',
  komvux:  'linear-gradient(160deg,#4c1d95,#6d28d9)',
  custom:  'linear-gradient(160deg,#27272a,#3f3f46)',
}

const accentColor: Record<string, string> = {
  course:  '#60a5fa',
  product: '#34d399',
  event:   '#fbbf24',
  komvux:  '#a78bfa',
  custom:  '#a1a1aa',
}

export function HomePage() {
  const navigate = useNavigate()
  const { setTemplateId, setDocumentId, setAIContext, reset } = useEditorStore()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [productName, setProductName] = useState('')
  const [language, setLanguage] = useState<'sv' | 'en'>('sv')
  const [customTemplates, setCustomTemplates] = useState<TemplateDefinition[]>([])
  const [loadingCustom, setLoadingCustom] = useState(true)

  useEffect(() => {
    fetchCustomTemplates()
      .then(setCustomTemplates)
      .finally(() => setLoadingCustom(false))
  }, [])

  function openCreateModal(templateId: string) {
    setSelectedTemplateId(templateId)
    setShowModal(true)
    setDocTitle('')
    setProductName('')
  }

  function handleCreate() {
    if (!selectedTemplateId) return
    reset()
    setTemplateId(selectedTemplateId)
    setDocumentId(crypto.randomUUID())
    setAIContext({ productName, language })
    navigate(`/editor/${selectedTemplateId}`)
    setShowModal(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Ta bort mallen?')) return
    await deleteTemplate(id)
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const customIds = new Set(customTemplates.map((c) => c.id))

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: 'white' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        background: 'rgba(9,9,11,0.75)',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(139,92,246,0.5)',
            }}>
              <FileText size={14} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.3px', color: 'white' }}>
              Marknadsföringsverktyg
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <GhostBtn onClick={() => navigate('/admin/template-builder')}><PenTool size={13} /> Ny mall</GhostBtn>
            <GhostBtn onClick={() => navigate('/admin')}><Settings size={13} /> Admin</GhostBtn>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px 96px' }}>

        {/* Hero */}
        <div style={{ padding: '88px 0 72px', textAlign: 'center', position: 'relative' }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 300, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 100, padding: '5px 14px', marginBottom: 32,
          }}>
            <Zap size={11} color="#a78bfa" fill="#a78bfa" />
            <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 500, letterSpacing: 0.4 }}>AI-drivet innehåll</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5.5vw, 68px)',
            fontWeight: 800,
            letterSpacing: '-2.5px',
            lineHeight: 1.05,
            marginBottom: 22,
            color: 'white',
          }}>
            Professionellt material<br />
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>på 2 minuter</span>
          </h1>
          <p style={{ color: '#71717a', fontSize: 17, maxWidth: 460, margin: '0 auto', lineHeight: 1.65 }}>
            Välj mall, fyll i innehåll med AI-hjälp och exportera ett PDF enligt grafisk profil.
          </p>
        </div>

        {/* Built-in templates */}
        <SectionLabel>Inbyggda mallar</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))', gap: 14, marginBottom: 48 }}>
          {BUILT_IN_TEMPLATES.map((tmpl) => (
            <TemplateCard
              key={tmpl.id}
              template={tmpl}
              onSelect={openCreateModal}
              onEdit={(id) => navigate(`/admin/template-builder/${id}`)}
            />
          ))}
        </div>

        {/* Custom templates */}
        <SectionLabel>
          Egna mallar
          {loadingCustom && <span style={{ color: '#52525b', fontWeight: 400, marginLeft: 8 }}>Laddar…</span>}
        </SectionLabel>
        {!loadingCustom && customTemplates.length === 0 ? (
          <NewTemplateCard onClick={() => navigate('/admin/template-builder')} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))', gap: 14 }}>
            {customTemplates.map((tmpl) => (
              <TemplateCard
                key={tmpl.id}
                template={tmpl}
                onSelect={openCreateModal}
                onDelete={customIds.has(tmpl.id) ? handleDelete : undefined}
                onEdit={(id) => navigate(`/admin/template-builder/${id}`)}
              />
            ))}
            <NewTemplateCard onClick={() => navigate('/admin/template-builder')} />
          </div>
        )}
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nytt dokument" size="sm">
        <div className="flex flex-col gap-4">
          <Input
            label="Dokumenttitel"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            placeholder="t.ex. Kursblad Ledarskap Q3"
            autoFocus
          />
          <Input
            label="Produkt- / kursnamn"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Används av AI för textgenerering"
          />
          <Select
            label="Språk för AI"
            value={language}
            options={[
              { value: 'sv', label: 'Svenska' },
              { value: 'en', label: 'Engelska' },
            ]}
            onChange={(e) => setLanguage(e.target.value as 'sv' | 'en')}
          />
          <button
            onClick={handleCreate}
            disabled={!docTitle.trim()}
            style={{
              width: '100%', padding: '11px 20px',
              background: docTitle.trim() ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#27272a',
              color: docTitle.trim() ? 'white' : '#52525b',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: docTitle.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 0.15s',
            }}
          >
            Öppna i editor <ArrowRight size={14} />
          </button>
        </div>
      </Modal>
    </div>
  )
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [h, setH] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 13px', borderRadius: 8,
        background: h ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: h ? '#e4e4e7' : '#a1a1aa',
        fontSize: 13, fontWeight: 500, cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
      <span style={{ color: '#52525b', fontSize: 10.5, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
    </div>
  )
}

function TemplateCard({
  template, onSelect, onDelete, onEdit,
}: {
  template: TemplateDefinition
  onSelect: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const grad = gradientFrom[template.category] ?? gradientFrom.custom
  const accent = accentColor[template.category] ?? accentColor.custom

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#18181b',
        border: hovered ? `1px solid ${accent}40` : '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? `0 0 32px ${accent}18` : 'none',
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}
    >
      {/* Preview */}
      <div style={{ height: 168, background: grad, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
        {/* Paper mockup */}
        <div style={{
          position: 'absolute', bottom: 12, left: 14, right: 14,
          background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: 10,
        }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.6)', borderRadius: 3, marginBottom: 5, width: '65%' }} />
          <div style={{ height: 3.5, background: 'rgba(255,255,255,0.25)', borderRadius: 2, marginBottom: 3 }} />
          <div style={{ height: 3.5, background: 'rgba(255,255,255,0.25)', borderRadius: 2, marginBottom: 3, width: '80%' }} />
          <div style={{ height: 3.5, background: 'rgba(255,255,255,0.25)', borderRadius: 2, width: '50%' }} />
        </div>
        <div style={{ position: 'absolute', top: 12, left: 14, height: 6, width: 40, background: 'rgba(255,255,255,0.3)', borderRadius: 3 }} />

        {/* Hover actions */}
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(template.id) }}
              title="Redigera mall"
              style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pencil size={11} />
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(template.id) }}
              title="Ta bort"
              style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(220,38,38,0.8)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ color: '#f4f4f5', fontWeight: 600, fontSize: 13.5, letterSpacing: '-0.2px' }}>{template.name}</span>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 100,
            background: `${accent}18`, color: accent,
            border: `1px solid ${accent}30`,
          }}>
            {categoryLabel[template.category] ?? template.category}
          </span>
        </div>
        <p style={{ color: '#71717a', fontSize: 12, lineHeight: 1.55, marginBottom: 14 }}>{template.description}</p>
        <button
          onClick={() => onSelect(template.id)}
          style={{
            width: '100%', padding: '8px 14px',
            background: hovered ? `linear-gradient(135deg, ${accent}22, ${accent}11)` : 'rgba(255,255,255,0.04)',
            color: hovered ? accent : '#71717a',
            border: hovered ? `1px solid ${accent}40` : '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.2s',
          }}
        >
          <Sparkles size={12} />
          Skapa dokument
        </button>
      </div>
    </div>
  )
}

function NewTemplateCard({ onClick }: { onClick: () => void }) {
  const [h, setH] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: h ? 'rgba(139,92,246,0.04)' : 'transparent',
        border: `1px dashed ${h ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16, cursor: 'pointer', minHeight: 280,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: h ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}>
        <PenTool size={18} color={h ? '#a78bfa' : '#52525b'} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: h ? '#a78bfa' : '#71717a', fontWeight: 600, fontSize: 13.5, marginBottom: 4, transition: 'color 0.2s' }}>Ny mall</div>
        <div style={{ color: '#3f3f46', fontSize: 12 }}>Bygg från grunden</div>
      </div>
    </div>
  )
}
