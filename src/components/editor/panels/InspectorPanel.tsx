import { useEditorStore } from '../../../store/useEditorStore'
import type { TemplateSlot } from '../../../types/template.types'
import type { DesignSystem } from '../../../types/designSystem.types'
import type { GradientDefinition } from '../../../types/gradient.types'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { useAIGenerate } from '../../../hooks/useAIGenerate'
import { Sparkles } from 'lucide-react'
import type { SlotContent } from '../../../types/content.types'

interface Props {
  slot: TemplateSlot
  designSystem: DesignSystem
  gradients: GradientDefinition[]
}

export function InspectorPanel({ slot, gradients }: Props) {
  const { contentMap, setSlotContent } = useEditorStore()
  const { generate, accept, reject, suggestions, generatingSlotIds } = useAIGenerate()
  const content = contentMap[slot.id]
  const suggestion = suggestions[slot.id]
  const isGenerating = generatingSlotIds.has(slot.id)

  const canGenerate = ['heading', 'subheading', 'body-text', 'bullet-list', 'cta'].includes(slot.type)

  function update(partial: Partial<SlotContent>) {
    const base = content ?? { type: slot.type }
    setSlotContent(slot.id, { ...base, ...partial } as SlotContent)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{slot.label}</h3>
        {canGenerate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generate(slot)}
            loading={isGenerating}
            title="Generera med AI"
          >
            <Sparkles size={14} />
            AI
          </Button>
        )}
      </div>

      {suggestion && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-700 mb-2">AI-förslag</p>
          <div className="text-sm text-slate-700 mb-3">
            {suggestion.type === 'bullet-list'
              ? (suggestion.items as string[]).map((item, i) => (
                  <div key={i} className="flex gap-1">
                    <span>•</span>
                    <span>{item}</span>
                  </div>
                ))
              : 'text' in suggestion
                ? (suggestion as { text: string }).text
                : 'label' in suggestion
                  ? (suggestion as { label: string }).label
                  : null}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => accept(slot.id)}>Acceptera</Button>
            <Button size="sm" variant="ghost" onClick={() => reject(slot.id)}>Avvisa</Button>
          </div>
        </div>
      )}

      <SlotForm slot={slot} content={content} gradients={gradients} onUpdate={update} />

      {slot.constraints.maxChars && (
        <p className="text-xs text-slate-400">
          Max {slot.constraints.maxChars} tecken
        </p>
      )}
    </div>
  )
}

function SlotForm({
  slot,
  content,
  gradients,
  onUpdate,
}: {
  slot: TemplateSlot
  content: SlotContent | undefined
  gradients: GradientDefinition[]
  onUpdate: (partial: Partial<SlotContent>) => void
}) {
  const { setSlotContent } = useEditorStore()

  switch (slot.type) {
    case 'heading':
    case 'subheading': {
      const text = (content as { text?: string })?.text ?? ''
      return (
        <Input
          label="Text"
          value={text}
          maxLength={slot.constraints.maxChars}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder={`Skriv ${slot.label.toLowerCase()}...`}
        />
      )
    }

    case 'body-text': {
      const text = (content as { text?: string })?.text ?? ''
      return (
        <Textarea
          label="Brödtext"
          value={text}
          charCount={text.length}
          maxChars={slot.constraints.maxChars}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Skriv din text här..."
          rows={6}
        />
      )
    }

    case 'bullet-list': {
      const c = content?.type === 'bullet-list' ? content : { type: 'bullet-list' as const, items: [] }
      const items = c.items ?? []
      return (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-slate-700">Punkter</p>
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-blue-600 mt-2 text-sm">•</span>
              <Input
                value={item}
                onChange={(e) => {
                  const next = [...items]
                  next[i] = e.target.value
                  setSlotContent(slot.id, { type: 'bullet-list', items: next })
                }}
                placeholder={`Punkt ${i + 1}`}
              />
              <button
                className="mt-1.5 text-slate-400 hover:text-red-500 text-xs"
                onClick={() => {
                  const next = items.filter((_, j) => j !== i)
                  setSlotContent(slot.id, { type: 'bullet-list', items: next })
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {items.length < (slot.constraints.maxBullets ?? 8) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSlotContent(slot.id, { type: 'bullet-list', items: [...items, ''] })
              }
            >
              + Lägg till punkt
            </Button>
          )}
        </div>
      )
    }

    case 'cta': {
      const label = (content as { label?: string })?.label ?? ''
      const url = (content as { url?: string })?.url ?? ''
      return (
        <div className="flex flex-col gap-3">
          <Input
            label="CTA-text"
            value={label}
            maxLength={slot.constraints.maxChars}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Anmäl dig idag"
          />
          <Input
            label="Länk (valfritt)"
            value={url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="https://..."
            type="url"
          />
        </div>
      )
    }

    case 'contact': {
      const c = content?.type === 'contact' ? content : {}
      return (
        <div className="flex flex-col gap-2">
          <Input label="Namn" value={(c as { name?: string }).name ?? ''} onChange={(e) => onUpdate({ name: e.target.value })} placeholder="Anna Andersson" />
          <Input label="Titel" value={(c as { title?: string }).title ?? ''} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Kursansvarig" />
          <Input label="E-post" type="email" value={(c as { email?: string }).email ?? ''} onChange={(e) => onUpdate({ email: e.target.value })} placeholder="anna@example.com" />
          <Input label="Telefon" type="tel" value={(c as { phone?: string }).phone ?? ''} onChange={(e) => onUpdate({ phone: e.target.value })} placeholder="+46 70 123 45 67" />
        </div>
      )
    }

    case 'image': {
      const url = (content as { storageUrl?: string })?.storageUrl ?? ''
      return (
        <div className="flex flex-col gap-2">
          <Input
            label="Bild-URL"
            value={url}
            onChange={(e) => onUpdate({ storageUrl: e.target.value })}
            placeholder="https://..."
            type="url"
          />
          <p className="text-xs text-slate-400">Klistra in URL till bilden, eller ladda upp via Supabase Storage.</p>
        </div>
      )
    }

    case 'gradient-background': {
      const currentGradId = (content as { gradientId?: string })?.gradientId ?? gradients[0]?.id ?? ''
      const options = gradients.map((g) => ({ value: g.id, label: g.name }))
      return (
        <Select
          label="Gradient"
          value={currentGradId}
          options={options}
          onChange={(e) => setSlotContent(slot.id, { type: 'gradient-background', gradientId: e.target.value })}
        />
      )
    }

    default:
      return <p className="text-xs text-slate-400">Inga redigerbara fält för denna typ.</p>
  }
}
