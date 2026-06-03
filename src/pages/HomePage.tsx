import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BUILT_IN_TEMPLATES } from '../config/templates'
import { fetchCustomTemplates, deleteTemplate } from '../lib/templateService'
import type { TemplateDefinition } from '../types/template.types'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useEditorStore } from '../store/useEditorStore'
import { Settings, FileText, Sparkles, Trash2, PenTool, Pencil } from 'lucide-react'

const categoryLabel: Record<string, string> = {
  course: 'Kurs',
  product: 'Produkt',
  event: 'Event',
  komvux: 'KOMVUX',
  custom: 'Egen',
}

const categoryBadge: Record<string, 'blue' | 'green' | 'yellow' | 'slate'> = {
  course: 'blue',
  product: 'green',
  event: 'yellow',
  komvux: 'blue',
  custom: 'slate',
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Marknadsföringsverktyg</h1>
              <p className="text-xs text-slate-500">Professionella produktblad på 2 minuter</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/template-builder')}>
              <PenTool size={14} />
              Ny mall
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              <Settings size={14} />
              Admin
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <Sparkles size={12} />
            AI-drivet innehåll
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Välj en mall</h2>
          <p className="text-slate-600">Välj en mall för att skapa ditt marknadsföringsmaterial. Allt designat enligt vår grafiska profil.</p>
        </div>

        {/* Inbyggda mallar */}
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Inbyggda mallar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {BUILT_IN_TEMPLATES.map((tmpl) => (
            <TemplateCard key={tmpl.id} template={tmpl} onSelect={openCreateModal} onEdit={(id) => navigate(`/admin/template-builder/${id}`)} />
          ))}
        </div>

        {/* Egna mallar */}
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Egna mallar
          {loadingCustom && <span className="ml-2 text-slate-400 font-normal normal-case">Laddar…</span>}
        </h3>
        {!loadingCustom && customTemplates.length === 0 ? (
          <div className="text-sm text-slate-400 mb-6">
            Inga egna mallar ännu.{' '}
            <button onClick={() => navigate('/admin/template-builder')} className="text-blue-600 hover:underline">
              Skapa din första mall
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {customTemplates.map((tmpl) => (
              <TemplateCard key={tmpl.id} template={tmpl} onSelect={openCreateModal} onDelete={handleDelete} onEdit={(id) => navigate(`/admin/template-builder/${id}`)} />
            ))}
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
          <Button className="w-full" onClick={handleCreate} disabled={!docTitle.trim()}>
            Öppna i editor
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function TemplateCard({
  template,
  onSelect,
  onDelete,
  onEdit,
}: {
  template: TemplateDefinition
  onSelect: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all group">
      <div className="aspect-[3/4] bg-gradient-to-br from-blue-700 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
          <div className="w-16 h-4 bg-white/20 rounded mb-4" />
          <div className="w-full h-3 bg-white/60 rounded mb-2" />
          <div className="w-3/4 h-3 bg-white/40 rounded mb-6" />
          <div className="w-full h-20 bg-white/10 rounded mb-4" />
          <div className="w-full h-2 bg-white/30 rounded mb-1" />
          <div className="w-full h-2 bg-white/30 rounded mb-1" />
          <div className="w-4/5 h-2 bg-white/30 rounded" />
        </div>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(template.id) }}
              className="p-1.5 bg-white text-slate-700 rounded-lg shadow"
              title="Redigera mall"
            >
              <Pencil size={12} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(template.id) }}
              className="p-1.5 bg-red-500 text-white rounded-lg"
              title="Ta bort mall"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-slate-800">{template.name}</h3>
          <Badge variant={categoryBadge[template.category] ?? 'slate'}>
            {categoryLabel[template.category] ?? template.category}
          </Badge>
        </div>
        <p className="text-sm text-slate-500 mb-4">{template.description}</p>
        <Button className="w-full" onClick={() => onSelect(template.id)}>
          Skapa dokument
        </Button>
      </div>
    </div>
  )
}
