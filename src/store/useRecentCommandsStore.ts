import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MAX_RECENT_COMMANDS } from '@/constants/config';
import type { RecentCommandsState } from '@/types/store';

export const useRecentCommandsStore = create<RecentCommandsState>()(
  persist(
    (set) => ({
      recentCommands: [],

      addRecentCommand: (entry) =>
        set((state) => ({
          recentCommands: [
            { ...entry, copiedAt: Date.now() },
            ...state.recentCommands.filter((r) => r.commandId !== entry.commandId),
          ].slice(0, MAX_RECENT_COMMANDS),
        })),

      removeRecentCommand: (commandId) =>
        set((state) => ({
          recentCommands: state.recentCommands.filter((r) => r.commandId !== commandId),
        })),

      clearRecentCommands: () => set({ recentCommands: [] }),
    }),
    {
      name: 'oms-recent-commands',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
