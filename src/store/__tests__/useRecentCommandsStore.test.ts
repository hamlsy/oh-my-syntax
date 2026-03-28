import { act, renderHook } from '@testing-library/react';
import { useRecentCommandsStore } from '../useRecentCommandsStore';
import type { RecentCommand } from '@/types/store';

const mockEntry = (n: number): Omit<RecentCommand, 'copiedAt'> => ({
  commandId: `cmd-${n}`,
  command:   `git command ${n}`,
  title:     `Command ${n}`,
  category:  'git',
});

beforeEach(() => {
  useRecentCommandsStore.setState({ recentCommands: [] });
});

describe('useRecentCommandsStore', () => {
  it('새 항목이 배열 맨 앞에 삽입된다', () => {
    const { result } = renderHook(() => useRecentCommandsStore());

    act(() => { result.current.addRecentCommand(mockEntry(1)); });
    act(() => { result.current.addRecentCommand(mockEntry(2)); });

    expect(result.current.recentCommands[0].commandId).toBe('cmd-2');
    expect(result.current.recentCommands[1].commandId).toBe('cmd-1');
  });

  it('중복 commandId는 기존 항목을 제거하고 맨 앞에 삽입한다', () => {
    const { result } = renderHook(() => useRecentCommandsStore());

    act(() => { result.current.addRecentCommand(mockEntry(1)); });
    act(() => { result.current.addRecentCommand(mockEntry(2)); });
    act(() => { result.current.addRecentCommand(mockEntry(1)); }); // duplicate

    expect(result.current.recentCommands).toHaveLength(2);
    expect(result.current.recentCommands[0].commandId).toBe('cmd-1');
    expect(result.current.recentCommands[1].commandId).toBe('cmd-2');
  });

  it('11번째 항목 추가 시 배열이 10개로 trim된다', () => {
    const { result } = renderHook(() => useRecentCommandsStore());

    for (let i = 1; i <= 11; i++) {
      act(() => { result.current.addRecentCommand(mockEntry(i)); });
    }

    expect(result.current.recentCommands).toHaveLength(10);
    // oldest item (cmd-1) should have been dropped
    expect(result.current.recentCommands.some((r) => r.commandId === 'cmd-1')).toBe(false);
  });

  it('removeRecentCommand는 해당 항목만 제거한다', () => {
    const { result } = renderHook(() => useRecentCommandsStore());

    act(() => { result.current.addRecentCommand(mockEntry(1)); });
    act(() => { result.current.addRecentCommand(mockEntry(2)); });
    act(() => { result.current.removeRecentCommand('cmd-1'); });

    expect(result.current.recentCommands).toHaveLength(1);
    expect(result.current.recentCommands[0].commandId).toBe('cmd-2');
  });

  it('clearRecentCommands는 배열을 비운다', () => {
    const { result } = renderHook(() => useRecentCommandsStore());

    act(() => { result.current.addRecentCommand(mockEntry(1)); });
    act(() => { result.current.addRecentCommand(mockEntry(2)); });
    act(() => { result.current.clearRecentCommands(); });

    expect(result.current.recentCommands).toHaveLength(0);
  });

  it('addRecentCommand는 copiedAt을 현재 시각으로 설정한다', () => {
    const before = Date.now();
    const { result } = renderHook(() => useRecentCommandsStore());

    act(() => { result.current.addRecentCommand(mockEntry(1)); });

    const after = Date.now();
    const { copiedAt } = result.current.recentCommands[0];
    expect(copiedAt).toBeGreaterThanOrEqual(before);
    expect(copiedAt).toBeLessThanOrEqual(after);
  });
});
