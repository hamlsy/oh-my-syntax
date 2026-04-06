# Oh My Syntax — 버그 & 성능 개선안 (v3, 심층 재검토)

> 분석 기준일: 2026-04-06
> 대상 증상 ①: 검색 시 result-item이 중간중간 안 보이는 현상
> 대상 증상 ②: 서비스 전반 응답 느려짐

---

## 목차

1. [아이템 미표시 버그 — 원인 전체](#1-아이템-미표시-버그--원인-전체)
2. [성능 저하 원인](#2-성능-저하-원인)
3. [개선안 (우선순위 순)](#3-개선안-우선순위-순)
4. [수정 체크리스트](#4-수정-체크리스트)

---

## 1. 아이템 미표시 버그 — 원인 전체

### 1-A. [주범] Spring settling time(~600ms) > 타이핑 간격(~100ms)

**파일:** `src/features/results/ResultList.tsx:23` + `src/constants/animation.ts:9`

```ts
// SPRING.smooth: stiffness=300, damping=25
// 임계감쇠비 = 25 / (2 × √300) ≈ 0.72  → underdamped (진동 수렴)
// enter 완전 정착까지 약 400~600ms 소요
visible: { opacity: 1, y: 0, transition: SPRING.smooth },
```

**타이밍 시뮬레이션 (타이핑 속도 ~100ms/keystroke):**

```
t=0ms   : "g"   입력 → items 20개 enter 시작 (opacity 0→1, 600ms 소요)
t=100ms : "gi"  입력 → 기존 items 아직 opacity ≈ 0.15
          → AnimatePresence가 exit 발동 (opacity 0.15→0, 150ms)
          → 새 items가 opacity: 0 에서 다시 시작
t=200ms : "git" 입력 → 새 items 이미 opacity ≈ 0.1~0.2 에서 또 exit
```

결과: items들이 **반투명 상태로 계속 교체**되어 목록이 비어 보임.
exit duration(150ms)도 spring settling(600ms)에 비해 너무 짧아 exit 애니메이션조차 제대로 안 보임.

---

### 1-B. `mode="popLayout"` + scroll container에 `position: relative` 누락

**파일:** `src/features/results/ResultList.tsx:60-64`

```tsx
// ❌ position: relative 없음
<div
  data-lenis-prevent
  style={{ maxHeight: '600px', overflowY: 'auto' }}
  className="pr-1 -mr-1"
>
  <AnimatePresence mode="popLayout">
```

**`mode="popLayout"` 동작 원리:**
exit 시 element를 `position: absolute`로 전환하여 layout flow에서 분리.
이때 **가장 가까운 positioned ancestor 기준**으로 `top` / `left`를 계산.

scroll container에 `position: relative`가 없으면:
- exiting items들이 더 상위 DOM 요소 기준으로 절대 위치 배치
- 스크롤이 내려간 상태에서 scroll offset이 반영 안 되어 위치 오차 발생
- `overflow: auto`에 의해 엉뚱한 위치로 이동한 items가 컨테이너 밖에서 클리핑

---

### 1-C. `staggerChildren` 초기 마운트 이후 재작동 안 됨

**파일:** `src/features/results/ResultList.tsx:13-19, 65-71`

```ts
// "hidden" state 없음 → 부모가 transition할 출발점이 없음
const listVariants = {
  visible: {
    transition: { staggerChildren: 0.02 },
  },
};

// motion.ul에 initial prop 없음 → 첫 렌더부터 "visible" 상태로 즉시 시작
<motion.ul
  variants={isReduced ? undefined : listVariants}
  animate="visible"
  // ❌ initial 없음
>
```

**문제 메커니즘:**
`staggerChildren`은 부모가 "hidden" → "visible"로 **전환(transition)할 때**만 적용됨.
부모 `motion.ul`이 `initial` 없이 즉시 "visible" 상태로 시작하므로,
results가 교체되어 새 `motion.li`가 추가될 때 stagger 없이 **모든 items가 동시에 fade-in**.
→ 검색어를 바꿀 때마다 items들이 한꺼번에 팝업되는 어색한 깜빡임 유발.

---

### 1-D. `useHighlightedResultScroll` race condition

**파일:** `src/hooks/useHighlightedResultScroll.ts`

```ts
useEffect(() => {
  if (highlightedIndex < 0) return;
  // ❌ results 변경 직후 호출 시, AnimatePresence exit 아이템이 아직 DOM에 존재
  const el = document.getElementById(`result-item-${highlightedIndex}`);
  el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}, [highlightedIndex]);
```

**index 기반 id의 불안정성 (`ResultList.tsx:78`):**

```
필터링 전: [A(id:0), B(id:1), C(id:2)]
필터링 후: [B(id:0), C(id:1)]          ← 같은 B가 id=0으로 변경
highlightedIndex=1이면 → 필터 전=B, 필터 후=C 를 가리킴 (의도치 않은 점프)
```

`AnimatePresence` exit 애니메이션 진행 중에는 구 DOM element가 살아있어
`getElementById`가 **exit 중인 구 element를 반환**할 수 있음.

---

### 1-E. `useCopyToClipboard` — unmount 후 setState 호출

**파일:** `src/hooks/useCopyToClipboard.ts`

```ts
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    timerRef.current = setTimeout(() => {
      setCopied(false);   // ❌ 컴포넌트 unmount 후 호출될 수 있음
      timerRef.current = null;
    }, COPY_REVERT_MS);
  }, []);

  // ❌ useEffect cleanup 없음 — unmount 시 타이머 미정리
  return { copied, copy };
}
```

`AnimatePresence`가 exit 중인 `ResultCard`를 언마운트할 때,
`COPY_REVERT_MS`(2000ms) 타이머가 살아있다면 언마운트된 컴포넌트의
`setCopied` 호출 → React 18 콘솔 경고 + 잠재적 메모리 누수.
빠른 카테고리 전환 또는 검색 초기화 시 재현 가능성 높음.

---

### 1-F. `useQuerySync` — VALID_CATEGORIES 동기화 누락

**파일:** `src/hooks/useQuerySync.ts:5-8`

```ts
// ❌ npm, sql, vim 등 새 카테고리 누락
const VALID_CATEGORIES: CategoryId[] = [
  'all', 'linux', 'macos', 'windows', 'docker',
  'kubernetes', 'git', 'java', 'python', 'javascript',
];
```

URL에서 `?cat=npm`으로 접근 시 유효성 검사 통과 실패 → 카테고리 복원 안 됨.
→ "all" 카테고리로 강제 표시 → 사용자 예상과 다른 결과 목록 렌더링.
새 카테고리 추가 시마다 수동 동기화가 필요한 구조적 문제.

---

## 2. 성능 저하 원인

### 2-A. 배경 애니메이션의 메인 스레드 지속 점유

**파일:** `src/hooks/useDriftAndDrag.ts` + `src/main.tsx:47-52`

```
매 프레임(16ms) 실행 중인 병렬 작업:
├── Lenis RAF loop (main.tsx)          — 항상 실행, 스크롤 없어도 계속 돌아감
├── FloatingCodeSnippet × N의 drift    — opacity + x MotionValue 매 프레임 업데이트
├── FloatingCodeSnippet × N의 Y float  — animate({ y: [0, amp, 0] }) 루프
└── Framer Motion internal scheduler   — 위 모든 MotionValue 배치 처리
```

배경 요소들이 **검색 입력 처리와 프레임 예산을 경쟁**함.
사용자가 검색창에 타이핑할 때 배경 애니메이션이 JS thread를 점유하면
React의 상태 업데이트(query → results 계산)가 지연되어 체감 응답속도 저하.

---

### 2-B. `useDriftAndDrag` — `window.resize` 미처리

**파일:** `src/hooks/useDriftAndDrag.ts:60-69`

```ts
const vwToPx = (vw: number) => vw * window.innerWidth / 100;

useEffect(() => {
  x.set(vwToPx(config.startX));  // ← 마운트 시점 viewport 기준으로 계산
  const timer = setTimeout(() => startDriftRef.current?.(), config.driftDelay * 1000);
  return () => { ... };
}, []); // ❌ resize 이벤트 리스너 없음
```

창 크기 변경 후 drift가 계속 실행되지만 `endPx` 계산이 이전 viewport 기준이라:
- 요소가 화면 끝에 도달하지 못하고 화면 중간에서 순간이동(teleport)
- 또는 화면 밖으로 완전히 사라지지 않고 edge에서 대기

---

### 2-C. `useCommandSearch` — `fuseKey` 이중 의존성으로 불필요한 문자열 생성

**파일:** `src/hooks/useCommandSearch.ts:26-31`

```ts
// ❌ fuseKey는 language + selectedCategory 조합 문자열
const fuseKey = `${language}-${selectedCategory}`;

const fuse = useMemo(
  () => buildFuseIndex(categoryPool),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [fuseKey, categoryPool]  // fuseKey와 categoryPool이 항상 함께 바뀜 → 둘 다 불필요
);
```

`selectedCategory` 변경 시 `fuseKey`와 `categoryPool`이 **동시에 변경**됨.
의존성 배열에 둘 다 있어 의미상 중복. `fuseKey`는 매 렌더마다 새 문자열을 생성.
`buildFuseIndex`는 가장 비싼 연산 — 가능한 한 최소 의존성으로 관리해야 함.

---

### 2-D. `CategoryDropdown` — 이벤트 리스너 반복 등록/해제

**파일:** `src/features/search/CategoryDropdown.tsx`

```ts
// dropdown 열릴 때마다 2개의 document-level 리스너 독립 등록
useEffect(() => {
  if (!isOpen) return;
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, [isOpen]); // ← 열고 닫기마다 등록/해제

useEffect(() => {
  if (!isOpen) return;
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [isOpen]); // ← 별도 useEffect로 분리
```

두 useEffect가 각각 독립적으로 리스너를 관리.
빠르게 열고 닫으면 리스너 등록/해제 급격히 반복 → 이벤트 시스템 부하.

---

### 2-E. `useHighlightedResultScroll` — 매 키 입력마다 O(n) DOM 탐색

**파일:** `src/hooks/useHighlightedResultScroll.ts`

```ts
// ArrowUp/Down 누를 때마다 실행되는 document 전체 탐색
const el = document.getElementById(`result-item-${highlightedIndex}`);
```

`document.getElementById`는 내부적으로 DOM 트리 전체를 순회.
결과가 50개일 때 최악의 경우 50개 element를 스캔.
키보드 네비게이션 중 매 프레임마다 반복 실행됨.

---

### 2-F. `useQuerySync` — 매 keystroke마다 `history.replaceState` 호출

**파일:** `src/hooks/useQuerySync.ts:28-38`

```ts
useEffect(() => {
  const params = new URLSearchParams(); // ← 매번 새 객체 생성
  // ...
  window.history.replaceState(null, '', newUrl); // ← 매 keystroke마다 호출
}, [query, selectedCategory]); // query는 setQuery 호출 즉시 업데이트
```

`query`가 `useDeferredValue`가 아닌 raw store state를 구독하므로
"hello" 타이핑 시 `replaceState`가 5번 연속 호출.
`replaceState` 자체는 빠르지만, `URLSearchParams` 객체 생성 + 문자열 조합이 누적됨.

---

### 2-G. `startDrift` 함수 매 렌더마다 재생성 가능성

**파일:** `src/hooks/useDriftAndDrag.ts:26-54`

```ts
const startDrift = useCallback((fromX?: number) => {
  ...
}, [config, x, opacity]); // ← config 객체 참조가 바뀌면 재생성

// 재생성될 때마다 즉시 ref에 반영
startDriftRef.current = startDrift;
```

부모 컴포넌트(`FloatingCodeSnippet`)가 매 렌더마다 새 config 객체를 inline으로
생성해서 props로 넘기면, `startDrift`가 매 렌더마다 재생성.
이는 함수 할당 오버헤드뿐 아니라 `useCallback` 내부 deps 비교 비용도 발생시킴.

---

## 3. 개선안 (우선순위 순)

---

### P0-A: enter 애니메이션을 고속 spring으로 교체 [주범 해결]

**대상 파일:** `src/constants/animation.ts`, `src/features/results/ResultList.tsx`

```ts
// animation.ts — 리스트 아이템 전용 빠른 spring 상수 추가
export const SPRING = {
  snappy:   { type: 'spring', stiffness: 400, damping: 30 },
  smooth:   { type: 'spring', stiffness: 300, damping: 25 },
  gentle:   { type: 'spring', stiffness: 60,  damping: 20 },
  entrance: { type: 'spring', stiffness: 200, damping: 20, mass: 1.2 },
  // ✅ 추가: 검색 결과 아이템용 (settling ~120ms — 타이핑 속도보다 빠름)
  listItem: { type: 'spring', stiffness: 500, damping: 38 },
} as const;
```

```ts
// ResultList.tsx — visible transition 교체 + exit duration 단축
const itemVariants = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: SPRING.listItem }, // smooth → listItem
  exit:    { opacity: 0, transition: { duration: 0.08 } },    // 0.15s → 0.08s
};
```

settling time 600ms → 120ms. 타이핑 속도(100ms)보다 빠르게 완료되어
이전 items가 완전히 불투명한 상태에서 exit됨.

---

### P0-B: scroll container에 `position: relative` 추가

**대상 파일:** `src/features/results/ResultList.tsx`

```tsx
<div
  data-lenis-prevent
  style={{ maxHeight: '600px', overflowY: 'auto' }}
  className="relative pr-1 -mr-1"  // ✅ relative 추가
>
  <AnimatePresence mode="popLayout">
```

`mode="popLayout"`의 absolutely positioned exit items가
이 컨테이너를 positioned ancestor로 인식하여 정확한 위치에 고정.

---

### P0-C: `listVariants`에 `hidden` state 추가 + `motion.ul`에 `initial` 추가

**대상 파일:** `src/features/results/ResultList.tsx`

```ts
// "hidden" state 추가 — 부모가 transition할 출발점 확보
const listVariants = {
  hidden: {},  // ✅ 추가
  visible: {
    transition: { staggerChildren: 0.015 }, // 0.02 → 0.015 (약간 단축)
  },
};
```

```tsx
// motion.ul에 initial 추가
<motion.ul
  variants={isReduced ? undefined : listVariants}
  initial={isReduced ? undefined : 'hidden'}  // ✅ 추가
  animate="visible"
  ...
>
```

결과가 교체될 때마다 key가 새로 시작되는 children에 stagger가 올바르게 재적용.

---

### P0-D: `useHighlightedResultScroll` — RAF로 DOM 업데이트 후 실행

**대상 파일:** `src/hooks/useHighlightedResultScroll.ts`

```ts
export function useHighlightedResultScroll(highlightedIndex: number) {
  useEffect(() => {
    if (highlightedIndex < 0) return;
    // ✅ RAF: AnimatePresence DOM 업데이트 완료 후 실행
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(`result-item-${highlightedIndex}`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(raf);
  }, [highlightedIndex]);
}
```

---

### P0-E: `useCopyToClipboard` — unmount cleanup 추가

**대상 파일:** `src/hooks/useCopyToClipboard.ts`

```ts
export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true); // ✅ 추가

  // ✅ cleanup effect 추가
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    if (!mountedRef.current) return; // ✅ unmount 후 조기 리턴
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) setCopied(false); // ✅ unmount 체크
      timerRef.current = null;
    }, COPY_REVERT_MS);
  }, []);

  return { copied, copy };
}
```

---

### P0-F: `useQuerySync` — VALID_CATEGORIES 동적 생성

**대상 파일:** `src/hooks/useQuerySync.ts`

```ts
import { CATEGORIES } from '@/data/categories';

// ✅ 하드코딩 제거 → categories.ts 단일 소스에서 동적 생성
const VALID_CATEGORY_IDS = new Set(CATEGORIES.map(c => c.id));

// 사용
if (cat && VALID_CATEGORY_IDS.has(cat)) setSelectedCategory(cat);
```

새 카테고리 추가 시 자동 반영. `CATEGORIES.ts`가 단일 진실 소스(Single Source of Truth).

---

### P1-A: `useDriftAndDrag` — `window.resize` 대응 추가

**대상 파일:** `src/hooks/useDriftAndDrag.ts`

```ts
useEffect(() => {
  mountedRef.current = true;
  x.set(vwToPx(config.startX));
  const timer = setTimeout(() => startDriftRef.current?.(), config.driftDelay * 1000);

  // ✅ resize 시 drift 재계산 후 재시작
  const handleResize = () => {
    if (!mountedRef.current || isDragging.current) return;
    driftControlRef.current?.stop();
    startDriftRef.current?.();
  };
  window.addEventListener('resize', handleResize, { passive: true });

  return () => {
    mountedRef.current = false;
    clearTimeout(timer);
    driftControlRef.current?.stop();
    window.removeEventListener('resize', handleResize); // ✅ cleanup
  };
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

---

### P1-B: `useCommandSearch` — `fuseKey` 제거

**대상 파일:** `src/hooks/useCommandSearch.ts`

```ts
// ❌ 제거
// const fuseKey = `${language}-${selectedCategory}`;

// ✅ 실질적 의존성만 유지
const fuse = useMemo(
  () => buildFuseIndex(categoryPool),
  [categoryPool]
);
```

불필요한 문자열 생성 제거. `categoryPool`이 이미 `language`와 `selectedCategory` 양쪽 변화를 모두 반영함.

---

### P1-C: `CategoryDropdown` — 이벤트 리스너 단일 useEffect 통합

**대상 파일:** `src/features/search/CategoryDropdown.tsx`

```ts
// ✅ 두 개의 useEffect → 하나로 통합
useEffect(() => {
  if (!isOpen) return;

  const handleMouseDown = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setIsOpen(false);
    }
  };

  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('keydown', handleKeyDown);
  return () => {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('keydown', handleKeyDown);
  };
}, [isOpen]);
```

---

### P1-D: `useQuerySync` — debounce 적용으로 URL 갱신 횟수 감소

**대상 파일:** `src/hooks/useQuerySync.ts`

```ts
useEffect(() => {
  // ✅ 300ms debounce — 연속 타이핑 중 URL 갱신 억제
  const timer = setTimeout(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory !== 'all') params.set('cat', selectedCategory);
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, 300);

  return () => clearTimeout(timer);
}, [query, selectedCategory]);
```

"hello" 타이핑 시 `replaceState` 5회 → 1회로 감소.

---

## 4. 수정 체크리스트

| 우선순위 | 파일 | 수정 내용 | 해결 증상 |
|---|---|---|---|
| **P0** 🔴 | `animation.ts` | `SPRING.listItem` 상수 추가 | 아이템 미표시 주범 |
| **P0** 🔴 | `ResultList.tsx` | `SPRING.listItem` 적용, exit 0.08s | 아이템 미표시 주범 |
| **P0** 🔴 | `ResultList.tsx` | scroll container에 `relative` 추가 | popLayout 위치 오류 |
| **P0** 🔴 | `ResultList.tsx` | `listVariants hidden` 추가 + `motion.ul initial` | stagger 재작동 |
| **P0** 🔴 | `useHighlightedResultScroll.ts` | `requestAnimationFrame` 래핑 | scroll race condition |
| **P0** 🔴 | `useCopyToClipboard.ts` | `mountedRef` + cleanup useEffect 추가 | 메모리 누수 / 경고 |
| **P0** 🔴 | `useQuerySync.ts` | `VALID_CATEGORIES` → 동적 Set 생성 | 카테고리 URL 복원 실패 |
| **P1** 🟡 | `useDriftAndDrag.ts` | `window.resize` 리스너 추가 + cleanup | 리사이즈 후 배경 오류 |
| **P1** 🟡 | `useCommandSearch.ts` | `fuseKey` 제거 | 불필요한 연산 |
| **P1** 🟡 | `CategoryDropdown.tsx` | 이벤트 리스너 단일 useEffect 통합 | 리스너 반복 등록 |
| **P1** 🟡 | `useQuerySync.ts` | 300ms debounce 적용 | 매 keystroke URL 갱신 |

**총 수정 파일: 7개 / 총 변경량: 소규모 (최대 10줄/파일)**
