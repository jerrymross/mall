import {
  Document,
  Page,
  View,
  Text,
  Image as PDFImage,
  StyleSheet,
  Svg,
  Defs,
  LinearGradient as PDFLinearGradient,
  RadialGradient as PDFRadialGradient,
  Stop,
  Rect,
} from '@react-pdf/renderer'
import type { TemplateDefinition, TemplateSlot } from '../types/template.types'
import type { ContentMap, SlotContent } from '../types/content.types'
import type { DesignSystem } from '../types/designSystem.types'
import type { GradientDefinition } from '../types/gradient.types'
import { resolveColor, resolveTypography } from './tokenResolver'

function pdfFont(family: string, weight: number): string {
  const isSerif = family === 'Lora'
  const isBold = weight >= 600
  if (isSerif) return isBold ? 'Times-Bold' : 'Times-Roman'
  return isBold ? 'Helvetica-Bold' : 'Helvetica'
}

// 1rem = 16px = 12pt (1px = 0.75pt)
const MM_TO_PT = 2.8346
const REM_TO_PT = 12

// Convert CSS gradient angle (deg) to SVG linear gradient coordinates
function angleToSVGCoords(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x1: `${(0.5 - 0.5 * Math.cos(rad)) * 100}%`,
    y1: `${(0.5 - 0.5 * Math.sin(rad)) * 100}%`,
    x2: `${(0.5 + 0.5 * Math.cos(rad)) * 100}%`,
    y2: `${(0.5 + 0.5 * Math.sin(rad)) * 100}%`,
  }
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

interface GradientSVGProps {
  grad: GradientDefinition
  ds: DesignSystem
  width: number
  height: number
}

function GradientSVG({ grad, ds, width, height }: GradientSVGProps) {
  const id = `g${grad.id.replace(/\W/g, '')}`
  const stops = grad.stops.map((s, i) => {
    const hex = resolveColor(ds, s.colorTokenKey)
    const color = s.opacity < 1 ? hexToRgba(hex, s.opacity) : hex
    return <Stop key={i} offset={`${s.position}%`} stopColor={color} stopOpacity={s.opacity} />
  })

  if (grad.type === 'radial') {
    return (
      <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <PDFRadialGradient id={id} cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            {stops}
          </PDFRadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill={`url(#${id})`} />
      </Svg>
    )
  }

  const { x1, y1, x2, y2 } = angleToSVGCoords(grad.angle ?? 135)
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <PDFLinearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
          {stops}
        </PDFLinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill={`url(#${id})`} />
    </Svg>
  )
}

interface Props {
  template: TemplateDefinition
  contentMap: ContentMap
  designSystem: DesignSystem
  gradients: GradientDefinition[]
  title: string
}

export function PDFDocument({ template, contentMap, designSystem, gradients }: Props) {
  return (
    <Document>
      {template.pages.map((page) => {
        const isLandscape = page.orientation === 'landscape'
        const pageWpt = isLandscape ? 297 * MM_TO_PT : 210 * MM_TO_PT
        const pageHpt = isLandscape ? 210 * MM_TO_PT : 297 * MM_TO_PT

        const bgGradient = page.backgroundGradientId
          ? gradients.find((g) => g.id === page.backgroundGradientId)
          : undefined
        const bgColor = page.backgroundColorTokenKey
          ? resolveColor(designSystem, page.backgroundColorTokenKey)
          : bgGradient
            ? resolveColor(designSystem, bgGradient.stops[0].colorTokenKey)
            : '#FFFFFF'

        return (
          <Page
            key={page.pageNumber}
            size="A4"
            orientation={isLandscape ? 'landscape' : 'portrait'}
            style={[styles.page, { backgroundColor: bgColor }]}
          >
            {/* Page-level gradient background */}
            {bgGradient && (
              <GradientSVG grad={bgGradient} ds={designSystem} width={pageWpt} height={pageHpt} />
            )}

            {page.slots
              .filter((slot) => slot.visible)
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((slot) => (
                <PDFSlot
                  key={slot.id}
                  slot={slot}
                  content={contentMap[slot.id]}
                  designSystem={designSystem}
                  gradients={gradients}
                />
              ))}
          </Page>
        )
      })}
    </Document>
  )
}

function PDFSlot({
  slot,
  content,
  designSystem,
  gradients,
}: {
  slot: TemplateSlot
  content: SlotContent | undefined
  designSystem: DesignSystem
  gradients: GradientDefinition[]
}) {
  const pos = slot.position
  const wPt = pos.width * MM_TO_PT
  const hPt = pos.height * MM_TO_PT
  const bgColor = slot.constraints.bgColorTokenKey
    ? resolveColor(designSystem, slot.constraints.bgColorTokenKey)
    : undefined
  const borderRadiusPt = slot.constraints.borderRadius ? slot.constraints.borderRadius * MM_TO_PT : undefined
  const base = {
    position: 'absolute' as const,
    left: pos.x * MM_TO_PT,
    top: pos.y * MM_TO_PT,
    width: wPt,
    height: hPt,
    overflow: 'hidden' as const,
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    ...(borderRadiusPt ? { borderRadius: borderRadiusPt } : {}),
  }

  const typToken = slot.constraints.typographyTokenKey
    ? resolveTypography(designSystem, slot.constraints.typographyTokenKey)
    : undefined

  const textStyle = typToken
    ? {
        fontFamily: pdfFont(typToken.fontFamily, typToken.fontWeight),
        fontSize: typToken.sizeRem * REM_TO_PT,
        color: resolveColor(designSystem, typToken.colorTokenKey),
        lineHeight: typToken.lineHeight,
        letterSpacing: typToken.letterSpacing
          ? parseFloat(String(typToken.letterSpacing)) || 0
          : 0,
        textTransform: (typToken.textTransform ?? 'none') as 'none' | 'uppercase' | 'lowercase' | 'capitalize',
      }
    : { fontFamily: 'Helvetica', fontSize: 10, color: '#000000', lineHeight: 1.4 }

  // Gradient-background slot
  if (slot.type === 'gradient-background') {
    const gradientId = slot.locked
      ? slot.constraints.gradientId
      : content?.type === 'gradient-background'
        ? content.gradientId
        : undefined
    const grad = gradientId ? gradients.find((g) => g.id === gradientId) : undefined
    if (!grad) return <View style={[base, { backgroundColor: '#EEEEEE' }]} />
    return (
      <View style={base}>
        <GradientSVG grad={grad} ds={designSystem} width={wPt} height={hPt} />
      </View>
    )
  }

  // Logo
  if (slot.type === 'logo') {
    const variant = slot.constraints.logoVariant ?? 'full-color'
    const logoUrl =
      designSystem.logoAssets[variant] ??
      designSystem.logoAssets['full-color'] ??
      Object.values(designSystem.logoAssets)[0] ??
      ''
    if (!logoUrl) return <View style={base} />
    return (
      <View style={base}>
        <PDFImage src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </View>
    )
  }

  if (!content) return <View style={base} />

  switch (content.type) {
    case 'heading':
    case 'subheading':
      return (
        <View style={[base, { justifyContent: 'center' }]}>
          <Text style={textStyle}>{content.text}</Text>
        </View>
      )

    case 'body-text':
      return (
        <View style={base}>
          <Text style={textStyle}>{content.text}</Text>
        </View>
      )

    case 'bullet-list': {
      const bulletColor = slot.constraints.colorTokenKey
        ? resolveColor(designSystem, slot.constraints.colorTokenKey)
        : textStyle.color
      return (
        <View style={base}>
          {content.items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: typToken ? typToken.sizeRem * REM_TO_PT * 0.3 : 2 }}>
              <Text style={[textStyle, { color: bulletColor, marginRight: 4 }]}>•</Text>
              <Text style={[textStyle, { flex: 1 }]}>{item}</Text>
            </View>
          ))}
        </View>
      )
    }

    case 'cta': {
      const ctaColor = slot.constraints.colorTokenKey
        ? resolveColor(designSystem, slot.constraints.colorTokenKey)
        : '#0057A8'
      return (
        <View style={[base, { backgroundColor: ctaColor, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }]}>
          <Text style={[textStyle, { color: '#FFFFFF' }]}>{content.label}</Text>
        </View>
      )
    }

    case 'contact':
      return (
        <View style={base}>
          {content.name  && <Text style={[textStyle, { fontFamily: pdfFont(typToken?.fontFamily ?? 'Inter', 700), marginBottom: 1 }]}>{content.name}</Text>}
          {content.title && <Text style={[textStyle, { marginBottom: 1 }]}>{content.title}</Text>}
          {content.email && <Text style={[textStyle, { marginBottom: 1 }]}>{content.email}</Text>}
          {content.phone && <Text style={textStyle}>{content.phone}</Text>}
        </View>
      )

    case 'image':
      if (!content.storageUrl) return <View style={[base, { backgroundColor: '#D1DCE8' }]} />
      return (
        <View style={base}>
          <PDFImage
            src={content.storageUrl}
            style={{ width: '100%', height: '100%', objectFit: content.objectFit === 'contain' ? 'contain' : 'cover' }}
          />
        </View>
      )

    case 'divider': {
      const color = resolveColor(designSystem, content.colorTokenKey)
      const thickness = content.thickness * 0.75  // px → pt
      const widthPct = content.widthPct
      const marginLeft = content.align === 'center'
        ? ((100 - widthPct) / 2 / 100) * wPt
        : content.align === 'right'
          ? ((100 - widthPct) / 100) * wPt
          : 0
      return (
        <View style={[base, { justifyContent: 'center' }]}>
          <View style={{ width: `${widthPct}%`, height: thickness, backgroundColor: color, marginLeft, borderRadius: thickness }} />
        </View>
      )
    }

    case 'table': {
      const t = content
      const cols = t.colWidths.length
      const showBorder = t.showBorders && t.borderColorTokenKey
      const borderCol = showBorder ? resolveColor(designSystem, t.borderColorTokenKey!) : undefined
      const headerBg = resolveColor(designSystem, t.headerBgColorTokenKey)
      const evenBg   = resolveColor(designSystem, t.evenBgColorTokenKey)
      const oddBg    = resolveColor(designSystem, t.oddBgColorTokenKey)
      const textCol  = resolveColor(designSystem, t.textColorTokenKey)
      const hTextCol = resolveColor(designSystem, t.headerTextColorTokenKey)
      const fs       = t.fontSize * REM_TO_PT

      return (
        <View style={base}>
          {t.rows.map((row, ri) => {
            const isHeader = t.headerRow && ri === 0
            const bg = isHeader ? headerBg : ri % 2 === 0 ? evenBg : oddBg
            const fc = isHeader ? hTextCol : textCol
            return (
              <View key={ri} style={{
                flexDirection: 'row',
                backgroundColor: bg,
                borderBottom: borderCol ? `0.5pt solid ${borderCol}` : undefined,
              }}>
                {Array.from({ length: cols }).map((_, ci) => {
                  const cell = row[ci] ?? { text: '' }
                  const w = t.colWidths[ci] ?? (100 / cols)
                  return (
                    <View key={ci} style={{
                      width: `${w}%`,
                      borderRight: borderCol && ci < cols - 1 ? `0.5pt solid ${borderCol}` : undefined,
                      padding: '2pt 4pt',
                    }}>
                      <Text style={{
                        fontFamily: pdfFont('Inter', (isHeader || cell.bold) ? 700 : 400),
                        fontSize: fs,
                        color: fc,
                        textAlign: cell.align ?? 'left',
                      }}>
                        {cell.text}
                      </Text>
                    </View>
                  )
                })}
              </View>
            )
          })}
        </View>
      )
    }

    default:
      return <View style={base} />
  }
}

const styles = StyleSheet.create({
  page: {
    position: 'relative',
  },
})
