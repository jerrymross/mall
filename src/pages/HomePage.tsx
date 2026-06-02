import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BUILT_IN_TEMPLATES } from '../config/templates'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useEditorStore } from '../store/useEditorStore'
import { Settings, FileText, Sparkles } from 'lucide-react'

const categoryLabel: Record<string, string> = {
  course: 'Kurs',
  product: 'Produkt',
  event: 'Event',
}

const categoryBadge: Record<string, 'blue' | 'green' | 'yellow'> = {
  course: 'blue',
  product: 'green',
  event: 'yellow',
}

export function HomePage() {
  const navigate = useNavigate()
  const { setTemplateId, setDocumentId, setAIContext, reset } = useEditorStore()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [productName, setProductName] = useState('')
  const [language, setLanguage] = useState<'sv' | 'en'>('sv')

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
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            <Settings size={14} />
            Admin
          </Button>
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

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUILT_IN_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all group"
            >
              {/* Thumbnail */}
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
                <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors" />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-slate-800">{tmpl.name}</h3>
                  <Badge variant={categoryBadge[tmpl.category] ?? 'slate'}>
                    {categoryLabel[tmpl.category] ?? tmpl.category}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mb-4">{tmpl.description}</p>
                <Button className="w-full" onClick={() => openCreateModal(tmpl.id)}>
                  Skapa dokument
                </Button>
              </div>
            </div>
          ))}
        </div>
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
          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={!docTitle.trim()}
          >
            Öppna i editor
          </Button>
        </div>
      </Modal>
    </div>
  )
}
