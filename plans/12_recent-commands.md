# Plan 12 — Recently Copied Commands (구현 확정본)
> 3차 검토에서 발견된 Critical 3개·Major 2개·Minor 4개 이슈 전부 반영.
> 이 문서의 코드가 구현 기준이다.

---

## 0. 목적

**단일 목적:** 페이지를 열자마자 이전 복사 명령어를 클릭 한 번으로 다시 클립보드에 넣는다.

---

## 1. 확정 설계 결정

| 항목 | 결정 |
|------|------|
| 레이아웃 | 수직 compact 행 `h-11` (44px — 터치 기준 충족) |
| 배경 | 투명 + `hover:bg-bg-surface` |
| 좌측 컬러 바 | `border-l-2` + inline `borderLeftColor` (항상 표시, hover 변화 없음) |
| 복사 인터랙션 | 행 전체 클릭 = 복사 (800ms 피드백) |
| show/hide | `RecentCommandsSection` 자체 `AnimatePresence` 관리 |
| layout 범위 | **`motion.div layout` 사용 안 함** (C-1 수정) |
| HeroSection compact | 내부에서 `recentCommands.length > 0` 구독 + `layout="position"` |
| stagger | variants 방식 폐기 → `index * 0.04s` delay 직접 전달 (C-3 수정) |
| 재복사 시 재정렬 | recent 목록에서 재복사 시 순서 변경 없음 |

---

## 2. 검토 발견 이슈 → 최종 수정 내역

### [C-1] motion.div layout 제거
`layout` prop이 `ResultList` 높이 변화(매 키입력)마다 발동 → 검색 중 화면 출렁임.

**수정:** App.tsx에서 `motion.div layout` 완전 제거.
`RecentCommandsSection`의 내부 `AnimatePresence`만으로 hide/show 처리.
`SearchContainer`는 애니메이션 없이 즉시 위치 이동(허용 범위).

### [C-2] × 버튼 Enter 키 버블링 버그
× 버튼 focus + Enter → 부모 `onKeyDown`까지 버블링 → 삭제 + 복사 동시 발동.

**수정:** × 버튼에 `onKeyDown={(e) => e.stopPropagation()}` 추가.

### [C-3] staggerChildren 미작동
`RecentCommandRow`가 `variants` 미사용 → `staggerChildren` 전파 안 됨. 전부 동시 입장.
`listVariants`에 `hidden` 미정의 → `initial="hidden"` undefined.

**수정:** variants 방식 폐기. `index` prop 추가 → `delay: index * 0.04` 직접 적용.

### [M-1] CopyButton clipboard 에러 처리
`useCopyToClipboard.copy()`가 throw 시 `addRecentCommand` 호출 여부 불명확.

**수정:** `CopyButton.handleCopy`에 try/catch 추가. catch 시 `addRecentCommand` 미호출.

### [M-2] h-10 (40px) — 터치 타깃 44px 미달
**수정:** `h-11` (44px)로 교체.

### [Mi-1] animate 내 transition inline
**수정:** `transition` prop 분리 (`animate` 객체 밖으로).

### [Mi-2] Badge opacity-40 — 가시성 부족
**수정:** `opacity-60` / `group-hover:opacity-90` 으로 조정.

### [Mi-3] HeroSection compact 전환 시 즉각 height 변화
**수정:** `motion.div`에 `layout="position"` 추가.

### [Mi-4] Tooltip whitespace-nowrap 한계
향후 `Tooltip`에 `wrap` prop 추가로 개선 가능 — 현재 scope 외. 주석 명기.

---

## 3. 새 상수 — `src/constants/config.ts`

```ts
export const MAX_RECENT_COMMANDS   = 10;
export const RECENT_COPY_REVERT_MS = 800;
```

---

## 4. 타입 — `src/types/store.ts` 추가

```ts
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
```

---

## 5. `src/data/categories.ts` 추가

```ts
export const CATEGORY_COLOR_MAP: Record<Exclude<CategoryId, 'all'>, string> =
  Object.fromEntries(
    CATEGORIES
      .filter((c) => c.id !== 'all')
      .map((c) => [c.id, c.color])
  ) as Record<Exclude<CategoryId, 'all'>, string>;
```

---

## 6. `src/store/useRecentCommandsStore.ts` (신규)

```ts
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
```

---

## 7. 기존 파일 수정

### CopyButton.tsx — props 추가 + try/catch (M-1 수정)
```ts
interface CopyButtonProps {
  command: string; commandId: string;
  title: string; category: Exclude<CategoryId, 'all'>;
}

const handleCopy = async () => {
  try {
    await copy(command);
    track(commandId);
    addRecentCommand({ commandId, command, title, category });
  } catch { /* 클립보드 실패 — silent */ }
};
```

### ResultCard.tsx — title, category 전달
```tsx
<CopyButton command={command.command} commandId={command.id}
  title={command.title} category={command.category} />
```

### useKeyboardNav.ts — onCopy 시그니처
```ts
onCopy: (result: SearchResult) => void
// case Enter: onCopy(results[highlightedIndex] ?? results[0])
```

### SearchContainer.tsx — handleCopy 확장
```ts
const handleCopy = useCallback((result: SearchResult) => {
  void copy(result.command.command);
  addRecentCommand({ commandId: result.command.id, command: result.command.command,
    title: result.command.title, category: result.command.category });
}, [copy, addRecentCommand]);
```

### HeroSection.tsx — compact + layout="position" (Mi-3 수정)
```tsx
const compact = useRecentCommandsStore(s => s.recentCommands.length > 0);
<motion.div layout="position" transition={SPRING.smooth}
  className={cn('text-center px-4', compact ? 'pt-16 pb-6' : 'py-16')} ...>
```

### i18n
```json
"recent": { "title": "Recently copied", "clear": "Clear", "copied": "Copied!" }
"recent": { "title": "최근 복사", "clear": "전체 삭제", "copied": "복사됨!" }
```

### App.tsx — motion.div layout 없음 (C-1 수정)
```tsx
<main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6">
  <HeroSection />
  <RecentCommandsSection />
  <SearchContainer />
  <div className="mt-12"><AdSkeleton height={90} /></div>
</main>
```

---

## 8. RecentCommandRow.tsx (신규, 최종)

핵심 수정사항 반영:
- `h-11` (M-2)
- × 버튼 `onKeyDown stopPropagation` (C-2)
- `index` prop + `delay: index * 0.04` (C-3)
- `transition` prop 분리 (Mi-1)
- Badge `opacity-60 / group-hover:opacity-90` (Mi-2)
- Tooltip 한계 주석 (Mi-4)

```tsx
import { useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { SPRING, DURATION } from '@/constants/animation';
import { RECENT_COPY_REVERT_MS } from '@/constants/config';
import { CATEGORY_COLOR_MAP } from '@/data/categories';
import { cn } from '@/utils/classNames';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { RecentCommand } from '@/types/store';

interface RecentCommandRowProps {
  entry:    RecentCommand;
  index:    number;           // stagger delay용
  onRemove: (commandId: string) => void;
}

export const RecentCommandRow = memo(function RecentCommandRow({
  entry, index, onRemove,
}: RecentCommandRowProps) {
  const { t } = useTranslation();
  const [copiedLocal, setCopiedLocal] = useState(false);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isReduced = useReducedMotion();

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(entry.command);
      setCopiedLocal(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedLocal(false), RECENT_COPY_REVERT_MS);
    } catch { /* 클립보드 권한 거부 등 — silent fail */ }
  };

  const staggerDelay = isReduced ? 0 : index * DURATION.staggerDelay * 0.67;

  return (
    <motion.div
      layout
      layoutId={`recent-${entry.commandId}`}
      initial={isReduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={isReduced ? { opacity: 0 } : { opacity: 0, x: 6 }}
      transition={isReduced
        ? { duration: 0.1 }
        : { ...SPRING.smooth, delay: staggerDelay, exit: { duration: 0.12, delay: 0 } }
      }
      role="listitem"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          void handleClick();
        }
      }}
      aria-label={`Copy ${entry.title} to clipboard`}
      className={cn(
        'group relative flex items-center gap-2.5 h-11 px-3 rounded-xl cursor-pointer',
        'border-l-2 transition-colors duration-150 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
        copiedLocal
          ? 'bg-accent-soft'
          : 'bg-transparent hover:bg-bg-surface'
      )}
      style={{
        borderLeftColor: copiedLocal ? 'var(--color-accent)' : CATEGORY_COLOR_MAP[entry.category],
      }}
    >
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          {copiedLocal ? (
            <motion.span key="copied"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="text-accent text-xs font-mono font-medium"
            >
              {t('recent.copied')}
            </motion.span>
          ) : (
            <motion.div key="command"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="min-w-0"
            >
              {/* TODO: Tooltip의 whitespace-nowrap으로 240px 초과 명령어는 truncate됨.
                  향후 Tooltip에 wrap prop 추가로 개선 가능 (현재 scope 외) */}
              <Tooltip content={entry.command}>
                <code className="text-text-primary text-xs font-mono truncate block">
                  {entry.command}
                </code>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mi-2: opacity-60 / group-hover:opacity-90 */}
      <Badge
        label={t(`category.${entry.category}`)}
        size="sm"
        className="shrink-0 opacity-60 group-hover:opacity-90 transition-opacity duration-150"
      />

      {/* C-2: onKeyDown stopPropagation으로 부모 copy handler 버블링 차단 */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(entry.commandId); }}
        onKeyDown={(e) => e.stopPropagation()}
        aria-label={`Remove ${entry.title} from recently copied`}
        tabIndex={0}
        className={cn(
          'shrink-0 w-5 h-5 flex items-center justify-center rounded-md',
          'text-text-muted hover:text-error hover:bg-error/10',
          'opacity-0 group-hover:opacity-40 hover:!opacity-100',
          'transition-all duration-150',
          'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-error'
        )}
      >
        <X size={12} />
      </button>
    </motion.div>
  );
});
```

---

## 9. RecentCommandsSection.tsx (신규, 최종)

```tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RecentCommandRow } from './RecentCommandRow';
import { useRecentCommandsStore } from '@/store/useRecentCommandsStore';
import { useSearchStore } from '@/store/useSearchStore';
import { SPRING } from '@/constants/animation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function RecentCommandsSection() {
  const { t } = useTranslation();
  const recentCommands      = useRecentCommandsStore(s => s.recentCommands);
  const removeRecentCommand = useRecentCommandsStore(s => s.removeRecentCommand);
  const clearRecentCommands = useRecentCommandsStore(s => s.clearRecentCommands);
  const query               = useSearchStore(s => s.query);
  const isReduced           = useReducedMotion();

  const isVisible = recentCommands.length > 0 && query === '';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          key="recent-section"
          initial={isReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={isReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={isReduced ? { duration: 0.1 } : SPRING.smooth}  // Mi-1: transition 분리
          aria-label={t('recent.title')}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-2xs font-medium uppercase tracking-widest text-text-muted select-none">
              {t('recent.title')}
            </span>
            <button
              onClick={clearRecentCommands}
              aria-label="Clear all recently copied commands"
              className="text-2xs text-text-muted hover:text-error transition-colors duration-150"
            >
              {t('recent.clear')}
            </button>
          </div>

          {/* C-3: variants/staggerChildren 폐기 → index 기반 delay */}
          <div role="list" className="flex flex-col gap-0.5">
            <AnimatePresence mode="popLayout">
              {recentCommands.map((entry, index) => (
                <RecentCommandRow
                  key={entry.commandId}
                  entry={entry}
                  index={index}
                  onRemove={removeRecentCommand}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
```

---

## 10. 테스트 — `src/store/__tests__/useRecentCommandsStore.test.ts`

6개 케이스: 맨 앞 삽입, 중복 재정렬, 10개 trim, 개별 삭제, 전체 삭제, copiedAt 타임스탬프.
