import { pdf } from '@react-pdf/renderer'
import { createElement } from 'react'
import type { TemplateDefinition } from '../types/template.types'
import type { ContentMap } from '../types/content.types'
import type { DesignSystem } from '../types/designSystem.types'
import type { GradientDefinition } from '../types/gradient.types'
import { PDFDocument } from './PDFDocument'

export async function exportToPDF(
  template: TemplateDefinition,
  contentMap: ContentMap,
  designSystem: DesignSystem,
  gradients: GradientDefinition[],
  title: string,
): Promise<Blob> {
  const element = createElement(PDFDocument, {
    template,
    contentMap,
    designSystem,
    gradients,
    title,
  })
  const instance = pdf(element)
  const blob = await instance.toBlob()
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
