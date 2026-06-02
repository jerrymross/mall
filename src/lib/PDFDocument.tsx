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
  const style = {
    position: 'absolute' as const,
    left: pos.x * MM_TO_PT,
    top: pos.y * MM_TO_PT,
    width: pos.width * MM_TO_PT,
    height: pos.height * MM_TO_PT,
    overflow: 'hidden' as const,
  }

  if (!content) {
    return <View style={style} />
  }

  const typToken = slot.constraints.typographyTokenKey
    ? resolveTypography(designSystem, slot.constraints.typographyTokenKey)
    : undefined

  const textStyle = typToken
    ? {
        fontFamily: typToken.fontFamily,
        fontSize: typToken.sizeRem * 14,
        color: resolveColor(designSystem, typToken.colorTokenKey),
        lineHeight: typToken.lineHeight,
      }
    : {}

  switch (content.type) {
    case 'heading':
    case 'subheading':
      return (
        <View style={style}>
          <Text style={[styles.text, textStyle]}>{content.text}</Text>
        </View>
      )
    case 'body-text':
      return (
        <View style={style}>
          <Text style={[styles.text, textStyle, styles.bodyText]}>{content.text}</Text>
        </View>
      )
    case 'bullet-list':
      return (
        <View style={style}>
          {content.items.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={[styles.bullet, textStyle]}>•</Text>
              <Text style={[styles.text, textStyle, styles.bulletText]}>{item}</Text>
            </View>
          ))}
        </View>
      )
    case 'cta': {
      const ctaColor = slot.constraints.colorTokenKey
        ? resolveColor(designSystem, slot.constraints.colorTokenKey)
        : '#0057A8'
      return (
        <View style={[style, styles.ctaView, { backgroundColor: ctaColor }]}>
          <Text style={[styles.text, textStyle, styles.ctaText]}>{content.label}</Text>
        </View>
      )
    }
    case 'contact':
      return (
        <View style={style}>
          {content.name && <Text style={[styles.text, textStyle, styles.bold]}>{content.name}</Text>}
          {content.title && <Text style={[styles.text, textStyle]}>{content.title}</Text>}
          {content.email && <Text style={[styles.text, textStyle]}>{content.email}</Text>}
          {content.phone && <Text style={[styles.text, textStyle]}>{content.phone}</Text>}
        </View>
      )
    case 'image':
      return content.storageUrl ? (
        <View style={style}>
          <PDFImage src={content.storageUrl} style={styles.image} />
        </View>
      ) : (
        <View style={[style, styles.imagePlaceholder]} />
      )
    case 'gradient-background': {
      const grad = gradients.find((g) => g.id === content.gradientId)
      const bgColor = grad
        ? resolveColor(designSystem, grad.stops[0].colorTokenKey)
        : '#0057A8'
      return <View style={[style, { backgroundColor: bgColor }]} />
    }
    case 'logo':
      return <View style={style} />
    default:
      return <View style={style} />
  }
}

const styles = StyleSheet.create({
  page: {
    position: 'relative',
  },
  text: {
    fontFamily: 'Helvetica',
  },
  bodyText: {
    flexWrap: 'wrap',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  bullet: {
    marginRight: 4,
    fontSize: 8,
  },
  bulletText: {
    flex: 1,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  ctaView: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: '#D1DCE8',
  },
})
