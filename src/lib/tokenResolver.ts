import type { CSSProperties } from 'react'
import type { DesignSystem, ColorTokenKey, TypographyToken } from '../types/designSystem.types'

export function resolveColor(ds: DesignSystem, key: ColorTokenKey): string {
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
