import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDesignSystemStore } from '../../store/useDesignSystemStore'
import { saveTemplate, updateTemplate, fetchTemplateById } from '../../lib/templateService'
import { BUILT_IN_TEMPLATES } from '../../config/templates'
import { GRADIENT_PRESETS } from '../../config/gradientPresets'
import { BuilderCanvas } from '../../components/builder/BuilderCanvas'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import type { TemplateSlot, SlotType, TemplateDefinition } from '../../types/template.types'
import type { SlotContent } from '../../types/content.types'
import type { ColorTokenKey } from '../../types/designSystem.types'
import {
  ChevronLeft, Plus, Trash2, Copy, ChevronUp, ChevronDown, Save
} from 'lucide-react'

const SLOT_TYPES: { type: SlotType; label: string; emoji: string }[] = [
  { type: 'heading', label: 'Rubrik', emoji: 'H' },
  { type: 'subheading', label: 'Underrubrik', emoji: 'h' },
  { type: 'body-text', label: 'Brödtext', emoji: '¶' },
  { type: 'bullet-list', label: 'Punktlista', emoji: '•' },
  { type: 'cta', label: 'CTA-knapp', emoji: '▶' },
  { type: 'contact', label: 'Kontakt', emoji: '@' },
  { type: 'image', label: 'Bild', emoji: '🖼' },
  { type: 'logo', label: 'Logotyp', emoji: 'L' },
  { type: 'gradient-background', label: 'Bakgrund', emoji: '▓' },
  { type: 'table', label: 'Tabell', emoji: '⊞' },
  { type: 'divider', label: 'Avdelare', emoji: '─' },
]

function makeSlot(type: SlotType, index: number): TemplateSlot {
  const defaults: Record<SlotType, Partial<TemplateSlot['position']>> = {
    'heading': { x: 10, y: 10 + index * 25, width: 190, height: 20 },
    'subheading': { x: 10, y: 10 + index * 25, width: 190, height: 15 },
    'body-text': { x: 10, y: 10 + index * 25, width: 90, height: 40 },
    'bullet-list': { x: 10, y: 10 + index * 25, width: 90, height: 40 },
    'cta': { x: 10, y: 10 + index * 25, width: 60, height: 12 },
    'contact': { x: 10, y: 10 + index * 25, width: 90, height: 25 },
    'image': { x: 10, y: 10 + index * 25, width: 90, height: 60 },
    'logo': { x: 10, y: 10, width: 45, height: 15 },
    'gradient-background': { x: 0, y: 0, width: 210, height: 50 },
    'table':   { x: 10, y: 10 + index * 25, width: 190, height: 60 },
    'divider': { x: 10, y: 10 + index * 25, width: 190, height: 5 },
  }
  return {
    id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    label: SLOT_TYPES.find((s) => s.type === type)?.label ?? type,
    position: { x: 10, y: 10, width: 90, height: 30, ...defaults[type] } as TemplateSlot['position'],
    constraints: {},
    zIndex: type === 'gradient-background' ? 1 : 5,
    visible: true,
  }
}

export function TemplateBuilderPage() {
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId?: string }>()
  const { activeDesignSystem } = useDesignSystemStore()
  const [slots, setSlots] = useState<TemplateSlot[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName] = useState('Min mall')
  const [category, setCategory] = useState('custom')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!templateId)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!templateId) return
    const builtin = BUILT_IN_TEMPLATES.find((t) => t.id === templateId)
    if (builtin) {
      setName(builtin.name)
      setCategory(builtin.category)
      setSlots(builtin.pages[0]?.slots ?? [])
      setEditingId(null) // built-ins save as new copy
      setLoading(false)
      return
    }
    fetchTemplateById(templateId).then((tmpl) => {
      if (tmpl) {
        setName(tmpl.name)
        setCategory(tmpl.category)
        setSlots(tmpl.pages[0]?.slots ?? [])
        setEditingId(tmpl.id)
      }
      setLoading(false)
    })
  }, [templateId])

  const selected = slots.find((s) => s.id === selectedId) ?? null

  function addSlot(type: SlotType) {
    const slot = makeSlot(type, slots.length)
    setSlots((prev) => [...prev, slot])
    setSelectedId(slot.id)
  }

  function updateSlot(id: string, pos: Partial<TemplateSlot['position']>) {
    setSlots((prev) =>
      prev.map((s) => s.id === id ? { ...s, position: { ...s.position, ...pos } } : s)
    )
  }

  function updateSelected(patch: Partial<TemplateSlot>) {
    setSlots((prev) => prev.map((s) => s.id === selectedId ? { ...s, ...patch } : s))
  }

  function updateConstraint(patch: Partial<TemplateSlot['constraints']>) {
    if (!selected) return
    setSlots((prev) =>
      prev.map((s) => s.id === selectedId ? { ...s, constraints: { ...s.constraints, ...patch } } : s)
    )
  }

  function updateDefaultContent(patch: Partial<SlotContent>) {
    if (!selected) return
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== selectedId) return s
        const existing = s.defaultContent ?? ({ type: s.type } as SlotContent)
        return { ...s, defaultContent: { ...existing, ...patch } as SlotContent }
      })
    )
  }

  function deleteSelected() {
    setSlots((prev) => prev.filter((s) => s.id !== selectedId))
    setSelectedId(null)
  }

  function duplicateSelected() {
    if (!selected) return
    const copy = { ...selected, id: `slot-${Date.now()}`, position: { ...selected.position, x: selected.position.x + 5, y: selected.position.y + 5 } }
    setSlots((prev) => [...prev, copy])
    setSelectedId(copy.id)
  }

  function moveZ(dir: 1 | -1) {
    if (!selected) return
    setSlots((prev) =>
      prev.map((s) => s.id === selectedId ? { ...s, zIndex: Math.max(1, s.zIndex + dir) } : s)
    )
  }

  async function handleSave() {
    if (slots.length === 0) { setSaveError('Lägg till minst ett element innan du sparar.'); return }
    setSaving(true)
    setSaveError(null)
    const pages: TemplateDefinition['pages'] = [{ pageNumber: 1, orientation: 'portrait', slots }]
    try {
      if (editingId) {
        await updateTemplate({
          id: editingId, name, description: '', thumbnailUrl: '', category,
          designSystemId: activeDesignSystem.id, isPublished: true,
          createdBy: 'user', createdAt: '', updatedAt: '', pages,
        })
      } else {
        await saveTemplate({
          id: `tmpl-custom-${Date.now()}`, name, description: '', thumbnailUrl: '', category,
          designSystemId: activeDesignSystem.id, isPublished: true,
          createdBy: 'user', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), pages,
        })
      }
      setSaved(true)
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Kunde inte spara')
    } finally {
      setSaving(false)
    }
  }

  const typographyOptions = [
    { value: '', label: '— välj typsnitt —' },
    ...activeDesignSystem.typography.map((t) => ({ value: t.key, label: `${t.key} (${t.fontFamily} ${t.sizeRem}rem)` })),
  ]

  const colorOptions = [
    { value: '', label: '— välj färg —' },
    ...activeDesignSystem.colors.map((c) => ({ value: c.key, label: `${c.label} (${c.hex})` })),
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-200 shadow-sm z-10">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm"
        >
          <ChevronLeft size={16} />
          Admin
        </button>
        <div className="w-px h-5 bg-slate-200" />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mallnamn"
          className="!py-1 text-sm font-semibold w-48"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-2 py-1 text-slate-700"
        >
          <option value="custom">Egna mallar</option>
          <option value="course">Kurs</option>
          <option value="komvux">KOMVUX</option>
          <option value="event">Event</option>
          <option value="product">Produkt</option>
        </select>
        <div className="flex-1" />
        <span className="text-xs text-slate-400">{slots.length} element</span>
        <Button onClick={handleSave} variant={saved ? 'secondary' : 'primary'} size="sm" loading={saving}>
          <Save size={14} />
          {saved ? '✓ Sparad!' : editingId ? 'Spara ändringar' : 'Spara mall'}
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left – slot types */}
        <aside className="w-48 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="px-3 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lägg till</p>
          </div>
          <div className="flex flex-col gap-1 p-2">
            {SLOT_TYPES.map(({ type, label, emoji }) => (
              <button
                key={type}
                onClick={() => addSlot(type)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
              >
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-bold flex-shrink-0">{emoji}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Slot list */}
          {slots.length > 0 && (
            <>
              <div className="px-3 py-2 border-t border-slate-100 mt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Element</p>
              </div>
              <div className="flex flex-col gap-0.5 px-2 pb-2">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedId(slot.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-colors truncate
                      ${selectedId === slot.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span className="shrink-0 opacity-50">{SLOT_TYPES.find(s => s.type === slot.type)?.emoji}</span>
                    {slot.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* Center – canvas */}
        <main className="flex-1 overflow-auto p-8 flex justify-center">
          <div className="w-full max-w-xl">
            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{saveError}</div>
            )}
            {slots.length === 0 && (
              <div className="text-center text-slate-400 text-sm mb-6">
                <Plus size={32} className="mx-auto mb-2 opacity-30" />
                Klicka på en elementtyp till vänster för att börja bygga din mall
              </div>
            )}
            <BuilderCanvas
              slots={slots}
              selectedSlotId={selectedId}
              designSystem={activeDesignSystem}
              gradients={GRADIENT_PRESETS}
              onSelectSlot={(id) => setSelectedId(id || null)}
              onUpdateSlot={updateSlot}
            />
          </div>
        </main>

        {/* Right – config panel */}
        <aside className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
          {selected ? (
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-sm">{selected.label}</h3>
                <div className="flex gap-1">
                  <button onClick={() => moveZ(1)} title="Framåt" className="p-1 rounded hover:bg-slate-100 text-slate-500">
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => moveZ(-1)} title="Bakåt" className="p-1 rounded hover:bg-slate-100 text-slate-500">
                    <ChevronDown size={14} />
                  </button>
                  <button onClick={duplicateSelected} title="Duplicera" className="p-1 rounded hover:bg-slate-100 text-slate-500">
                    <Copy size={14} />
                  </button>
                  <button onClick={deleteSelected} title="Ta bort" className="p-1 rounded hover:bg-red-50 text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Label */}
              <Input
                label="Etikettnamn"
                value={selected.label}
                onChange={(e) => updateSelected({ label: e.target.value })}
                placeholder="T.ex. Kursrubrik"
              />

              {/* Position & size */}
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">Position & storlek (mm)</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['x', 'y', 'width', 'height'] as const).map((key) => (
                    <div key={key}>
                      <label className="text-xs text-slate-500 uppercase">{key}</label>
                      <input
                        type="number"
                        step="1"
                        value={Math.round(selected.position[key])}
                        onChange={(e) => updateSlot(selected.id, { [key]: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography */}
              {['heading','subheading','body-text','bullet-list','cta','contact'].includes(selected.type) && (
                <Select
                  label="Typsnitt"
                  value={selected.constraints.typographyTokenKey ?? ''}
                  options={typographyOptions}
                  onChange={(e) => updateConstraint({ typographyTokenKey: e.target.value || undefined })}
                />
              )}

              {/* Color */}
              <Select
                label="Textfärg"
                value={selected.constraints.colorTokenKey ?? ''}
                options={colorOptions}
                onChange={(e) => updateConstraint({ colorTokenKey: (e.target.value as ColorTokenKey) || undefined })}
              />

              {/* Logo variant */}
              {selected.type === 'logo' && (
                <Select
                  label="Logotypvariant"
                  value={selected.constraints.logoVariant ?? 'full-color'}
                  options={[
                    { value: 'full-color', label: 'Färg' },
                    { value: 'white', label: 'Vit' },
                    { value: 'black', label: 'Svart' },
                  ]}
                  onChange={(e) => updateConstraint({ logoVariant: e.target.value as 'full-color' | 'white' | 'black' })}
                />
              )}

              {/* Max chars */}
              {['heading','subheading','body-text','cta'].includes(selected.type) && (
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Max antal tecken</label>
                  <input
                    type="number"
                    value={selected.constraints.maxChars ?? ''}
                    onChange={(e) => updateConstraint({ maxChars: Number(e.target.value) || undefined })}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-sm"
                    placeholder="Obegränsat"
                  />
                </div>
              )}

              {/* Required */}
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.constraints.required ?? false}
                  onChange={(e) => updateConstraint({ required: e.target.checked })}
                  className="rounded"
                />
                Obligatoriskt fält
              </label>

              {/* Static / locked content */}
              {['heading','subheading','body-text','bullet-list','cta','contact','logo'].includes(selected.type) && (
                <div className="border border-blue-100 rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Låst innehåll</p>
                    <label className="flex items-center gap-1.5 text-xs text-blue-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.locked ?? false}
                        onChange={(e) => updateSelected({ locked: e.target.checked })}
                        className="rounded accent-blue-600"
                      />
                      Lås
                    </label>
                  </div>
                  <p className="text-xs text-blue-600 mb-3">
                    {selected.locked
                      ? 'Innehållet nedan visas alltid och kan inte ändras av användaren.'
                      : 'Ange text nedan och kryssa i "Lås" för att låsa innehållet.'}
                  </p>

                  {selected.type === 'logo' && (
                    <p className="text-xs text-blue-700">
                      Logotypen hämtas automatiskt från designsystemet.
                      {selected.locked ? ' Den är nu låst.' : ' Kryssa i "Lås" för att förhindra att den tas bort.'}
                    </p>
                  )}

                  {(selected.type === 'heading' || selected.type === 'subheading' || selected.type === 'body-text' || selected.type === 'cta') && (
                    <div>
                      <label className="text-xs text-blue-700 block mb-1">
                        {selected.type === 'cta' ? 'Knapptext' : 'Text'}
                      </label>
                      <textarea
                        value={(selected.defaultContent as { text?: string; label?: string } | undefined)?.text
                          ?? (selected.defaultContent as { label?: string } | undefined)?.label
                          ?? ''}
                        onChange={(e) => {
                          if (selected.type === 'cta') updateDefaultContent({ type: 'cta', label: e.target.value } as Partial<SlotContent>)
                          else updateDefaultContent({ type: selected.type as 'heading' | 'subheading' | 'body-text', text: e.target.value } as Partial<SlotContent>)
                          if (!selected.locked) updateSelected({ locked: true })
                        }}
                        rows={selected.type === 'body-text' ? 4 : 2}
                        className="w-full border border-blue-200 rounded px-2 py-1 text-sm resize-none bg-white"
                        placeholder="Skriv text som alltid ska visas..."
                      />
                    </div>
                  )}
                  {selected.type === 'bullet-list' && (
                    <div>
                      <label className="text-xs text-blue-700 block mb-1">Punkter (en per rad)</label>
                      <textarea
                        value={((selected.defaultContent as { items?: string[] } | undefined)?.items ?? []).join('\n')}
                        onChange={(e) => {
                          updateDefaultContent({ type: 'bullet-list', items: e.target.value.split('\n') } as Partial<SlotContent>)
                          if (!selected.locked) updateSelected({ locked: true })
                        }}
                        rows={4}
                        className="w-full border border-blue-200 rounded px-2 py-1 text-sm resize-none bg-white"
                        placeholder="Punkt 1&#10;Punkt 2&#10;Punkt 3"
                      />
                    </div>
                  )}
                  {selected.type === 'contact' && (
                    <div className="flex flex-col gap-1.5">
                      {(['name','title','email','phone'] as const).map((field) => (
                        <input
                          key={field}
                          type="text"
                          placeholder={field === 'name' ? 'Namn' : field === 'title' ? 'Titel' : field === 'email' ? 'E-post' : 'Telefon'}
                          value={(selected.defaultContent as Record<string, string> | undefined)?.[field] ?? ''}
                          onChange={(e) => {
                            updateDefaultContent({ type: 'contact', [field]: e.target.value } as Partial<SlotContent>)
                            if (!selected.locked) updateSelected({ locked: true })
                          }}
                          className="w-full border border-blue-200 rounded px-2 py-1 text-sm bg-white"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Locked for other types */}
              {!['heading','subheading','body-text','bullet-list','cta','contact','logo'].includes(selected.type) && (
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.locked ?? false}
                    onChange={(e) => updateSelected({ locked: e.target.checked })}
                    className="rounded"
                  />
                  Låst (ej redigerbart av användare)
                </label>
              )}

              {/* Background color */}
              <Select
                label="Bakgrundsfärg"
                value={selected.constraints.bgColorTokenKey ?? ''}
                options={colorOptions}
                onChange={(e) => updateConstraint({ bgColorTokenKey: (e.target.value as ColorTokenKey) || undefined })}
              />

              {/* Border radius */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Rundade hörn: {selected.constraints.borderRadius ?? 0} mm
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={0.5}
                  value={selected.constraints.borderRadius ?? 0}
                  onChange={(e) => updateConstraint({ borderRadius: Number(e.target.value) || undefined })}
                  className="w-full"
                />
              </div>

              {/* z-index display */}
              <p className="text-xs text-slate-400">Z-lager: {selected.zIndex}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 text-2xl">👆</div>
              <p className="text-sm font-medium text-slate-600">Välj ett element</p>
              <p className="text-xs mt-1">Klicka på ett element i mallen för att konfigurera det</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
