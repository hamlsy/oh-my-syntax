import { buildFuseIndex, FUSE_OPTIONS } from '../searchUtils';
import type { Command } from '@/types/command';

const mockCommands: Command[] = [
  {
    id: 'linux-kill-port',
    title: 'Kill process on port',
    description: 'Find and kill a process using a specific port',
    command: 'lsof -ti:8080 | xargs kill -9',
    category: 'linux',
    tags: ['port', 'kill', 'process'],
    aliases: ['kill port 8080', '포트 죽이기', 'port in use'],
    popularity: 95,
  },
  {
    id: 'git-status',
    title: 'Git status',
    description: 'Show working tree status',
    command: 'git status',
    category: 'git',
    tags: ['git', 'status'],
    aliases: ['git status', 'show changes'],
    popularity: 90,
  },
];

describe('buildFuseIndex', () => {
  it('returns a Fuse instance', () => {
    const fuse = buildFuseIndex(mockCommands);
    expect(fuse).toBeDefined();
    expect(typeof fuse.search).toBe('function');
  });

  it('finds commands by alias', () => {
    const fuse = buildFuseIndex(mockCommands);
    const results = fuse.search('kill port');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.id).toBe('linux-kill-port');
  });

  it('finds commands by title', () => {
    const fuse = buildFuseIndex(mockCommands);
    const results = fuse.search('git status');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.id).toBe('git-status');
  });

  it('includes score in results', () => {
    const fuse = buildFuseIndex(mockCommands);
    const results = fuse.search('port');
    expect(results[0]).toHaveProperty('score');
  });

  it('returns empty array for non-matching query', () => {
    const fuse = buildFuseIndex(mockCommands);
    const results = fuse.search('xyznonexistentquery123');
    expect(results).toHaveLength(0);
  });

  it('each call creates a new Fuse instance', () => {
    const fuse1 = buildFuseIndex(mockCommands);
    const fuse2 = buildFuseIndex(mockCommands);
    expect(fuse1).not.toBe(fuse2);
  });
});

describe('FUSE_OPTIONS', () => {
  it('has correct key weights summing to 1.0', () => {
    const totalWeight = FUSE_OPTIONS.keys!.reduce((sum, key) => {
      return sum + (typeof key === 'object' && 'weight' in key ? (key.weight ?? 0) : 0);
    }, 0);
    expect(totalWeight).toBeCloseTo(1.0);
  });

  it('includes score in output', () => {
    expect(FUSE_OPTIONS.includeScore).toBe(true);
  });

  it('uses ignoreLocation for full-text search', () => {
    expect(FUSE_OPTIONS.ignoreLocation).toBe(true);
  });
});
