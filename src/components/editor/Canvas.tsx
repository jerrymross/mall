import { useRef, useEffect, useState } from 'react'
import type { TemplateDefinition } from '../../types/template.types'
import type { ContentMap } from '../../types/content.types'
import type { DesignSystem } from '../../types/designSystem.types'
import type { GradientDefinition } from '../../types/gradient.types'
import { SlotRenderer } from './SlotRenderer'
import { buildGradientCSS } from '../../lib/gradientBuilder'
import { resolveColor } from '../../lib/tokenResolver'

const A4_MM = { portrait: { w: 210, h: 297 }, landscape: { w: 297, h: 210 } }
const MM_TO_PX = 3.7795

interface Props {
  template: TemplateDefinition
  contentMap: ContentMap
  designSystem: DesignSystem
  gradients: GradientDefinition[]
  selectedSlotId: string | null
  onSelectSlot: (slotId: string) => void
  onUpdateContent?: (slotId: string, text: string) => void
  pageIndex?: number
}

export function Canvas({
  template,
  contentMap,
  designSystem,
  gradients,
  selectedSlotId,
  onSelectSlot,
  onUpdateContent,
  pageIndex = 0,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const page = template.pages[pageIndex]
  if (!page) return null

  const orientation = page.orientation
  const mmDims = A4_MM[orientation]
  const naturalW = mmDims.w * MM_TO_PX
  const naturalH = mmDims.h * MM_TO_PX

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const containerW = entry.contentRect.width
      setScale(containerW / naturalW)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [naturalW])

  const bgGradient = page.backgroundGradientId
    ? gradients.find((g) => g.id === page.backgroundGradientId)
    : undefined
  const bgColor = page.backgroundColorTokenKey
    ? resolveColor(designSystem, page.backgroundColorTokenKey)
    : undefined

  const background = bgGradient
    ? buildGradientCSS(bgGradient, designSystem)
    : bgColor ?? '#ffffff'

  return (
    <div ref={containerRef} className="w-full">
      <div
        onClick={(e) => {
          // Stop all clicks from reaching the <main> deselect handler.
          // If the click landed directly on the canvas background (not a slot),
          // deselect — slots stop propagation themselves via handleClick.
          e.stopPropagation()
          if (e.target === e.currentTarget) onSelectSlot('')
        }}
        style={{
          width: naturalW,
          height: naturalH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          background,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 40px rgba(0,0,0,0.18)',
        }}
      >
        {page.slots
          .filter((slot) => slot.visible)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((slot) => (
            <SlotRenderer
              key={slot.id}
              slot={slot}
              content={contentMap[slot.id]}
              designSystem={designSystem}
              gradients={gradients}
              isSelected={selectedSlotId === slot.id}
              onClick={() => onSelectSlot(slot.id)}
              onUpdateContent={onUpdateContent ? (text) => onUpdateContent(slot.id, text) : undefined}
              mmToPx={MM_TO_PX}
            />
          ))}
      </div>
      <div style={{ height: naturalH * scale }} />
    </div>
  )
}
