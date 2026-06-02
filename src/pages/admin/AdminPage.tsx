import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDesignSystemStore } from '../../store/useDesignSystemStore'
import { GRADIENT_PRESETS } from '../../config/gradientPresets'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ImageUploader } from '../../components/ui/ImageUploader'
import { ChevronLeft, Palette, Type, Layers, Image } from 'lucide-react'
import type { DesignSystem, ColorToken, ColorTokenKey } from '../../types/designSystem.types'
import type { GradientDefinition } from '../../types/gradient.types'
import { buildGradientCSS } from '../../lib/gradientBuilder'

type Tab = 'colors' | 'typography' | 'gradients' | 'logo'

export function AdminPage() {
  const navigate = useNavigate()
  const { activeDesignSystem, setDesignSystem } = useDesignSystemStore()
  const [tab, setTab] = useState<Tab>('colors')
  const [ds, setDs] = useState<DesignSystem>({ ...activeDesignSystem })
  const [saved, setSaved] = useState(false)

  function save() {
    setDesignSystem(ds)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function updateColor(key: ColorTokenKey, hex: string) {
    setDs((prev) => ({
      ...prev,
      colors: prev.colors.map((c) => (c.key === key ? { ...c, hex } : c)),
    }))
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'colors', label: 'Färger', icon: <Palette size={14} /> },
    { id: 'typography', label: 'Typsnitt', icon: <Type size={14} /> },
    { id: 'gradients', label: 'Gradienter', icon: <Layers size={14} /> },
    { id: 'logo', label: 'Logotyp', icon: <Image size={14} /> },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm"
            >
              <ChevronLeft size={16} />
              Tillbaka
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <h1 className="font-bold text-slate-900">Designsystem – Admin</h1>
          </div>
          <Button onClick={save} variant={saved ? 'secondary' : 'primary'} size="sm">
            {saved ? '✓ Sparad' : 'Spara ändringar'}
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200 mb-8 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${tab === t.id ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'colors' && <ColorEditor ds={ds} onUpdateColor={updateColor} />}
        {tab === 'typography' && <TypographyViewer ds={ds} />}
        {tab === 'gradients' && <GradientViewer gradients={GRADIENT_PRESETS} ds={ds} />}
        {tab === 'logo' && (
          <LogoEditor
            ds={ds}
            onUpdate={(variant, url) =>
              setDs((p) => ({ ...p, logoAssets: { ...p.logoAssets, [variant]: url } }))
            }
          />
        )}
      </main>
    </div>
  )
}

function ColorEditor({
  ds,
  onUpdateColor,
}: {
  ds: DesignSystem
  onUpdateColor: (key: ColorTokenKey, hex: string) => void
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Färgpalett</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ds.colors.map((color) => (
          <ColorRow key={color.key} color={color} onChange={(hex) => onUpdateColor(color.key, hex)} />
        ))}
      </div>
    </div>
  )
}

function ColorRow({ color, onChange }: { color: ColorToken; onChange: (hex: string) => void }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4">
      <div className="relative">
        <div
          className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer overflow-hidden"
          style={{ backgroundColor: color.hex }}
        >
          <input
            type="color"
            value={color.hex}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm">{color.label}</p>
        <p className="text-xs text-slate-500 font-mono">{color.hex}</p>
        {color.usageNotes && <p className="text-xs text-slate-400 mt-0.5 truncate">{color.usageNotes}</p>}
      </div>
      <input
        type="text"
        value={color.hex}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 text-xs font-mono border border-slate-200 rounded px-2 py-1 text-slate-700"
      />
    </div>
  )
}

function TypographyViewer({ ds }: { ds: DesignSystem }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Typografitokens</h2>
      <div className="flex flex-col gap-3">
        {ds.typography.map((t) => (
          <div key={t.key} className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{t.key}</span>
              <span className="text-xs text-slate-400">{t.sizeRem}rem · {t.fontWeight}</span>
            </div>
            <p
              style={{
                fontFamily: t.fontFamily,
                fontWeight: t.fontWeight,
                fontSize: `${t.sizeRem}rem`,
                lineHeight: t.lineHeight,
                letterSpacing: t.letterSpacing,
                textTransform: t.textTransform ?? 'none',
                color: ds.colors.find((c) => c.key === t.colorTokenKey)?.hex ?? '#000',
              }}
            >
              Det här är ett exempel
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function GradientViewer({ gradients, ds }: { gradients: GradientDefinition[]; ds: DesignSystem }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Gradientpresets</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {gradients.map((g) => (
          <div key={g.id} className="bg-white rounded-xl overflow-hidden border border-slate-200">
            <div
              className="h-24"
              style={{ background: buildGradientCSS(g, ds) }}
            />
            <div className="p-3">
              <p className="text-sm font-medium text-slate-700">{g.name}</p>
              <p className="text-xs text-slate-400 capitalize">{g.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const LOGO_VARIANTS: { key: 'full-color' | 'white' | 'black'; label: string; bg: string }[] = [
  { key: 'full-color', label: 'Färg', bg: 'bg-white' },
  { key: 'white', label: 'Vit (på mörk bakgrund)', bg: 'bg-slate-800' },
  { key: 'black', label: 'Svart (på ljus bakgrund)', bg: 'bg-slate-100' },
]

function LogoEditor({
  ds,
  onUpdate,
}: {
  ds: DesignSystem
  onUpdate: (variant: 'full-color' | 'white' | 'black', url: string) => void
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Logotypvarianter</h2>
      <div className="flex flex-col gap-6">
        {LOGO_VARIANTS.map(({ key, label, bg }) => (
          <div key={key} className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-800">{label}</h3>
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{key}</span>
            </div>
            {ds.logoAssets[key] && (
              <div className={`rounded-lg p-4 flex items-center justify-center h-24 ${bg}`}>
                <img src={ds.logoAssets[key]} alt={label} className="max-h-full max-w-full object-contain" />
              </div>
            )}
            <ImageUploader
              value={ds.logoAssets[key] ?? ''}
              bucket="assets"
              folder="logos"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              hint="PNG eller SVG rekommenderas."
              onUploaded={(url) => onUpdate(key, url)}
            />
            <Input
              label="Eller klistra in URL"
              value={ds.logoAssets[key] ?? ''}
              onChange={(e) => onUpdate(key, e.target.value)}
              placeholder="https://..."
            />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="font-medium mb-1">Minsta bredd</p>
            <p>{ds.logoRules.minWidthPx}px</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="font-medium mb-1">Frizon</p>
            <p>{ds.logoRules.clearspaceMultiplier * 100}% av logohöjd</p>
          </div>
        </div>
      </div>
    </div>
  )
}
