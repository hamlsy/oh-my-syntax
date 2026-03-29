import { create } from 'zustand';
import type { SettingsState } from '@/types/store';

export const useSettingsStore = create<SettingsState>((set) => ({
  showFloating:          true,
  selectedContributorId: null,
  showContributors:      false,
  setShowFloating:          (show) => set({ showFloating: show }),
  setSelectedContributorId: (id)   => set({ selectedContributorId: id }),
  setShowContributors:      (show) => set({ showContributors: show }),
}));
