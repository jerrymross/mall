import type { TemplateSlot } from '../../../types/template.types'
import type { ContentMap } from '../../../types/content.types'
import { CheckCircle, Circle, AlertCircle } from 'lucide-react'

interface Props {
  slots: TemplateSlot[]
  contentMap: ContentMap
  selectedSlotId: string | null
  onSelectSlot: (slotId: string) => void
}

const slotTypeLabel: Record<string, string> = {
  heading: 'Rubrik',
  subheading: 'Underrubrik',
  'body-text': 'Brödtext',
  'bullet-list': 'Punktlista',
  cta: 'CTA',
  contact: 'Kontakt',
  image: 'Bild',
  logo: 'Logotyp',
  'gradient-background': 'Bakgrund',
}

function isSlotFilled(slot: TemplateSlot, contentMap: ContentMap): boolean {
  const c = contentMap[slot.id]
  if (!c) return false
  switch (c.type) {
    case 'heading':
    case 'subheading':
      return c.text.trim().length > 0
    case 'body-text':
      return c.text.trim().length > 0
    case 'bullet-list':
      return c.items.some((i) => i.trim().length > 0)
    case 'cta':
      return c.label.trim().length > 0
    case 'contact':
      return !!(c.name || c.email)
    case 'image':
      return c.storageUrl.length > 0
    case 'gradient-background':
      return c.gradientId.length > 0
    default:
      return true
  }
}

export function ContentPanel({ slots, contentMap, selectedSlotId, onSelectSlot }: Props) {
  const editableSlots = slots.filter((s) => s.type !== 'logo' && s.type !== 'gradient-background')
  const filled = editableSlots.filter((s) => isSlotFilled(s, contentMap)).length
  const required = editableSlots.filter((s) => s.constraints.required)
  const missingRequired = required.filter((s) => !isSlotFilled(s, contentMap)).length

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs text-slate-500 font-medium">Innehåll</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(filled / editableSlots.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{filled}/{editableSlots.length}</span>
        </div>
        {missingRequired > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle size={12} />
            {missingRequired} obligatoriska fält saknas
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {slots.filter((s) => s.type !== 'logo' && s.type !== 'gradient-background').map((slot) => {
          const filled = isSlotFilled(slot, contentMap)
          const isSelected = selectedSlotId === slot.id
          return (
            <button
              key={slot.id}
              onClick={() => onSelectSlot(slot.id)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors
                ${isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''}`}
            >
              {filled ? (
                <CheckCircle size={14} className="text-green-500 shrink-0" />
              ) : slot.constraints.required ? (
                <AlertCircle size={14} className="text-amber-400 shrink-0" />
              ) : (
                <Circle size={14} className="text-slate-300 shrink-0" />
              )}
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                  {slot.label}
                </p>
                <p className="text-xs text-slate-400">{slotTypeLabel[slot.type] ?? slot.type}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
