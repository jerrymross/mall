import type { TemplateSlot } from '../../types/template.types'
import type { SlotContent } from '../../types/content.types'
import type { DesignSystem } from '../../types/designSystem.types'
import type { GradientDefinition } from '../../types/gradient.types'
import { resolveTypography, resolveColor, typographyToCSS } from '../../lib/tokenResolver'
import { buildGradientCSS } from '../../lib/gradientBuilder'

interface Props {
  slot: TemplateSlot
  content: SlotContent | undefined
  designSystem: DesignSystem
  gradients: GradientDefinition[]
  isSelected: boolean
  onClick: () => void
  onUpdateContent?: (text: string) => void
  mmToPx: number
}

export function SlotRenderer({ slot, content, designSystem, gradients, isSelected, onClick, onUpdateContent, mmToPx }: Props) {
  const pos = slot.position
  const style: React.CSSProperties = {
    position: 'absolute',
    left: pos.x * mmToPx,
    top: pos.y * mmToPx,
    width: pos.width * mmToPx,
    height: pos.height * mmToPx,
    zIndex: slot.zIndex,
    cursor: slot.locked || slot.type === 'gradient-background' || slot.type === 'logo' ? 'default' : 'pointer',
    outline: isSelected && !slot.locked ? '2px solid #3b82f6' : '2px solid transparent',
    outlineOffset: '-2px',
    transition: 'outline-color 0.15s',
    overflow: 'hidden',
  }

  const typToken = slot.constraints.typographyTokenKey
    ? resolveTypography(designSystem, slot.constraints.typographyTokenKey)
    : undefined

  const textStyle = typToken ? typographyToCSS(typToken, designSystem) : {}

  const handleClick = (e: React.MouseEvent) => {
    if (!slot.locked && slot.type !== 'gradient-background') {
      e.stopPropagation()
      onClick()
    }
  }

  const placeholder = (text: string) => (
    <div style={{ ...style, display: 'flex', alignItems: 'center' }} onClick={handleClick}>
      <span style={{ ...textStyle, opacity: 0.35, fontStyle: 'italic', userSelect: 'none' }}>{text}</span>
    </div>
  )

  switch (slot.type) {
    case 'gradient-background': {
      const gradientId = slot.locked
        ? slot.constraints.gradientId
        : content?.type === 'gradient-background'
          ? content.gradientId
          : undefined
      const grad = gradientId ? gradients.find((g) => g.id === gradientId) : undefined
      if (grad) {
        return <div style={{ ...style, background: buildGradientCSS(grad, designSystem), cursor: 'default' }} />
      }
      return <div style={{ ...style, background: '#eee', cursor: 'default' }} />
    }

    case 'logo': {
      const variant = slot.constraints.logoVariant ?? 'full-color'
      const logoUrl =
        designSystem.logoAssets[variant] ??
        designSystem.logoAssets['full-color'] ??
        Object.values(designSystem.logoAssets)[0] ??
        ''
      return (
        <div style={style}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logotyp" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 4,
              }}
            >
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 2, opacity: 0.7 }}>
                LOGOTYP
              </span>
            </div>
          )}
        </div>
      )
    }

    case 'heading':
    case 'subheading': {
      const text = content?.type === 'heading' || content?.type === 'subheading' ? content.text : ''
      if (isSelected && onUpdateContent) {
        return (
          <div style={{ ...style, display: 'flex', alignItems: 'center' }}>
            <textarea
              autoFocus
              value={text}
              maxLength={slot.constraints.maxChars}
              onChange={(e) => onUpdateContent(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                ...textStyle,
                width: '100%',
                height: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: 0,
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                cursor: 'text',
                caretColor: textStyle.color as string ?? '#fff',
              }}
            />
          </div>
        )
      }
      if (!text) return placeholder(slot.label)
      return (
        <div style={{ ...style, display: 'flex', alignItems: 'center' }} onClick={handleClick}>
          <span style={{ ...textStyle, userSelect: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {text}
          </span>
        </div>
      )
    }

    case 'body-text': {
      const text = content?.type === 'body-text' ? content.text : ''
      if (isSelected && onUpdateContent) {
        return (
          <div style={{ ...style, padding: '2px 0' }}>
            <textarea
              autoFocus
              value={text}
              maxLength={slot.constraints.maxChars}
              onChange={(e) => onUpdateContent(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                ...textStyle,
                width: '100%',
                height: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: 0,
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                cursor: 'text',
                caretColor: textStyle.color as string ?? '#000',
              }}
            />
          </div>
        )
      }
      if (!text) return placeholder(slot.label)
      return (
        <div style={{ ...style, padding: '2px 0', overflow: 'hidden' }} onClick={handleClick}>
          <p style={{ ...textStyle, margin: 0, userSelect: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {text}
          </p>
        </div>
      )
    }

    case 'bullet-list': {
      const items = content?.type === 'bullet-list' ? content.items : []
      if (!items.length) return placeholder(slot.label)
      const bulletColor = slot.constraints.colorTokenKey
        ? resolveColor(designSystem, slot.constraints.colorTokenKey)
        : '#0057A8'
      return (
        <div style={style} onClick={handleClick}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {items.map((item, i) => (
              <li key={i} style={{ ...textStyle, display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 3 }}>
                <span style={{ color: bulletColor, fontSize: (typToken?.sizeRem ?? 0.875) * 16, lineHeight: 1.5 }}>
                  •
                </span>
                <span style={{ flex: 1, userSelect: 'none' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    }

    case 'cta': {
      const label = content?.type === 'cta' ? content.label : ''
      const bgColor = slot.constraints.colorTokenKey
        ? resolveColor(designSystem, slot.constraints.colorTokenKey)
        : '#0057A8'
      if (!label) return placeholder(slot.label)
      return (
        <div
          style={{
            ...style,
            background: bgColor,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={handleClick}
        >
          <span style={{ ...textStyle, color: '#fff', userSelect: 'none' }}>{label}</span>
        </div>
      )
    }

    case 'contact': {
      const c = content?.type === 'contact' ? content : null
      if (!c?.name && !c?.email) return placeholder(slot.label)
      return (
        <div style={style} onClick={handleClick}>
          {c?.name && <div style={{ ...textStyle, fontWeight: 600, userSelect: 'none' }}>{c.name}</div>}
          {c?.title && <div style={{ ...textStyle, userSelect: 'none' }}>{c.title}</div>}
          {c?.email && <div style={{ ...textStyle, userSelect: 'none' }}>{c.email}</div>}
          {c?.phone && <div style={{ ...textStyle, userSelect: 'none' }}>{c.phone}</div>}
        </div>
      )
    }

    case 'image': {
      const img = content?.type === 'image' ? content : null
      const url = img?.storageUrl ?? ''
      const fit = img?.objectFit ?? 'cover'
      const overlayColor = img?.overlayColorTokenKey
        ? resolveColor(designSystem, img.overlayColorTokenKey as Parameters<typeof resolveColor>[1])
        : null
      const overlayOpacity = img?.overlayOpacity ?? 0.5
      const overlayAngle = img?.overlayAngle ?? 180
      const overlayCSS = overlayColor
        ? `linear-gradient(${overlayAngle}deg, ${overlayColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, '0')} 0%, transparent 100%)`
        : null
      return (
        <div style={{ ...style, background: 'transparent', position: 'absolute' }} onClick={handleClick}>
          {url ? (
            <>
              <img
                src={url}
                alt={img?.altText ?? ''}
                style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }}
              />
              {overlayCSS && (
                <div style={{ position: 'absolute', inset: 0, background: overlayCSS, pointerEvents: 'none' }} />
              )}
            </>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(0,0,0,0.15)',
              }}
            >
              <span style={{ color: 'rgba(0,0,0,0.3)', fontSize: 11 }}>Klicka för att ladda upp bild</span>
            </div>
          )}
        </div>
      )
    }

    default:
      return <div style={style} />
  }
}
