import {
  Document,
  Page,
  View,
  Text,
  Image as PDFImage,
  StyleSheet,
} from '@react-pdf/renderer'
import type { TemplateDefinition, TemplateSlot } from '../types/template.types'
import type { ContentMap, SlotContent } from '../types/content.types'
import type { DesignSystem } from '../types/designSystem.types'
import type { GradientDefinition } from '../types/gradient.types'
import { resolveColor, resolveTypography } from './tokenResolver'

// Map web font families to built-in PDF fonts
// Inter → Helvetica, Lora → Times-Roman (serif equivalent)
function pdfFont(family: string, weight: number): string {
  const isSerif = family === 'Lora'
  const isBold = weight >= 600
  if (isSerif) return isBold ? 'Times-Bold' : 'Times-Roman'
  return isBold ? 'Helvetica-Bold' : 'Helvetica'
}

const MM_TO_PT = 2.8346

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
        const bgGradient = page.backgroundGradientId
          ? gradients.find((g) => g.id === page.backgroundGradientId)
          : undefined
        const bgColor = bgGradient
          ? resolveColor(designSystem, bgGradient.stops[0].colorTokenKey)
          : page.backgroundColorTokenKey
            ? resolveColor(designSystem, page.backgroundColorTokenKey)
            : '#FFFFFF'

        return (
          <Page
            key={page.pageNumber}
            size="A4"
            orientation={isLandscape ? 'landscape' : 'portrait'}
            style={[styles.page, { backgroundColor: bgColor }]}
          >
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
  const base = {
    position: 'absolute' as const,
    left: pos.x * MM_TO_PT,
    top: pos.y * MM_TO_PT,
    width: pos.width * MM_TO_PT,
    height: pos.height * MM_TO_PT,
    overflow: 'hidden' as const,
  }

  const typToken = slot.constraints.typographyTokenKey
    ? resolveTypography(designSystem, slot.constraints.typographyTokenKey)
    : undefined

  const textStyle = typToken
    ? {
        fontFamily: pdfFont(typToken.fontFamily, typToken.fontWeight),
        fontSize: typToken.sizeRem * 14,
        color: resolveColor(designSystem, typToken.colorTokenKey),
        lineHeight: typToken.lineHeight,
      }
    : { fontFamily: 'Helvetica', fontSize: 10, color: '#000000', lineHeight: 1.4 }

  // Locked gradient-backgrounds use constraints.gradientId directly
  if (slot.type === 'gradient-background') {
    const gradientId = slot.locked
      ? slot.constraints.gradientId
      : content?.type === 'gradient-background'
        ? content.gradientId
        : undefined
    const grad = gradientId ? gradients.find((g) => g.id === gradientId) : undefined
    const bgColor = grad
      ? resolveColor(designSystem, grad.stops[0].colorTokenKey)
      : '#EEEEEE'
    return <View style={[base, { backgroundColor: bgColor }]} />
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
        <View style={base}>
          <Text style={textStyle}>{content.text}</Text>
        </View>
      )

    case 'body-text':
      return (
        <View style={base}>
          <Text style={[textStyle, { flexWrap: 'wrap' }]}>{content.text}</Text>
        </View>
      )

    case 'bullet-list':
      return (
        <View style={base}>
          {content.items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={[textStyle, { marginRight: 4 }]}>•</Text>
              <Text style={[textStyle, { flex: 1 }]}>{item}</Text>
            </View>
          ))}
        </View>
      )

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
          {content.name && <Text style={[textStyle, { fontFamily: pdfFont(typToken?.fontFamily ?? 'Inter', 700) }]}>{content.name}</Text>}
          {content.title && <Text style={textStyle}>{content.title}</Text>}
          {content.email && <Text style={textStyle}>{content.email}</Text>}
          {content.phone && <Text style={textStyle}>{content.phone}</Text>}
        </View>
      )

    case 'image':
      return content.storageUrl ? (
        <View style={base}>
          <PDFImage
            src={content.storageUrl}
            style={{ width: '100%', height: '100%', objectFit: content.objectFit === 'contain' ? 'contain' : 'cover' }}
          />
        </View>
      ) : (
        <View style={[base, { backgroundColor: '#D1DCE8' }]} />
      )

    default:
      return <View style={base} />
  }
}

const styles = StyleSheet.create({
  page: {
    position: 'relative',
  },
})
