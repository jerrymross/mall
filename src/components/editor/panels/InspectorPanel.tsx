import { useEditorStore } from '../../../store/useEditorStore'
import type { TemplateSlot } from '../../../types/template.types'
import type { DesignSystem } from '../../../types/designSystem.types'
import type { GradientDefinition } from '../../../types/gradient.types'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { ImageUploader } from '../../ui/ImageUploader'
import { useAIGenerate } from '../../../hooks/useAIGenerate'
import { Sparkles } from 'lucide-react'
import type { SlotContent } from '../../../types/content.types'

interface Props {
  slot: TemplateSlot
  designSystem: DesignSystem
  gradients: GradientDefinition[]
}

export function InspectorPanel({ slot, designSystem, gradients }: Props) {
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

      <SlotForm slot={slot} content={content} designSystem={designSystem} gradients={gradients} onUpdate={update} />

      {/* Style overrides for text slots */}
      {['heading','subheading','body-text','bullet-list','cta','contact'].includes(slot.type) && (
        <StyleOverridePanel
          content={content}
          designSystem={designSystem}
          onUpdate={update}
        />
      )}

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
  designSystem,
  gradients,
  onUpdate,
}: {
  slot: TemplateSlot
  content: SlotContent | undefined
  designSystem: DesignSystem
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
      const imgContent = content?.type === 'image' ? content : null
      const url = imgContent?.storageUrl ?? ''
      const fit = imgContent?.objectFit ?? 'cover'
      const overlay = imgContent?.overlay
      const stops = overlay?.stops ?? []
      const colorOptions = designSystem.colors.map((c) => ({ value: c.key, label: c.label }))

      function updateOverlay(patch: Partial<import('../../../types/content.types').ImageOverlay>) {
        const base = overlay ?? { type: 'linear' as const, angle: 180, stops: [] }
        onUpdate({ overlay: { ...base, ...patch } })
      }
      function updateStop(i: number, patch: Partial<import('../../../types/content.types').OverlayStop>) {
        const next = stops.map((s, idx) => idx === i ? { ...s, ...patch } : s)
        updateOverlay({ stops: next })
      }
      function addStop() {
        const pos = stops.length === 0 ? 0 : stops.length === 1 ? 100 : 50
        updateOverlay({ stops: [...stops, { colorTokenKey: designSystem.colors[0].key, opacity: 1, position: pos }] })
      }
      function removeStop(i: number) {
        updateOverlay({ stops: stops.filter((_, idx) => idx !== i) })
      }

      return (
        <div className="flex flex-col gap-4">
          <ImageUploader
            value={url}
            bucket="assets"
            folder="images"
            label="Bild"
            hint="PNG, JPG, WebP eller SVG."
            onUploaded={(publicUrl) => onUpdate({ storageUrl: publicUrl })}
          />

          {/* Fit */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-slate-700">Bildplacering</p>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
              {(['cover', 'contain'] as const).map((option) => (
                <button key={option} onClick={() => onUpdate({ objectFit: option })}
                  className={`flex-1 py-1.5 font-medium transition-colors ${fit === option ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {option === 'cover' ? 'Fyll' : 'Passa in'}
                </button>
              ))}
            </div>
          </div>

          {/* Overlay editor */}
          <div className="border-t border-slate-100 pt-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">Gradientöverlägg</p>
              <button onClick={addStop}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Lägg till stopp</button>
            </div>

            {stops.length === 0 && (
              <p className="text-xs text-slate-400 italic">Inget överlägg. Klicka "+ Lägg till stopp".</p>
            )}

            {/* Color stops */}
            {stops.map((stop, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-2.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Stopp {i + 1}</span>
                  <button onClick={() => removeStop(i)} className="text-xs text-red-400 hover:text-red-600">✕</button>
                </div>
                <select
                  value={stop.colorTokenKey}
                  onChange={(e) => updateStop(i, { colorTokenKey: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2 py-1"
                >
                  {colorOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  <option value="transparent">Transparent</option>
                </select>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                    <span>Opacitet</span><span>{Math.round(stop.opacity * 100)}%</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.05} value={stop.opacity}
                    onChange={(e) => updateStop(i, { opacity: Number(e.target.value) })}
                    className="w-full accent-blue-600" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                    <span>Position</span><span>{stop.position}%</span>
                  </div>
                  <input type="range" min={0} max={100} step={1} value={stop.position}
                    onChange={(e) => updateStop(i, { position: Number(e.target.value) })}
                    className="w-full accent-blue-600" />
                </div>
              </div>
            ))}

            {stops.length > 0 && (
              <>
                {/* Type */}
                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                  {(['linear', 'radial'] as const).map((t) => (
                    <button key={t} onClick={() => updateOverlay({ type: t })}
                      className={`flex-1 py-1.5 font-medium transition-colors ${(overlay?.type ?? 'linear') === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {t === 'linear' ? 'Linjär' : 'Radial'}
                    </button>
                  ))}
                </div>

                {/* Angle (only for linear) */}
                {(overlay?.type ?? 'linear') === 'linear' && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                      <span>Vinkel</span><span>{overlay?.angle ?? 180}°</span>
                    </div>
                    <input type="range" min={0} max={360} step={15} value={overlay?.angle ?? 180}
                      onChange={(e) => updateOverlay({ angle: Number(e.target.value) })}
                      className="w-full accent-blue-600" />
                    <div className="grid grid-cols-4 gap-1 mt-1">
                      {[{label:'↓',val:180},{label:'→',val:90},{label:'↗',val:45},{label:'↘',val:135}].map(({label,val}) => (
                        <button key={val} onClick={() => updateOverlay({ angle: val })}
                          className={`text-xs py-1 rounded border transition-colors ${(overlay?.angle ?? 180) === val ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blend mode */}
                <Select
                  label="Blandningsläge"
                  value={overlay?.blendMode ?? 'normal'}
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'multiply', label: 'Multiplicera' },
                    { value: 'screen', label: 'Screen' },
                    { value: 'overlay', label: 'Overlay' },
                    { value: 'soft-light', label: 'Soft light' },
                    { value: 'color-burn', label: 'Color burn' },
                  ]}
                  onChange={(e) => updateOverlay({ blendMode: e.target.value as import('../../../types/content.types').ImageOverlay['blendMode'] })}
                />
              </>
            )}
          </div>
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

    case 'divider': {
      const d = content?.type === 'divider'
        ? content
        : { type: 'divider' as const, colorTokenKey: 'neutral-300', thickness: 1, widthPct: 100, align: 'center' as const }

      function setD(patch: Partial<import('../../../types/content.types').DividerContent>) {
        setSlotContent(slot.id, { ...d, ...patch })
      }

      const colorOpts = designSystem.colors.map((c) => ({ value: c.key, label: c.label }))
      const lineColor = designSystem.colors.find((c) => c.key === d.colorTokenKey)?.hex ?? '#D1DCE8'

      return (
        <div className="flex flex-col gap-4">
          {/* Live preview */}
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 flex items-center justify-center" style={{ height: 40 }}>
            <div style={{
              width: `${d.widthPct}%`,
              height: d.thickness,
              background: lineColor,
              borderRadius: d.thickness,
              marginLeft: d.align === 'center' ? `${(100 - d.widthPct) / 2}%` : d.align === 'right' ? `${100 - d.widthPct}%` : 0,
            }} />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-slate-700">Färg</p>
            <select value={d.colorTokenKey} onChange={(e) => setD({ colorTokenKey: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1">
              {colorOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Thickness */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Tjocklek</span><span>{d.thickness}px</span>
            </div>
            <input type="range" min={1} max={12} step={1} value={d.thickness}
              onChange={(e) => setD({ thickness: Number(e.target.value) })}
              className="w-full accent-blue-600" />
          </div>

          {/* Width */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Bredd</span><span>{d.widthPct}%</span>
            </div>
            <input type="range" min={10} max={100} step={5} value={d.widthPct}
              onChange={(e) => setD({ widthPct: Number(e.target.value) })}
              className="w-full accent-blue-600" />
          </div>

          {/* Alignment */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-slate-700">Justering</p>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
              {(['left', 'center', 'right'] as const).map((a) => (
                <button key={a} onClick={() => setD({ align: a })}
                  className={`flex-1 py-1.5 font-medium transition-colors ${d.align === a ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {a === 'left' ? 'Vänster' : a === 'center' ? 'Mitten' : 'Höger'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    case 'table': {
      const t: import('../../../types/content.types').TableContent =
        content?.type === 'table'
          ? content
          : {
              type: 'table',
              rows: Array.from({ length: 5 }, () => Array.from({ length: 2 }, () => ({ text: '' }))),
              colWidths: [85, 15],
              headerRow: false,
              headerBgColorTokenKey: 'brand-primary',
              evenBgColorTokenKey: 'neutral-100',
              oddBgColorTokenKey: 'neutral-300',
              textColorTokenKey: 'brand-primary',
              headerTextColorTokenKey: 'neutral-100',
              fontSize: 0.9,
              showBorders: false,
              borderColorTokenKey: 'neutral-300',
            }

      const numRows = t.rows.length
      const numCols = t.colWidths.length
      const colorOpts = designSystem.colors.map((c) => ({ value: c.key, label: c.label }))

      function setTable(patch: Partial<import('../../../types/content.types').TableContent>) {
        setSlotContent(slot.id, { ...t, ...patch })
      }

      function setRows(n: number) {
        if (n < 1 || n > 20) return
        const next = Array.from({ length: n }, (_, ri) =>
          Array.from({ length: numCols }, (_, ci) => t.rows[ri]?.[ci] ?? { text: '' })
        )
        setTable({ rows: next })
      }

      function setCols(n: number) {
        if (n < 1 || n > 10) return
        const newWidths = Array.from({ length: n }, (_, i) => t.colWidths[i] ?? Math.floor(100 / n))
        const total = newWidths.reduce((a, b) => a + b, 0)
        newWidths[n - 1] += 100 - total
        const next = t.rows.map((row) =>
          Array.from({ length: n }, (_, ci) => row[ci] ?? { text: '' })
        )
        setTable({ rows: next, colWidths: newWidths })
      }

      function setCell(ri: number, ci: number, patch: Partial<import('../../../types/content.types').TableCell>) {
        const next = t.rows.map((row, r) =>
          row.map((cell, c) => (r === ri && c === ci ? { ...cell, ...patch } : cell))
        )
        setTable({ rows: next })
      }

      function setColWidth(ci: number, val: number) {
        const next = [...t.colWidths]
        const delta = val - next[ci]
        next[ci] = val
        // distribute delta from last column
        const last = numCols - 1
        if (ci !== last) next[last] = Math.max(5, next[last] - delta)
        else next[last - 1] = Math.max(5, next[last - 1] - delta)
        setTable({ colWidths: next })
      }

      function setColAlign(ci: number, align: import('../../../types/content.types').CellAlign) {
        const next = t.rows.map((row) =>
          row.map((cell, c) => c === ci ? { ...cell, align } : cell)
        )
        setTable({ rows: next })
      }

      const colAlign = (ci: number): import('../../../types/content.types').CellAlign =>
        t.rows[t.headerRow ? 1 : 0]?.[ci]?.align ?? 'left'

      return (
        <div className="flex flex-col gap-4">

          {/* Structure */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-slate-700">Struktur</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-500 mb-1">Rader</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setRows(numRows - 1)} className="w-6 h-6 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs">−</button>
                  <span className="text-xs font-mono w-5 text-center">{numRows}</span>
                  <button onClick={() => setRows(numRows + 1)} className="w-6 h-6 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs">+</button>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Kolumner</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCols(numCols - 1)} className="w-6 h-6 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs">−</button>
                  <span className="text-xs font-mono w-5 text-center">{numCols}</span>
                  <button onClick={() => setCols(numCols + 1)} className="w-6 h-6 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs">+</button>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" checked={t.headerRow} onChange={(e) => setTable({ headerRow: e.target.checked })} />
              Rubrikrad (första raden)
            </label>
          </div>

          {/* Colors */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-slate-700">Färger</p>
            {t.headerRow && (
              <ColorTokenRow label="Rubrikbakgrund" value={t.headerBgColorTokenKey} opts={colorOpts} onChange={(v) => setTable({ headerBgColorTokenKey: v })} />
            )}
            {t.headerRow && (
              <ColorTokenRow label="Rubriktext" value={t.headerTextColorTokenKey} opts={colorOpts} onChange={(v) => setTable({ headerTextColorTokenKey: v })} />
            )}
            <ColorTokenRow label="Jämna rader" value={t.evenBgColorTokenKey} opts={colorOpts} onChange={(v) => setTable({ evenBgColorTokenKey: v })} />
            <ColorTokenRow label="Udda rader" value={t.oddBgColorTokenKey} opts={colorOpts} onChange={(v) => setTable({ oddBgColorTokenKey: v })} />
            <ColorTokenRow label="Textfärg" value={t.textColorTokenKey} opts={colorOpts} onChange={(v) => setTable({ textColorTokenKey: v })} />
          </div>

          {/* Borders */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" checked={t.showBorders} onChange={(e) => setTable({ showBorders: e.target.checked })} />
              Visa kanter
            </label>
            {t.showBorders && (
              <ColorTokenRow label="Kantfärg" value={t.borderColorTokenKey ?? designSystem.colors[0]?.key ?? ''} opts={colorOpts} onChange={(v) => setTable({ borderColorTokenKey: v })} />
            )}
          </div>

          {/* Font size */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Textstorlek</span><span>{t.fontSize}rem</span>
            </div>
            <input type="range" min={0.5} max={1.5} step={0.05} value={t.fontSize}
              onChange={(e) => setTable({ fontSize: Number(e.target.value) })}
              className="w-full accent-blue-600" />
          </div>

          {/* Column widths & alignment */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-slate-700">Kolumner</p>
            {t.colWidths.map((w, ci) => (
              <div key={ci} className="bg-slate-50 rounded-lg p-2.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Kolumn {ci + 1}</span>
                  <div className="flex gap-0.5">
                    {(['left', 'center', 'right'] as const).map((a) => (
                      <button key={a} onClick={() => setColAlign(ci, a)}
                        className={`w-6 h-6 rounded text-xs transition-colors ${colAlign(ci) === a ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                        {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Bredd</span>
                  <input type="range" min={5} max={90} step={1} value={w}
                    onChange={(e) => setColWidth(ci, Number(e.target.value))}
                    className="flex-1 accent-blue-600" />
                  <span className="text-xs font-mono text-slate-500 w-8 text-right">{w}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Cell content grid */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-slate-700">Cellinnehåll</p>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {t.rows.map((row, ri) => (
                <div key={ri} className={`flex border-b border-slate-100 last:border-b-0 ${t.headerRow && ri === 0 ? 'bg-slate-100' : ''}`}>
                  {Array.from({ length: numCols }).map((_, ci) => (
                    <input key={ci} value={row[ci]?.text ?? ''}
                      onChange={(e) => setCell(ri, ci, { text: e.target.value })}
                      placeholder={t.headerRow && ri === 0 ? `Kol ${ci + 1}` : `R${ri}K${ci}`}
                      style={{ flex: 1, minWidth: 0, padding: '4px 6px', fontSize: 11, background: 'transparent', border: 'none', borderRight: ci < numCols - 1 ? '1px solid #e2e8f0' : 'none', outline: 'none' }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    default:
      return <p className="text-xs text-slate-400">Inga redigerbara fält för denna typ.</p>
  }
}

function StyleOverridePanel({
  content,
  designSystem,
  onUpdate,
}: {
  content: SlotContent | undefined
  designSystem: DesignSystem
  onUpdate: (partial: Partial<SlotContent>) => void
}) {
  const c = content as { colorTokenKey?: string; typographyTokenKey?: string } | undefined
  const colorOptions = designSystem.colors.map((c) => ({ value: c.key, label: c.label }))
  const typographyOptions = designSystem.typography.map((t) => ({ value: t.key, label: `${t.key} · ${t.fontFamily} ${t.sizeRem}rem` }))

  return (
    <div className="border-t border-slate-100 pt-3 flex flex-col gap-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Utseende</p>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-600">Färg</label>
        <select
          value={c?.colorTokenKey ?? ''}
          onChange={(e) => onUpdate({ colorTokenKey: e.target.value || undefined } as Partial<SlotContent>)}
          className="w-full text-xs border border-slate-200 rounded px-2 py-1"
        >
          <option value="">— Från mall —</option>
          {colorOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-600">Typsnitt</label>
        <select
          value={c?.typographyTokenKey ?? ''}
          onChange={(e) => onUpdate({ typographyTokenKey: e.target.value || undefined } as Partial<SlotContent>)}
          className="w-full text-xs border border-slate-200 rounded px-2 py-1"
        >
          <option value="">— Från mall —</option>
          {typographyOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  )
}

function ColorTokenRow({ label, value, opts, onChange }: { label: string; value: string; opts: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-600 w-28 flex-shrink-0">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-xs border border-slate-200 rounded px-2 py-1">
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
