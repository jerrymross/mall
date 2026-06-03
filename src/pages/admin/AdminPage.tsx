import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDesignSystemStore } from '../../store/useDesignSystemStore'
import { GRADIENT_PRESETS } from '../../config/gradientPresets'
import { Input } from '../../components/ui/Input'
import { ImageUploader } from '../../components/ui/ImageUploader'
import { ChevronLeft, Palette, Type, Layers, Image, PenTool, Check } from 'lucide-react'
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
    setTimeout(() => setSaved(false), 2200)
  }

  function updateColor(key: ColorTokenKey, hex: string) {
    setDs((prev) => ({ ...prev, colors: prev.colors.map((c) => (c.key === key ? { ...c, hex } : c)) }))
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'colors',     label: 'Färger',     icon: <Palette size={13} /> },
    { id: 'typography', label: 'Typsnitt',   icon: <Type size={13} /> },
    { id: 'gradients',  label: 'Gradienter', icon: <Layers size={13} /> },
    { id: 'logo',       label: 'Logotyp',    icon: <Image size={13} /> },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        height: 52, display: 'flex', alignItems: 'center',
        padding: '0 32px', justifyContent: 'space-between',
        background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, fontWeight: 500, padding: 0 }}>
            <ChevronLeft size={15} /> Tillbaka
          </button>
          <span style={{ width: 1, height: 16, background: '#e5e7eb' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>Designsystem</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/admin/template-builder')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#374151', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
            <PenTool size={12} /> Skapa ny mall
          </button>
          <button onClick={save}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: saved ? '#f0fdf4' : '#111827', border: saved ? '1px solid #86efac' : '1px solid transparent', color: saved ? '#16a34a' : '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            {saved ? <><Check size={13} /> Sparad</> : 'Spara ändringar'}
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 32px 96px' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 32, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid #e5e7eb' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 12.5, fontWeight: 600, transition: 'all 0.15s',
                background: tab === t.id ? '#fff' : 'transparent',
                color: tab === t.id ? '#111827' : '#6b7280',
                boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {tab === 'colors'     && <ColorEditor ds={ds} onUpdateColor={updateColor} />}
        {tab === 'typography' && <TypographyViewer ds={ds} />}
        {tab === 'gradients'  && <GradientViewer gradients={GRADIENT_PRESETS} ds={ds} />}
        {tab === 'logo'       && <LogoEditor ds={ds} onUpdate={(v, url) => setDs((p) => ({ ...p, logoAssets: { ...p.logoAssets, [v]: url } }))} />}
      </main>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.2px' }}>{children}</h2>
      <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
    </div>
  )
}

function ColorEditor({ ds, onUpdateColor }: { ds: DesignSystem; onUpdateColor: (key: ColorTokenKey, hex: string) => void }) {
  return (
    <div>
      <SectionHeading>Färgpalett</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
        {ds.colors.map((c) => <ColorRow key={c.key} color={c} onChange={(hex) => onUpdateColor(c.key, hex)} />)}
      </div>
    </div>
  )
}

function ColorRow({ color, onChange }: { color: ColorToken; onChange: (hex: string) => void }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: color.hex, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', cursor: 'pointer' }}>
          <input type="color" value={color.hex} onChange={(e) => onChange(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, marginBottom: 2 }}>{color.label}</p>
        {color.usageNotes && <p style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{color.usageNotes}</p>}
      </div>
      <input type="text" value={color.hex} onChange={(e) => onChange(e.target.value)}
        style={{ width: 90, fontSize: 11.5, fontFamily: 'monospace', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 8px', color: '#374151', background: '#fafafa' }} />
    </div>
  )
}

function TypographyViewer({ ds }: { ds: DesignSystem }) {
  return (
    <div>
      <SectionHeading>Typografitokens</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ds.typography.map((t) => (
          <div key={t.key} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <code style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 8px', borderRadius: 5, color: '#475569', fontFamily: 'monospace' }}>{t.key}</code>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{t.sizeRem}rem · {t.fontWeight}</span>
            </div>
            <p style={{ fontFamily: t.fontFamily, fontWeight: t.fontWeight, fontSize: `${t.sizeRem}rem`, lineHeight: t.lineHeight, letterSpacing: t.letterSpacing, textTransform: t.textTransform ?? 'none', color: ds.colors.find((c) => c.key === t.colorTokenKey)?.hex ?? '#000', margin: 0 }}>
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
      <SectionHeading>Gradientpresets</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
        {gradients.map((g) => (
          <div key={g.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ height: 80, background: buildGradientCSS(g, ds) }} />
            <div style={{ padding: '10px 12px' }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{g.name}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>{g.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const LOGO_VARIANTS: { key: 'full-color' | 'white' | 'black'; label: string; bg: string }[] = [
  { key: 'full-color', label: 'Färg',                   bg: '#ffffff' },
  { key: 'white',      label: 'Vit (på mörk bakgrund)', bg: '#1e293b' },
  { key: 'black',      label: 'Svart (på ljus bakgrund)', bg: '#f1f5f9' },
]

function LogoEditor({ ds, onUpdate }: { ds: DesignSystem; onUpdate: (variant: 'full-color' | 'white' | 'black', url: string) => void }) {
  return (
    <div>
      <SectionHeading>Logotypvarianter</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {LOGO_VARIANTS.map(({ key, label, bg }) => (
          <div key={key} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{label}</span>
              <code style={{ fontSize: 10.5, background: '#f1f5f9', padding: '2px 8px', borderRadius: 5, color: '#64748b', fontFamily: 'monospace' }}>{key}</code>
            </div>
            {ds.logoAssets[key] && (
              <div style={{ borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, background: bg, marginBottom: 14, border: '1px solid rgba(0,0,0,0.05)' }}>
                <img src={ds.logoAssets[key]} alt={label} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <ImageUploader value={ds.logoAssets[key] ?? ''} bucket="assets" folder="logos" accept="image/png,image/svg+xml,image/jpeg,image/webp" hint="PNG eller SVG rekommenderas." onUploaded={(url) => onUpdate(key, url)} />
            <div style={{ marginTop: 10 }}>
              <Input label="Eller klistra in URL" value={ds.logoAssets[key] ?? ''} onChange={(e) => onUpdate(key, e.target.value)} placeholder="https://..." />
            </div>
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Minsta bredd</p>
            <p style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{ds.logoRules.minWidthPx}px</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Frizon</p>
            <p style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{ds.logoRules.clearspaceMultiplier * 100}% av logohöjd</p>
          </div>
        </div>
      </div>
    </div>
  )
}
