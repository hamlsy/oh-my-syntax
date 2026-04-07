import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Command } from '@/types/command';

export const FUSE_OPTIONS: IFuseOptions<Command> = {
  keys: [
    { name: 'aliases',     weight: 0.45 },
    { name: 'title',       weight: 0.28 },
    { name: 'command',     weight: 0.14 },
    { name: 'tags',        weight: 0.08 },
    { name: 'description', weight: 0.05 },
  ],
  threshold: 0.45,
  minMatchCharLength: 1,
  includeScore: true,
  ignoreLocation: true,
  useExtendedSearch: false,
};

export function buildFuseIndex(commands: Command[]): Fuse<Command> {
  return new Fuse(commands, FUSE_OPTIONS);
}
