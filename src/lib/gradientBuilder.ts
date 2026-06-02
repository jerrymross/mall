import type { GradientDefinition } from '../types/gradient.types'
import type { DesignSystem } from '../types/designSystem.types'
import { resolveColor } from './tokenResolver'

export function buildGradientCSS(gradient: GradientDefinition, ds: DesignSystem): string {
  const stops = gradient.stops
    .map((stop) => {
      const hex = resolveColor(ds, stop.colorTokenKey)
      const alpha = stop.opacity < 1 ? hexToRgba(hex, stop.opacity) : hex
      return `${alpha} ${stop.position}%`
    })
    .join(', ')

  if (gradient.type === 'linear') {
    const angle = gradient.angle ?? 135
    return `linear-gradient(${angle}deg, ${stops})`
  } else {
    const shape = gradient.shape ?? 'ellipse'
    return `radial-gradient(${shape} at center, ${stops})`
  }
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
