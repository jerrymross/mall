import { useRef, useState, useCallback } from 'react'
import type { TemplateSlot } from '../../types/template.types'
import type { DesignSystem } from '../../types/designSystem.types'
import type { GradientDefinition } from '../../types/gradient.types'
import { SlotRenderer } from '../editor/SlotRenderer'

const A4_W_MM = 210
const A4_H_MM = 297
const MM_TO_PX = 3.7795

const HANDLES = ['n','ne','e','se','s','sw','w','nw'] as const
type Handle = typeof HANDLES[number]

interface Props {
  slots: TemplateSlot[]
  selectedSlotId: string | null
  designSystem: DesignSystem
  gradients: GradientDefinition[]
  onSelectSlot: (id: string) => void
  onUpdateSlot: (id: string, pos: Partial<TemplateSlot['position']>) => void
}

export function BuilderCanvas({ slots, selectedSlotId, designSystem, gradients, onSelectSlot, onUpdateSlot }: Props) {
  const [scale, setScale] = useState(1)
  const scaleRef = useRef(1)

  const naturalW = A4_W_MM * MM_TO_PX
  const naturalH = A4_H_MM * MM_TO_PX

  const measureContainer = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const s = entry.contentRect.width / naturalW
      setScale(s)
      scaleRef.current = s
    })
    obs.observe(el)
  }, [naturalW])

  function pxToMm(px: number) { return px / MM_TO_PX }

  function onMouseDownSlot(e: React.MouseEvent, slot: TemplateSlot) {
    e.stopPropagation()
    onSelectSlot(slot.id)
    const startX = slot.position.x
    const startY = slot.position.y
    const startMX = e.clientX
    const startMY = e.clientY

    const onMove = (ev: MouseEvent) => {
      const dx = pxToMm((ev.clientX - startMX) / scaleRef.current)
      const dy = pxToMm((ev.clientY - startMY) / scaleRef.current)
      onUpdateSlot(slot.id, {
        x: Math.max(0, Math.min(A4_W_MM - slot.position.width, startX + dx)),
        y: Math.max(0, Math.min(A4_H_MM - slot.position.height, startY + dy)),
      })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function onMouseDownHandle(e: React.MouseEvent, slot: TemplateSlot, handle: Handle) {
    e.stopPropagation()
    e.preventDefault()
    const startSlot = { ...slot.position }
    const startMX = e.clientX
    const startMY = e.clientY

    const onMove = (ev: MouseEvent) => {
      const dx = pxToMm((ev.clientX - startMX) / scaleRef.current)
      const dy = pxToMm((ev.clientY - startMY) / scaleRef.current)
      let { x, y, width, height } = startSlot

      if (handle.includes('e')) width = Math.max(10, width + dx)
      if (handle.includes('s')) height = Math.max(5, height + dy)
      if (handle.includes('w')) { x = Math.min(x + width - 10, x + dx); width = Math.max(10, width - dx) }
      if (handle.includes('n')) { y = Math.min(y + height - 5, y + dy); height = Math.max(5, height - dy) }

      onUpdateSlot(slot.id, { x, y, width, height })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handlePositions: Record<Handle, React.CSSProperties> = {
    n:  { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
    ne: { top: -4, right: -4, cursor: 'ne-resize' },
    e:  { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'e-resize' },
    se: { bottom: -4, right: -4, cursor: 'se-resize' },
    s:  { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
    sw: { bottom: -4, left: -4, cursor: 'sw-resize' },
    w:  { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'w-resize' },
    nw: { top: -4, left: -4, cursor: 'nw-resize' },
  }

  return (
    <div ref={measureContainer} className="w-full">
      <div
        style={{
          width: naturalW,
          height: naturalH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          background: '#fff',
          position: 'relative',
          boxShadow: '0 4px 40px rgba(0,0,0,0.18)',
          userSelect: 'none',
        }}
        onClick={() => onSelectSlot('')}
      >
        {/* Grid */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.06, zIndex: 1000 }} width={naturalW} height={naturalH}>
          {Array.from({ length: Math.floor(A4_W_MM / 10) }, (_, i) => (
            <line key={`v${i}`} x1={(i+1)*10*MM_TO_PX} y1={0} x2={(i+1)*10*MM_TO_PX} y2={naturalH} stroke="#000" strokeWidth={1} />
          ))}
          {Array.from({ length: Math.floor(A4_H_MM / 10) }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={(i+1)*10*MM_TO_PX} x2={naturalW} y2={(i+1)*10*MM_TO_PX} stroke="#000" strokeWidth={1} />
          ))}
        </svg>

        {slots
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((slot) => {
            const isSelected = selectedSlotId === slot.id
            const pos = slot.position

            return (
              <div key={slot.id} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: slot.zIndex, pointerEvents: 'none' }}>
                {/* Live preview via SlotRenderer */}
                <SlotRenderer
                  slot={slot}
                  content={slot.defaultContent}
                  designSystem={designSystem}
                  gradients={gradients}
                  isSelected={false}
                  onClick={() => {}}
                  mmToPx={MM_TO_PX}
                />

                {/* Transparent drag/resize overlay */}
                <div
                  onMouseDown={(e) => onMouseDownSlot(e, slot)}
                  style={{
                    position: 'absolute',
                    left: pos.x * MM_TO_PX,
                    top: pos.y * MM_TO_PX,
                    width: pos.width * MM_TO_PX,
                    height: pos.height * MM_TO_PX,
                    cursor: 'move',
                    pointerEvents: 'all',
                    outline: isSelected ? '2px solid #3b82f6' : '1.5px dashed rgba(100,116,139,0.35)',
                    outlineOffset: '-1px',
                    zIndex: 50,
                    borderRadius: slot.constraints.borderRadius ? slot.constraints.borderRadius * MM_TO_PX : undefined,
                  }}
                >
                  {isSelected && HANDLES.map((h) => (
                    <div
                      key={h}
                      onMouseDown={(e) => onMouseDownHandle(e, slot, h)}
                      style={{
                        position: 'absolute',
                        width: 8,
                        height: 8,
                        background: '#3b82f6',
                        border: '1.5px solid #fff',
                        borderRadius: 2,
                        zIndex: 100,
                        pointerEvents: 'all',
                        ...handlePositions[h],
                      }}
                    />
                  ))}

                  {/* Label tag on selection */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: -20,
                      left: 0,
                      background: '#3b82f6',
                      color: '#fff',
                      fontSize: 10,
                      fontFamily: 'system-ui',
                      padding: '1px 6px',
                      borderRadius: '3px 3px 0 0',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                    }}>
                      {slot.label}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
      </div>
      <div style={{ height: naturalH * scale }} />
    </div>
  )
}
