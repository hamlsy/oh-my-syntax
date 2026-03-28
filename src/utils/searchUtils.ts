import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Command } from '@/types/command';

export const FUSE_OPTIONS: IFuseOptions<Command> = {
  keys: [
    { name: 'aliases', weight: 0.45 },
    { name: 'title',   weight: 0.30 },
    { name: 'command', weight: 0.15 },
    { name: 'tags',    weight: 0.10 },
  ],
  threshold: 0.4,
  minMatchCharLength: 1,
  includeScore: true,
  ignoreLocation: true,
  useExtendedSearch: false,
};

export function buildFuseIndex(commands: Command[]): Fuse<Command> {
  return new Fuse(commands, FUSE_OPTIONS);
}
