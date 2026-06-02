import { useState, useCallback } from 'react'
import { exportToPDF, downloadBlob } from '../lib/pdfExport'
import type { TemplateDefinition } from '../types/template.types'
import type { ContentMap } from '../types/content.types'
import type { DesignSystem } from '../types/designSystem.types'
import type { GradientDefinition } from '../types/gradient.types'

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportDoc = useCallback(
    async (
      template: TemplateDefinition,
      contentMap: ContentMap,
      designSystem: DesignSystem,
      gradients: GradientDefinition[],
      title: string,
    ) => {
      setIsExporting(true)
      setError(null)
      try {
        const blob = await exportToPDF(template, contentMap, designSystem, gradients, title)
        const filename = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`
        downloadBlob(blob, filename)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('PDF export failed:', err)
        setError(msg)
      } finally {
        setIsExporting(false)
      }
    },
    [],
  )

  return { exportDoc, isExporting, error }
}
