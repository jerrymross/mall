import { createElement } from 'react'
import type { TemplateDefinition } from '../types/template.types'
import type { ContentMap } from '../types/content.types'
import type { DesignSystem } from '../types/designSystem.types'
import type { GradientDefinition } from '../types/gradient.types'

export async function exportToPDF(
  template: TemplateDefinition,
  contentMap: ContentMap,
  designSystem: DesignSystem,
  gradients: GradientDefinition[],
  title: string,
): Promise<Blob> {
  // Lazy-load the heavy PDF renderer only when actually exporting
  const [{ pdf }, { PDFDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./PDFDocument'),
  ])
  const element = createElement(PDFDocument, { template, contentMap, designSystem, gradients, title })
  const blob = await pdf(element).toBlob()
  return blob
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
