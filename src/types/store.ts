import type { CategoryId } from './command';

export interface RecentCommand {
  commandId: string;
  command:   string;
  title:     string;
  category:  Exclude<CategoryId, 'all'>;
  copiedAt:  number;
}

export interface RecentCommandsState {
  recentCommands:      RecentCommand[];
  addRecentCommand:    (entry: Omit<RecentCommand, 'copiedAt'>) => void;
  removeRecentCommand: (commandId: string) => void;
  clearRecentCommands: () => void;
}

export interface SearchState {
  query: string;
  selectedCategory: CategoryId;
  highlightedIndex: number;
  setQuery: (query: string) => void;
  setSelectedCategory: (category: CategoryId) => void;
  setHighlightedIndex: (index: number) => void;
  resetSearch: () => void;
}

export interface UIState {
  language: 'en' | 'ko';
  setLanguage: (lang: 'en' | 'ko') => void;
}

export interface SettingsState {
  showFloating: boolean;
  showEasterEgg: boolean;
  setShowFloating: (show: boolean) => void;
  setShowEasterEgg: (show: boolean) => void;
}
