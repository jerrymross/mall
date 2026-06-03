import type { CSSProperties } from 'react'
import type { DesignSystem, ColorTokenKey, TypographyToken } from '../types/designSystem.types'
import type { ImageOverlay } from '../types/content.types'

export function resolveColor(ds: DesignSystem, key: ColorTokenKey | string): string {
  const token = ds.colors.find((c) => c.key === key)
  return token?.hex ?? '#000000'
}

export function resolveTypography(ds: DesignSystem, key: string): TypographyToken | undefined {
  return ds.typography.find((t) => t.key === key)
}

export function typographyToCSS(token: TypographyToken, ds: DesignSystem): CSSProperties {
  return {
    fontFamily: token.fontFamily,
    fontWeight: token.fontWeight,
    fontSize: `${token.sizeRem}rem`,
    lineHeight: token.lineHeight,
    letterSpacing: token.letterSpacing,
    color: resolveColor(ds, token.colorTokenKey),
    textTransform: token.textTransform ?? 'none',
  }
}

export function buildOverlayCSS(overlay: ImageOverlay, ds: DesignSystem): string {
  const stops = overlay.stops
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((s) => {
      const hex = resolveColor(ds, s.colorTokenKey)
      const alpha = Math.round(s.opacity * 255).toString(16).padStart(2, '0')
      return `${hex}${alpha} ${s.position}%`
    })
    .join(', ')

  if (overlay.type === 'radial') {
    return `radial-gradient(ellipse at center, ${stops})`
  }
  return `linear-gradient(${overlay.angle}deg, ${stops})`
}
