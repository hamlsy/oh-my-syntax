# Plan 15 — UX Bug Fix & Refactor

**Date:** 2026-03-29
**Status:** Draft
**Priority:** High

---

## 진단 요약

### 🔴 Bug 1 — 별 배경이 보이지 않음

**근본 원인 (2가지 중첩 버그):**

**버그 1-A: `FloatingCanvas` 조기 반환이 `StarField`를 삼킴**

`FloatingCanvas.tsx:23`:
```typescript
if (isReduced || isMobile || !showFloating) return null;
```

`StarField`는 `FloatingCanvas` 내부에 있다. 위 조건 중 하나라도 참이면 `StarField`도 함께 `null`이 된다.
- `isMobile`: 767px 이하 → 별이 사라짐
- `!showFloating`: 사용자가 floating 토글을 끄면 별도 사라짐
- `isReduced`: 접근성 설정 시 별도 사라짐

`StarField`는 퍼포먼스 영향이 거의 없는 CSS 배경 요소이므로, **항상** 렌더링되어야 한다. 조건부로 숨겨야 하는 것은 `FloatingCodeSnippet`과 `FloatingContributorCard`뿐이다.

**버그 1-B: CSS `star-drift` 애니메이션이 실질적으로 동작하지 않음**

`StarField.tsx` star-layer div의 스타일:
```typescript
width: '1px',
height: '1px',
```

`index.css` 애니메이션:
```css
@keyframes star-drift {
  from { transform: translateX(0); }
  to   { transform: translateX(50%); }
}
```

`translateX(50%)` = 요소 너비의 50% = **1px의 50% = 0.5px 이동**
코드 주석은 "translateX(50%) = +100vw 이동"이라고 설명하지만,
이는 요소 너비가 `200vw`일 때만 성립한다 (`200vw × 50% = 100vw`).

결과: 별이 전혀 흐르지 않고 고정되어 있음 (0.5px 이동은 육안으로 보이지 않음).

**추가: 애니메이션 방향도 잘못됨**
`translateX(50%)` = 오른쪽으로 이동. 이 경우 원본 별들(0~100vw)이 화면 밖 오른쪽으로 나가면서 빈 화면이 남는다.
올바른 방향: `translateX(-50%)` (왼쪽으로 이동) — 오른쪽에서 복사본이 채워들어옴.

**Fix:**
1. `FloatingCanvas.tsx`: 조기 반환 이전에 `StarField` + `grid-overlay` 렌더링
2. `StarField.tsx`: `width: '1px'` → `width: '200vw'`
3. `index.css`: `translateX(50%)` → `translateX(-50%)` (방향 수정)

---

### 🔴 Bug 2 — 탭 → 검색창 옆 토글 드롭다운

**현재 구조 (`SearchContainer.tsx`):**
```
CategoryTabs  ← 전체 너비 가로 스크롤 탭바 (행 1)
SearchBar     ← 전체 너비 검색창 (행 2)
ResultList    ← 결과 목록 (행 3)
```

**요구사항:** 카테고리 선택기를 검색창 오른쪽에 붙여 한 행에 배치.

**구현 방향:**
- `CategoryTabs.tsx` 제거 (파일 삭제)
- `CategoryDropdown.tsx` 신규 생성:
  - 현재 선택된 카테고리 아이콘 + 이름 표시하는 버튼
  - 클릭 시 Framer Motion으로 부드럽게 열리는 드롭다운 패널
  - 13개 카테고리 그리드 레이아웃 (4열)
  - 외부 클릭 시 닫힘 (`useRef` + `useEffect`)
- `SearchBar.tsx` 수정: 오른쪽에 `CategoryDropdown` 통합 (또는 SearchContainer에서 같은 행에 배치)
- `SearchContainer.tsx` 수정: `CategoryTabs` → `[SearchBar + CategoryDropdown]` 한 행

**아이콘:** `categories.ts`에 이미 `icon` 필드 존재 (lucide-react 아이콘명). `dynamicIconImports` 또는 아이콘 맵으로 렌더링.

---

### 🔴 Bug 3 — 리스트 위 스크롤이 전체 페이지 스크롤로 전파됨

**근본 원인: Lenis가 모든 wheel 이벤트를 전역 인터셉트**

`main.tsx`:
```typescript
const lenis = new Lenis({
  duration: 1.2,
  easing: ...
});
```

Lenis는 기본적으로 모든 `wheel` 이벤트를 감청하여 전체 페이지에 smooth scroll을 적용한다.
`ResultList.tsx`의 스크롤 컨테이너(`overflowY: 'auto'`)에서 마우스를 스크롤하면 Lenis가 이를 가로채어 전체 페이지 스크롤로 변환한다.

**Fix:**
`ResultList.tsx`의 외부 컨테이너 div에 `data-lenis-prevent` 속성 추가:
```tsx
<div
  data-lenis-prevent
  style={{ maxHeight: '600px', overflowY: 'auto' }}
>
```
Lenis는 이 속성이 있는 요소의 자식에서 발생한 scroll 이벤트를 무시하고 브라우저 네이티브 스크롤에게 위임한다.

---

### 🔴 Bug 4 — 탭 전환 / 검색 / 리스트 탐색이 느림

**근본 원인 (3가지 중첩 성능 문제):**

**4-A: Stagger 애니메이션이 매 검색마다 반복 실행됨**

`ResultList.tsx`:
```typescript
const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: DURATION.staggerDelay, // = 0.06s
    },
  },
};
```
```tsx
<motion.ul
  initial="hidden"
  animate="visible"  // ← 결과가 바뀔 때마다 재실행
>
```

`initial="hidden" animate="visible"` 조합과 `AnimatePresence`가 함께 있을 때,
항목이 추가/제거되면 새 항목들이 `hidden → visible` 애니메이션을 다시 실행한다.
20개 항목 × 0.06s stagger = **총 1.2초** 캐스케이드 → 키를 누를 때마다 1.2초짜리 애니메이션 재실행.

**4-B: `layout` 프롭이 모든 키입력마다 강제 레이아웃 재계산 유발**

```tsx
<motion.li layout ...>  // ← 매우 비싼 연산
```

`layout` 프롭은 Framer Motion이 각 항목의 `getBoundingClientRect()`를 호출하여 위치를 계산한 후 spring 애니메이션으로 이동시킨다.
20~50개 항목 × `getBoundingClientRect()` = 매 키입력마다 강제 레이아웃 (레이아웃 스래싱).

**4-C: `AnimatePresence mode="popLayout"`이 추가 레이아웃 계산 유발**

`mode="popLayout"`: 항목 제거 시 나머지 항목들이 layout 애니메이션으로 빈 자리를 채움.
검색할 때마다 결과 목록이 완전히 바뀌므로 → 모든 항목이 동시에 exit + 새 항목 enter.
`layout` 계산이 exit 항목과 enter 항목 모두에게 적용됨.

**Fix:**
1. `staggerChildren` 제거 또는 `0.06s → 0.02s`로 축소
2. `motion.li`에서 `layout` 프롭 제거
3. `AnimatePresence mode="popLayout"` → `mode="sync"`
4. (선택) 검색 중에는 enter 애니메이션을 단순 opacity-only로 교체 (`useDeferredValue` 활용하여 isPending 감지)

---

## 구현 계획

### Phase 1 — Critical Bug Fixes (별 + 스크롤)

| # | 파일 | 변경 내용 |
|---|------|----------|
| 1 | `FloatingCanvas.tsx` | StarField + grid-overlay를 early-return 이전으로 이동. `showFloating` 가드는 floating items(스니펫+카드)에만 적용 |
| 2 | `StarField.tsx` | `width: '1px'` → `width: '200vw'` |
| 3 | `index.css` | `translateX(50%)` → `translateX(-50%)` |
| 4 | `ResultList.tsx` | 외부 div에 `data-lenis-prevent` 추가 |

### Phase 2 — Performance Fix (애니메이션 최적화)

| # | 파일 | 변경 내용 |
|---|------|----------|
| 5 | `ResultList.tsx` | `motion.li`에서 `layout` 제거 |
| 6 | `ResultList.tsx` | `AnimatePresence mode="popLayout"` → `mode="sync"` |
| 7 | `ResultList.tsx` | `staggerChildren: 0.06` → `0.02` (또는 제거) |
| 8 | `ResultList.tsx` | `ul`의 `initial="hidden"` 제거 — 리마운트 시에만 애니메이션 |

### Phase 3 — Category Dropdown (UI 리팩토링)

| # | 파일 | 변경 내용 |
|---|------|----------|
| 9  | `features/search/CategoryDropdown.tsx` | 신규 생성 — 컴팩트 드롭다운 컴포넌트 |
| 10 | `features/search/SearchBar.tsx` | 오른쪽에 CategoryDropdown 슬롯 추가 (또는 SearchContainer에서 행 통합) |
| 11 | `features/search/SearchContainer.tsx` | CategoryTabs 제거, SearchBar 행에 CategoryDropdown 통합 |
| 12 | `features/search/CategoryTabs.tsx` | 파일 삭제 |

---

## CategoryDropdown 상세 스펙

```tsx
// 레이아웃: SearchBar와 같은 행
// [🔍 검색창 ................. ] [⚡ JavaScript ▼]

// 드롭다운 패널 (Framer Motion AnimatePresence)
// ┌─────────────────────────────┐
// │  All  Linux  macOS  Windows │
// │  Docker  K8s  Git  Java     │
// │  Python  JS  npm  SQL  Vim  │
// └─────────────────────────────┘

// 동작
// - 버튼 클릭: 패널 토글 (spring open/close)
// - 패널 외부 클릭: 닫힘 (useEffect + mousedown listener)
// - 카테고리 선택: setSelectedCategory → 패널 닫힘
// - 선택된 카테고리: 아이콘 + 이름 표시 (max-width 제한으로 말줄임)
// - 접근성: aria-haspopup="listbox", aria-expanded
```

---

## 파일별 변경 요약

```
수정:
  src/features/background/FloatingCanvas.tsx   (Bug 1-A)
  src/features/background/StarField.tsx         (Bug 1-B: width)
  src/index.css                                  (Bug 1-B: direction)
  src/features/results/ResultList.tsx            (Bug 3 + Bug 4)
  src/features/search/SearchBar.tsx              (Bug 2: row layout)
  src/features/search/SearchContainer.tsx        (Bug 2: layout restructure)

신규:
  src/features/search/CategoryDropdown.tsx       (Bug 2: new component)

삭제:
  src/features/search/CategoryTabs.tsx           (Bug 2: replaced)
```

---

## 검증 체크리스트

- [ ] 데스크탑에서 별이 흐르는 것이 육안으로 확인됨
- [ ] 모바일(767px 이하)에서도 별이 보임
- [ ] `showFloating = false` 설정 시 코드 스니펫/카드는 사라지지만 별은 유지됨
- [ ] 결과 목록 위에서 스크롤 시 리스트만 스크롤되고 페이지는 고정됨
- [ ] 검색창 오른쪽에 카테고리 드롭다운 버튼이 있음
- [ ] 드롭다운에서 카테고리 선택 시 검색 결과가 즉시 필터링됨
- [ ] 탭 전환 / 키 입력 후 결과 표시가 눈에 띄게 빨라짐
- [ ] 키보드 네비게이션(Arrow, Enter, Escape) 정상 동작
- [ ] TypeScript strict mode 에러 없음
