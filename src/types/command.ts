export type CategoryId =
  | 'all'
  | 'linux'
  | 'macos'
  | 'windows'
  | 'docker'
  | 'kubernetes'
  | 'git'
  | 'java'
  | 'python'
  | 'javascript';

export interface CommandVariable {
  name: string;
  defaultValue: string;
  description: string;
}

export interface Command {
  id: string;
  category: CategoryId;
  command: string;
  title: string;
  description: string;
  aliases: string[];
  tags: string[];
  isDangerous?: boolean;
  platform?: 'linux' | 'macos' | 'windows' | 'all';
  popularity?: number;
  variables?: CommandVariable[];
}

export interface Category {
  id: CategoryId;
  labelKey: string;
  icon: string;
  color: string;
}

export interface SearchResult {
  command: Command;
  score: number;
}
