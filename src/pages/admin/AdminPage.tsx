import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDesignSystemStore } from '../../store/useDesignSystemStore'
import { GRADIENT_PRESETS } from '../../config/gradientPresets'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
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
        {tab === 'logo' && <LogoEditor ds={ds} onUpdate={(url) => setDs((p) => ({ ...p, logoAssetUrl: url }))} />}
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

function LogoEditor({ ds, onUpdate }: { ds: DesignSystem; onUpdate: (url: string) => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Logotyp</h2>
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="h-32 bg-slate-100 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-slate-300">
          {ds.logoAssetUrl ? (
            <img src={ds.logoAssetUrl} alt="Logotyp" className="max-h-full max-w-full object-contain p-4" />
          ) : (
            <span className="text-slate-400 text-sm">Ingen logotyp uppladdad</span>
          )}
        </div>
        <Input
          label="Logotyp URL"
          value={ds.logoAssetUrl}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="https://..."
          hint="Klistra in URL till logotypen (PNG/SVG rekommenderas)"
        />
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="font-medium mb-1">Minsta bredd</p>
            <p>{ds.logoRules.minWidthPx}px</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="font-medium mb-1">Frizon</p>
            <p>{ds.logoRules.clearspaceMultiplier * 100}% av logohöjd</p>
          </div>
        </div>
      </div>
    </div>
  )
}
