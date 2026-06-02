import { create } from 'zustand'
import type { DesignSystem } from '../types/designSystem.types'
import { DEFAULT_DESIGN_SYSTEM } from '../config/designTokens'

interface DesignSystemStore {
  activeDesignSystem: DesignSystem
  setDesignSystem: (ds: DesignSystem) => void
}

export const useDesignSystemStore = create<DesignSystemStore>((set) => ({
  activeDesignSystem: DEFAULT_DESIGN_SYSTEM,
  setDesignSystem: (ds) => set({ activeDesignSystem: ds }),
}))
