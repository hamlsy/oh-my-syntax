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
  | 'javascript'
  | 'npm'
  | 'sql'
  | 'vim';

export interface CommandVariable {
  name: string;
  defaultValue: string;
  description: string;
}

export type DangerLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Command {
  id: string;
  category: Exclude<CategoryId, 'all'>;
  command: string;
  title: string;
  description: string;
  aliases: string[];
  tags: string[];
  isDangerous?: boolean;  // legacy boolean — prefer dangerLevel for new data
  dangerLevel?: DangerLevel;
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
