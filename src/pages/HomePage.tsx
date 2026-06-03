import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BUILT_IN_TEMPLATES } from '../config/templates'
import { fetchCustomTemplates, deleteTemplate } from '../lib/templateService'
import type { TemplateDefinition } from '../types/template.types'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useEditorStore } from '../store/useEditorStore'
import { Settings, Sparkles, Trash2, PenTool, Pencil, ArrowUpRight, ChevronRight } from 'lucide-react'

const CATEGORY_LABEL: Record<string, string> = {
  course: 'Kurs', product: 'Produkt', event: 'Event', komvux: 'KOMVUX', custom: 'Egen',
}

// Subtle tinted backgrounds per category
const CARD_BG: Record<string, { bg: string; stripe: string; dot: string }> = {
  course:  { bg: '#eff6ff', stripe: '#bfdbfe', dot: '#2563eb' },
  product: { bg: '#f0fdf4', stripe: '#bbf7d0', dot: '#16a34a' },
  event:   { bg: '#fff7ed', stripe: '#fed7aa', dot: '#ea580c' },
  komvux:  { bg: '#faf5ff', stripe: '#e9d5ff', dot: '#9333ea' },
  custom:  { bg: '#f8fafc', stripe: '#e2e8f0', dot: '#475569' },
}

export function HomePage() {
  const navigate = useNavigate()
  const { setTemplateId, setDocumentId, setAIContext, reset } = useEditorStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [productName, setProductName] = useState('')
  const [language, setLanguage] = useState<'sv' | 'en'>('sv')
  const [custom, setCustom] = useState<TemplateDefinition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomTemplates().then(setCustom).finally(() => setLoading(false))
  }, [])

  function open(id: string) { setSelectedId(id); setShowModal(true); setDocTitle(''); setProductName('') }

  function create() {
    if (!selectedId) return
    reset(); setTemplateId(selectedId); setDocumentId(crypto.randomUUID())
    setAIContext({ productName, language })
    navigate(`/editor/${selectedId}`); setShowModal(false)
  }

  async function remove(id: string) {
    if (!confirm('Ta bort mallen?')) return
    await deleteTemplate(id)
    setCustom((p) => p.filter((t) => t.id !== id))
  }

  const customIds = new Set(custom.map((c) => c.id))

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Top nav — razor thin */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        height: 52, display: 'flex', alignItems: 'center',
        padding: '0 32px', justifyContent: 'space-between',
        background: 'rgba(250,250,250,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {/* Wordmark */}
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: '-0.4px' }}>
            Marknadsföringsverktyg
          </span>
          <span style={{ width: 1, height: 16, background: '#e5e7eb' }} />
          <NavLink onClick={() => navigate('/admin/template-builder')}><PenTool size={12}/> Ny mall</NavLink>
          <NavLink onClick={() => navigate('/admin')}><Settings size={12}/> Admin</NavLink>
        </div>
        <button
          onClick={() => navigate('/admin/template-builder')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8,
            background: '#111827', color: '#fff',
            border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            letterSpacing: '-0.1px',
          }}
        >
          Ny mall <ChevronRight size={13} />
        </button>
      </nav>

      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '0 32px 96px' }}>

        {/* Hero — left-aligned, editorial */}
        <div style={{ padding: '72px 0 56px', maxWidth: 640 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#f0f9ff', border: '1px solid #bae6fd',
            borderRadius: 6, padding: '4px 10px', marginBottom: 24,
          }}>
            <Sparkles size={11} color="#0284c7" />
            <span style={{ color: '#0369a1', fontSize: 11.5, fontWeight: 600, letterSpacing: 0.2 }}>AI-drivet innehåll</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800,
            letterSpacing: '-2px',
            lineHeight: 1.1,
            color: '#0f172a',
            marginBottom: 18,
          }}>
            Professionellt material<br />
            <em style={{ fontStyle: 'normal', color: '#2563eb' }}>på 2 minuter.</em>
          </h1>
          <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.7, maxWidth: 420 }}>
            Välj mall, fyll i innehåll med AI-hjälp och exportera ett PDF enligt grafisk profil.
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: 32 }} />

        {/* Grid header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Inbyggda mallar — {BUILT_IN_TEMPLATES.length} st
          </span>
        </div>

        {/* Built-in template grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 12,
          marginBottom: 48,
        }}>
          {BUILT_IN_TEMPLATES.map((t) => (
            <TemplateCard key={t.id} template={t} onSelect={open} onEdit={(id) => navigate(`/admin/template-builder/${id}`)} />
          ))}
        </div>

        {/* Custom section */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 32, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Egna mallar {loading && '— laddar…'}
            </span>
          </div>
        </div>

        {!loading && custom.length === 0 ? (
          <EmptyCustom onClick={() => navigate('/admin/template-builder')} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {custom.map((t) => (
              <TemplateCard key={t.id} template={t} onSelect={open}
                onDelete={customIds.has(t.id) ? remove : undefined}
                onEdit={(id) => navigate(`/admin/template-builder/${id}`)} />
            ))}
            <AddCard onClick={() => navigate('/admin/template-builder')} />
          </div>
        )}
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nytt dokument" size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Dokumenttitel" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="t.ex. Kursblad Ledarskap Q3" autoFocus />
          <Input label="Produkt- / kursnamn" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Används av AI för textgenerering" />
          <Select label="Språk för AI" value={language}
            options={[{ value: 'sv', label: 'Svenska' }, { value: 'en', label: 'Engelska' }]}
            onChange={(e) => setLanguage(e.target.value as 'sv' | 'en')} />
          <button
            onClick={create} disabled={!docTitle.trim()}
            style={{
              width: '100%', padding: '11px 20px',
              background: docTitle.trim() ? '#111827' : '#f1f5f9', color: docTitle.trim() ? '#fff' : '#94a3b8',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: docTitle.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}
          >
            Öppna i editor <ArrowUpRight size={14} />
          </button>
        </div>
      </Modal>
    </div>
  )
}

function NavLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [h, setH] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 500, color: h ? '#111827' : '#6b7280',
        padding: '4px 0', transition: 'color 0.12s',
      }}>
      {children}
    </button>
  )
}

function TemplateCard({ template, onSelect, onDelete, onEdit }: {
  template: TemplateDefinition
  onSelect: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}) {
  const [h, setH] = useState(false)
  const theme = CARD_BG[template.category] ?? CARD_BG.custom

  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: '#fff', border: h ? '1px solid #93c5fd' : '1px solid #e5e7eb',
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: h ? '0 4px 24px rgba(37,99,235,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}>

      {/* Thumbnail — tinted, striped pattern */}
      <div style={{ height: 140, background: theme.bg, position: 'relative', overflow: 'hidden' }}>
        {/* Stripe pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, ${theme.stripe}55 8px, ${theme.stripe}55 9px)`,
        }} />
        {/* Paper mockup */}
        <div style={{
          position: 'absolute', bottom: 14, left: 14, right: 14,
          background: '#fff', borderRadius: 6,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)', padding: 10,
        }}>
          <div style={{ height: 5, background: theme.dot, borderRadius: 3, width: '55%', marginBottom: 5, opacity: 0.7 }} />
          <div style={{ height: 3, background: '#e2e8f0', borderRadius: 2, marginBottom: 3 }} />
          <div style={{ height: 3, background: '#e2e8f0', borderRadius: 2, marginBottom: 3, width: '80%' }} />
          <div style={{ height: 3, background: '#e2e8f0', borderRadius: 2, width: '65%' }} />
        </div>
        {/* Dot accent top-left */}
        <div style={{ position: 'absolute', top: 12, left: 14, display: 'flex', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.dot }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.stripe }} />
        </div>

        {/* Hover actions */}
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, opacity: h ? 1 : 0, transition: 'opacity 0.15s' }}>
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(template.id) }}
              style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.9)', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
              <Pencil size={11} />
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(template.id) }}
              style={{ width: 26, height: 26, borderRadius: 6, background: '#fee2e2', border: '1px solid #fca5a5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Meta */}
      <div style={{ padding: '12px 14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.2px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {template.name}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
            background: theme.bg, color: theme.dot,
            padding: '2px 7px', borderRadius: 4,
            flexShrink: 0,
          }}>
            {CATEGORY_LABEL[template.category] ?? template.category}
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 11.5, lineHeight: 1.5, marginBottom: 12 }}>{template.description}</p>
        <button onClick={() => onSelect(template.id)}
          style={{
            width: '100%', padding: '8px 12px',
            background: h ? '#0f172a' : '#f8fafc',
            color: h ? '#fff' : '#374151',
            border: '1px solid #e5e7eb', borderRadius: 7,
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'all 0.15s',
          }}>
          Skapa dokument <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  )
}

function EmptyCustom({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ padding: '32px 24px', border: '1px dashed #e2e8f0', borderRadius: 12, textAlign: 'center' }}>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14 }}>Inga egna mallar ännu.</p>
      <button onClick={onClick}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
        <PenTool size={13} /> Skapa din första mall
      </button>
    </div>
  )
}

function AddCard({ onClick }: { onClick: () => void }) {
  const [h, setH] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        border: `1px dashed ${h ? '#93c5fd' : '#e2e8f0'}`,
        borderRadius: 12, cursor: 'pointer', minHeight: 244,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
        background: h ? '#eff6ff' : 'transparent', transition: 'all 0.15s',
      }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: h ? '#dbeafe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
        <PenTool size={16} color={h ? '#2563eb' : '#94a3b8'} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: h ? '#2563eb' : '#94a3b8', transition: 'color 0.15s' }}>Ny mall</span>
    </div>
  )
}
