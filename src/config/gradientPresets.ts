import type { GradientDefinition } from '../types/gradient.types'

export const GRADIENT_PRESETS: GradientDefinition[] = [
  {
    id: 'grad-brand-diagonal',
    name: 'Varumärke Diagonal',
    type: 'linear',
    angle: 135,
    isPreset: true,
    stops: [
      { colorTokenKey: 'brand-primary', position: 0, opacity: 1 },
      { colorTokenKey: 'brand-secondary', position: 100, opacity: 1 },
    ],
  },
  {
    id: 'grad-brand-vertical',
    name: 'Varumärke Vertikal',
    type: 'linear',
    angle: 180,
    isPreset: true,
    stops: [
      { colorTokenKey: 'brand-secondary', position: 0, opacity: 1 },
      { colorTokenKey: 'brand-primary', position: 100, opacity: 1 },
    ],
  },
  {
    id: 'grad-accent-hero',
    name: 'Accenthero',
    type: 'linear',
    angle: 120,
    isPreset: true,
    stops: [
      { colorTokenKey: 'brand-primary', position: 0, opacity: 1 },
      { colorTokenKey: 'brand-accent', position: 100, opacity: 1 },
    ],
  },
  {
    id: 'grad-dark-radial',
    name: 'Mörk Radial',
    type: 'radial',
    shape: 'ellipse',
    isPreset: true,
    stops: [
      { colorTokenKey: 'brand-primary', position: 0, opacity: 1 },
      { colorTokenKey: 'surface-dark', position: 100, opacity: 1 },
    ],
  },
  {
    id: 'grad-navy-solid',
    name: 'Marinblå Solid',
    type: 'linear',
    angle: 90,
    isPreset: true,
    stops: [
      { colorTokenKey: 'brand-secondary', position: 0, opacity: 1 },
      { colorTokenKey: 'brand-secondary', position: 100, opacity: 1 },
    ],
  },
  {
    id: 'grad-white-solid',
    name: 'Vit Solid',
    type: 'linear',
    angle: 90,
    isPreset: true,
    stops: [
      { colorTokenKey: 'neutral-100', position: 0, opacity: 1 },
      { colorTokenKey: 'neutral-100', position: 100, opacity: 1 },
    ],
  },
  {
    id: 'grad-light-subtle',
    name: 'Ljus Subtil',
    type: 'linear',
    angle: 160,
    isPreset: true,
    stops: [
      { colorTokenKey: 'surface-light', position: 0, opacity: 1 },
      { colorTokenKey: 'neutral-200', position: 100, opacity: 1 },
    ],
  },
]
