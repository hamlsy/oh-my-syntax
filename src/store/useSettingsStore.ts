import { create } from 'zustand';
import type { SettingsState } from '@/types/store';

export const useSettingsStore = create<SettingsState>((set) => ({
  showFloating: true,
  showEasterEgg: false,
  setShowFloating: (show: boolean) => set({ showFloating: show }),
  setShowEasterEgg: (show: boolean) => set({ showEasterEgg: show }),
}));
