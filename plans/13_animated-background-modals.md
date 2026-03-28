# Plan 13: Animated Space Background & Modals Refactor
> v4 — 최종 검토 완료 (2026-03-29)

---

## 목표 요약

| # | 항목 | 현재 상태 | 목표 상태 |
|---|------|----------|----------|
| 1 | 별(StarField) | 정적, 깜빡임만 | 3-레이어 parallax, 오른쪽으로 흐름 |
| 2 | FloatingCodeSnippet | 제자리 진동 | 오른쪽 드리프트 + 마우스로 잡고 던질 수 있음 |
| 3 | FloatingContributorCard | 고정 위치 진동 | 오른쪽 드리프트 + 마우스로 잡고 던질 수 있음 |
| 4 | Creator 카드 클릭 | EasterEggModal 열기 | `https://github.com/hamlsy` 새 탭 이동 |
| 5 | 모달 구조 | EasterEggModal (creator 고정) | ContributorDetailModal (동적) + ContributorsModal |

---

## v3 → v4: 발견된 결함 전체 목록

### [치명적 버그 1] 루프 리셋 시 1프레임 순간이동 flash

**위치**: `useDriftAndDrag` → `onComplete` 콜백

```ts
// v3 코드 (잘못됨)
onComplete: () => {
  x.set(config.startX * window.innerWidth / 100); // ← 보이는 상태에서 즉시 점프
  startDrift();
}
```

element가 완전히 보이는 상태(opacity 정상)에서 110vw → startX로 순간이동하면
**브라우저가 1프레임 동안 이전 위치와 새 위치를 모두 렌더링**해 흰색 잔상이 생긴다.

**fix**: `opacity` motionValue를 별도로 관리해, 화면 밖(105vw 근처)에서 서서히 사라진 뒤 teleport + 서서히 등장.

```ts
// opacity motionValue 별도 관리
const opacity = useMotionValue(0);

// drift 시작 시: fade-in
animate(opacity, targetOpacity, { duration: 1.2, ease: 'easeIn' });

// onComplete 시: 이미 화면 밖이지만 opacity 0으로 reset 후 teleport
opacity.set(0);
x.set(startPx);
// 다음 drift 시작 시 다시 fade-in
```

사실 요소가 110vw에 도달했다면 이미 화면 밖이므로 teleport 자체는 안 보인다.
문제는 **처음 마운트 시 delay가 0일 경우** x=0(화면 왼쪽 끝)에서 시작하는 것이 보인다는 점이다.
→ opacity를 초기값 0으로 두고, drift 시작과 함께 fade-in하면 해결.

---

### [치명적 버그 2] `startDrift` 재귀 stale closure

**위치**: `useDriftAndDrag` → `useCallback`

```ts
const startDrift = useCallback((fromX?: number) => {
  driftControls.current = animate(x, endPx, {
    onComplete: () => {
      if (!isDragging.current) startDrift(); // ← 클로저로 캡처된 초기 버전 참조
    },
  });
}, [config, x, y]);
```

`onComplete` 내부의 `startDrift`는 `useCallback`이 처음 생성될 때 캡처된 버전이다.
`config`가 변경되면 새 `startDrift`가 만들어지지만 `onComplete`는 **항상 최초 버전을 호출**한다.
첫 렌더 이후 deps가 바뀔 일이 없다면 실질적 버그는 없지만, 안전하지 않은 패턴이다.

**fix**: ref로 최신 함수를 항상 참조.

```ts
const startDriftRef = useRef<((fromX?: number) => void) | null>(null);
// 함수 정의 후:
startDriftRef.current = startDrift;
// onComplete에서:
onComplete: () => {
  if (mountedRef.current && !isDragging.current) {
    startDriftRef.current?.();
  }
}
```

---

### [치명적 버그 3] 언마운트 후 메모리 릭

**위치**: `useDriftAndDrag` cleanup

```ts
useEffect(() => {
  const timer = setTimeout(() => startDrift(), config.driftDelay * 1000);
  return () => {
    clearTimeout(timer);
    driftControls.current?.stop();
    floatControls.current?.stop();
  };
}, []);
```

`onComplete`가 fire되는 시점에 컴포넌트가 이미 언마운트되어 있으면 (예: 모바일 리사이즈로 FloatingCanvas가 null을 반환하는 경우) cleanup이 `driftControls.current`를 stop했지만, `onComplete`는 이미 큐에 올라가 있어서 `startDrift()`를 다시 호출한다.
이 새 `animate()`는 언마운트된 컴포넌트의 motionValue를 계속 업데이트해 **silent memory leak**이 발생한다.

**fix**: `mountedRef`로 guard.

```ts
const mountedRef = useRef(true);
useEffect(() => {
  return () => { mountedRef.current = false; };
}, []);
// onComplete, onDragEnd 내 모든 setState/animate 호출 앞에 검사
if (!mountedRef.current) return;
```

---

### [치명적 버그 4] Float Y와 Drag Y 충돌 → 드래그 후 Y축 위치 깨짐

**위치**: `useDriftAndDrag` — float과 drag가 같은 `y` motionValue를 경쟁

```ts
// float이 y를 반복 제어
animate(y, [initialY, initialY + amplitude, initialY], { repeat: Infinity });

// drag도 y를 제어 (drag 중에는 drag가 우선)
<motion.div drag style={{ x, y }} />
```

drag가 끝나면 float animation이 **drag가 마지막으로 설정한 y값에서 재개**되므로
원래 수직 위치(`initialY`)와 전혀 다른 높이에서 이상하게 부유한다.
사용자가 요소를 위쪽으로 던졌다면 float이 화면 위쪽에서만 왔다 갔다 한다.

**fix**: **Wrapper 패턴 — float과 drag를 분리**.

```
Outer motion.div  → y만 담당 (float animation, drag 없음)
  Inner motion.div → x만 담당 (drift + drag)
    content
```

```tsx
// Outer: float 전담 (drag 없음, y만)
<motion.div
  style={{ position: 'fixed', top: 0, left: 0 }}
  animate={{ y: [initialYpx, initialYpx + amplitude, initialYpx] }}
  transition={{ duration: floatDuration, ease: 'easeInOut', repeat: Infinity }}
>
  {/* Inner: x drift + 2D drag */}
  <motion.div
    style={{ x, opacity }}
    drag                          // drag가 inner의 x,y를 제어
    dragElastic={0.8}
    dragTransition={{ power: 0.3, timeConstant: 500 }}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
  >
    {children}
  </motion.div>
</motion.div>
```

drag 종료 후 inner의 y를 0으로 spring-back시키면 outer의 float 경로로 자연스럽게 복귀.

---

### [치명적 버그 5] `window.innerWidth` 렌더 시점 접근 → 값 stale

**위치**: `useDriftAndDrag` 초기화

```ts
// 렌더 중 window 접근 (React strict mode에서 두 번 실행될 수 있음)
const x = useMotionValue(config.startX * window.innerWidth / 100);
```

창 너비가 변경되면 이 값은 stale해져서 모든 px 계산이 틀어진다.
또한, `onComplete`에서도 `window.innerWidth`를 재참조하지 않으면 리사이즈 후 wrong position으로 teleport.

**fix**: `useEffect` 내에서 초기화 + 리사이즈 처리.

```ts
const x = useMotionValue(-200); // 초기값: 화면 밖 (opacity 0이므로 안 보임)

useEffect(() => {
  // mount 후 실제 viewport 크기로 설정
  x.set(vwToPx(config.startX));

  const handleResize = () => {
    // 진행 중인 drift는 vw 비율로 관리하므로 재시작 불필요
    // 다음 loop부터 자동 반영됨 (onComplete에서 window.innerWidth 재참조)
  };
  window.addEventListener('resize', handleResize, { passive: true });
  return () => window.removeEventListener('resize', handleResize);
}, []);

// 헬퍼
const vwToPx = (vw: number) => vw * window.innerWidth / 100;
const vhToPx = (vh: number) => vh * window.innerHeight / 100;
```

---

### [성능 1] `will-change: transform` 상시 적용 → GPU 메모리 압박

10개 스니펫 + 5개 기여자 카드에 영구 `will-change: transform`을 주면
15개 GPU compositor 레이어가 항상 상주한다.
통합 그래픽(Intel UHD, M-series 이전 AMD) 노트북에서 메모리 압박이 생긴다.

**fix**: 드래그 중에만 적용.

```tsx
// whileDrag일 때만 will-change 설정 (Framer Motion이 자동 관리)
// style에서 will-change 제거 — Framer Motion motionValue는 자동으로 compositing hint를 준다
// 명시적 will-change는 생략해도 됨
```

Framer Motion은 `useMotionValue`로 transform을 제어할 때 내부적으로 compositing을 최적화하므로 **명시적 `will-change` 제거** 권장.

---

### [성능 2] 드래그 후 Y spring-back 없이 갑자기 float 경로 복귀

Wrapper 패턴(Bug 4 fix) 적용 시, drag 종료 후 inner element의 y를 즉시 0으로 set하면 visible jump. spring으로 복귀시켜야 한다.

```ts
const onDragEnd = useCallback((_e, info) => {
  isDragging.current = false;
  // inner y를 spring으로 0 복귀 (outer float 경로로 돌아옴)
  animate(innerY, 0, SPRING.gentle);
  // x drift 재개 (현재 x에서)
  startDriftRef.current?.(x.get());
}, []);
```

---

### [성능 3] `isMobile` 체크가 반응형이 아님

```tsx
// FloatingCanvas.tsx — 현재 코드
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
```

컴포넌트 마운트 시점에만 평가된다. 태블릿 회전 또는 브라우저 창 리사이즈 시 갱신 안 됨.
FloatingCanvas가 계속 렌더링되어 배터리/성능 낭비.

**fix**: `useMediaQuery` hook 또는 `window.matchMedia`.

```ts
// src/hooks/useMediaQuery.ts (이미 없다면 신규)
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

// FloatingCanvas.tsx
const isMobile = useMediaQuery('(max-width: 767px)');
```

---

### [UX 1] 기여자 카드가 페이지 로드 직후 안 보임

현재 설계: 모든 카드가 `startX: -15 ~ -20vw`에서 시작 → drift로 화면에 진입.
drift duration이 50~90초이고 startX가 -20vw이면 카드가 처음으로 화면에 들어오는 데 **최소 10~20초**가 걸린다.

`creator` 카드가 GitHub 링크 역할을 하는데, 로드 직후 안 보이면 진입점이 없는 것과 같다.

**fix**: 기여자 카드는 **뷰포트 내 랜덤 위치에서 시작**.
처음부터 화면 안에서 떠다니다가 오른쪽으로 나가고, 왼쪽에서 재진입.

```ts
// 기여자 카드: 초기 x를 뷰포트 내(10~70vw)로 설정
// 스니펫과 달리 off-screen 시작 불필요 — 카드는 즉시 보여야 함
const initialCardX = 10 + seededFloat(contributor.id) * 60; // 10~70vw
```

---

### [UX 2] Creator 카드 — `window.open` 대신 `motion.a` 사용

```tsx
// v3 계획 (접근성 미흡)
<motion.div onTap={() => window.open(GITHUB_URL, '_blank', 'noopener,noreferrer')}>

// 올바른 방법 — 시맨틱 링크이면서 드래그도 가능
<motion.a
  href={contributor.githubUrl}
  target="_blank"
  rel="noopener noreferrer"
  drag
  // motion.a는 drag를 지원함
  // 스크린리더: "링크, hamlsy's GitHub" 로 읽힘
>
```

Framer Motion의 `motion.a`는 `drag`를 완전히 지원한다.
`window.open`은 팝업 차단기에 걸릴 수 있고, 스크린리더가 링크로 인식하지 못한다.

단, `motion.a`에 `drag`를 주면 클릭과 드래그 구분이 필요한데,
Framer Motion은 `dragConstraints`나 `dragSnapToOrigin`과 함께 사용 시
내부적으로 drag distance threshold(기본 3px)를 넘지 않으면 `href` 기본 동작을 허용한다.
즉 짧은 탭 = 링크 이동, 길게 드래그 = drag — 자동으로 구분된다. ✓

---

### [UX 3] Creator GitHub URL이 CONTRIBUTORS 데이터와 불일치

현재 `CONTRIBUTORS[0].githubUrl = 'https://github.com/ohmysyntax'`
실제 URL은 `'https://github.com/hamlsy'`

**fix**: `config.ts`에서 직접 수정.

```ts
{
  id: 'creator',
  name: 'Oh My Syntax',
  role: 'Creator',
  avatarUrl: '/assets/contributors/creator.png',
  githubUrl: 'https://github.com/hamlsy',  // ← 수정
  message: "You found me 👋 — the one who made this mess.",
  spawnProbability: 1.0,
},
```

컴포넌트에 URL을 하드코딩하지 말고 **항상 `contributor.githubUrl`을 사용**하면 config 한 곳만 수정하면 됨.

---

### [보안] 외부 링크 전체에 `rel="noopener noreferrer"` 일관 적용

ContributorsModal, ContributorDetailModal 내 모든 `<a target="_blank">`에 빠짐없이 적용 확인 필요.

```tsx
// 모든 외부 링크 공통 패턴
<a href={url} target="_blank" rel="noopener noreferrer">
```

`noopener`: 열린 탭이 `window.opener`로 원본 페이지를 조작하는 것을 방지
`noreferrer`: Referer 헤더 미전송 (사용자 탐색 경로 노출 방지)

---

## 최종 확정 설계

---

### [Task 1] StarField — 3-레이어 Parallax CSS 애니메이션

별은 드래그 불필요 → CSS 애니메이션 (GPU 합성, 성능 최적).

**방향 수정 확인**: `translateX(0) → translateX(50%)` = 컨테이너 오른쪽 이동 = 별 오른쪽 흐름 ✓

**Seamless loop**: `0~100vw`에 별 N개 배치 후 `100vw` offset으로 동일 패턴 복사 → 200vw 컨테이너 ✓

```ts
// 레이어 구성
const STAR_LAYERS = [
  { seed: 11111, count: 120, sizeThreshold: 0.95, duration: '160s', opacity: 0.5 },
  { seed: 22222, count: 60,  sizeThreshold: 0.85, duration: '100s', opacity: 0.7 },
  { seed: 33333, count: 20,  sizeThreshold: 0.50, duration: '60s',  opacity: 1.0 },
] as const;

// 각 레이어: 동일 패턴 tile (seamless)
function generateTiledStars(count: number, seed: number, sizeThreshold: number): string {
  const stars: string[] = [];
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  const colors = ['#ffffff', '#a5b4fc', '#c4b5fd', '#93c5fd'];

  for (let i = 0; i < count; i++) {
    const x = Math.floor(rand() * 100); // 0~100vw만
    const y = Math.floor(rand() * 100);
    const size = rand() > sizeThreshold ? '1.5px' : '1px';
    const color = colors[Math.floor(rand() * colors.length)];
    stars.push(`${x}vw ${y}vh 0 ${size} ${color}`);      // 원본
    stars.push(`${x + 100}vw ${y}vh 0 ${size} ${color}`); // +100vw 복사본
  }
  return stars.join(', ');
}
```

```css
/* index.css */
@keyframes star-drift {
  from { transform: translateX(0); }
  to   { transform: translateX(50%); } /* 200vw → +100vw 이동 = 오른쪽 흐름 */
}

.star-layer {
  animation: star-drift var(--layer-duration, 120s) linear infinite;
  /* will-change 생략 — translateX CSS animation은 자동으로 compositing */
}

@media (prefers-reduced-motion: reduce) {
  .star-layer { animation: none !important; }
}
```

---

### [Task 2] `useDriftAndDrag` Hook — 확정 설계 (모든 버그 수정 반영)

```ts
// src/hooks/useDriftAndDrag.ts

interface DriftConfig {
  startX: number;          // vw (음수: 화면 왼쪽 밖 / 양수: 뷰포트 내)
  endX: number;            // vw (기본 115, 완전히 화면 밖)
  initialY: number;        // vh
  targetOpacity: number;   // drift 중 표시 opacity
  driftDuration: number;   // 초
  driftDelay: number;      // 초 (첫 등장 딜레이)
  floatAmplitude: number;  // px
  floatDuration: number;   // 초
}

export function useDriftAndDrag(config: DriftConfig) {
  // ── motionValues ──────────────────────────────────
  const x = useMotionValue(-300);          // 초기 화면 밖 (invisible)
  const opacity = useMotionValue(0);       // 초기 투명
  const innerY = useMotionValue(0);        // inner element의 drag Y offset

  // ── refs ──────────────────────────────────────────
  const mountedRef = useRef(true);
  const isDragging = useRef(false);
  const driftControlRef = useRef<AnimationPlaybackControls | null>(null);
  const startDriftRef = useRef<((fromX?: number) => void) | null>(null);

  // ── helpers ───────────────────────────────────────
  const vwToPx = useCallback((vw: number) => vw * window.innerWidth / 100, []);

  // ── startDrift (ref로 최신 버전 유지) ─────────────
  const startDrift = useCallback((fromX?: number) => {
    if (!mountedRef.current) return;

    const startPx = fromX ?? vwToPx(config.startX);
    const endPx   = vwToPx(config.endX);
    const ratio   = Math.abs((endPx - startPx) / (vwToPx(config.endX) - vwToPx(config.startX)));
    const duration = config.driftDuration * Math.max(ratio, 0.1);

    // fade in (처음 등장 or 재시작 시)
    animate(opacity, config.targetOpacity, { duration: 1.2, ease: 'easeIn' });

    driftControlRef.current?.stop();
    driftControlRef.current = animate(x, endPx, {
      duration,
      ease: 'linear',
      onComplete: () => {
        if (!mountedRef.current) return;
        // 화면 밖 도달 → opacity 0 → teleport → 재시작
        opacity.set(0);
        x.set(vwToPx(config.startX));
        if (!isDragging.current) startDriftRef.current?.();
      },
    });
  }, [config, x, opacity, vwToPx]);

  // ref 항상 최신 유지
  startDriftRef.current = startDrift;

  // ── float (outer wrapper에서 처리 — 여기서는 Y 관련 값만 제공) ─

  // ── lifecycle ─────────────────────────────────────
  useEffect(() => {
    x.set(vwToPx(config.startX));
    const timer = setTimeout(() => startDriftRef.current?.(), config.driftDelay * 1000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      driftControlRef.current?.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── drag handlers ──────────────────────────────────
  const onDragStart = useCallback(() => {
    isDragging.current = true;
    driftControlRef.current?.stop(); // drift 일시 중단
  }, []);

  const onDragEnd = useCallback(() => {
    if (!mountedRef.current) return;
    isDragging.current = false;
    // inner Y를 spring으로 0 복귀 (outer float 경로로 돌아옴)
    animate(innerY, 0, { ...SPRING.gentle });
    // 현재 x 위치에서 drift 재개
    startDriftRef.current?.(x.get());
  }, [x, innerY]);

  return { x, opacity, innerY, onDragStart, onDragEnd };
}
```

---

### [Task 3] FloatingCodeSnippet — Wrapper 패턴 (Bug 4 fix)

```tsx
export function FloatingCodeSnippet({ ... }: Props) {
  const { x, opacity, innerY, onDragStart, onDragEnd } = useDriftAndDrag({ ... });

  return (
    {/* Outer: float (Y 진동만, drag 없음) */}
    <motion.div
      className="absolute pointer-events-none"
      style={{ top: `${initialY}vh`, left: 0 }}
      animate={{ y: [0, floatAmplitude, 0] }}
      transition={{
        duration: floatDuration,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: floatDelay,
      }}
      aria-hidden="true"
    >
      {/* Inner: X drift + 2D drag */}
      <motion.div
        className={cn(
          'font-mono select-none cursor-grab active:cursor-grabbing pointer-events-auto',
          fontSize, colorClass
        )}
        style={{ x, opacity, y: innerY }}
        drag
        dragElastic={0.8}
        dragTransition={{ power: 0.3, timeConstant: 500 }}
        whileDrag={{ scale: 1.1 }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {snippet}
      </motion.div>
    </motion.div>
  );
}
```

---

### [Task 4] FloatingContributorCard — `motion.a` (creator) / `motion.div` (기타)

```tsx
export function FloatingContributorCard({ contributor, index }: Props) {
  const isCreator = contributor.id === 'creator';
  const { x, opacity, innerY, onDragStart, onDragEnd } = useDriftAndDrag({
    startX: isCreator ? CARD_CONFIGS[index].startX : -15,
    // creator는 뷰포트 내 시작 (즉시 보임), 기타는 화면 밖 시작
    ...CARD_CONFIGS[index % CARD_CONFIGS.length],
    targetOpacity: 0.85,
    driftDuration: 55 + (contributor.id.length % 20),
  });

  const CardTag = isCreator ? motion.a : motion.div;
  const linkProps = isCreator ? {
    href: contributor.githubUrl,  // config에서 읽음 (하드코딩 금지)
    target: '_blank',
    rel: 'noopener noreferrer',
  } : {
    onClick: () => setSelectedContributorId(contributor.id),
  };

  return (
    {/* Outer: float */}
    <motion.div
      style={{ position: 'fixed', top: `${CARD_CONFIGS[index % CARD_CONFIGS.length].y}vh`, left: 0 }}
      animate={{ y: [0, CARD_CONFIGS[index % CARD_CONFIGS.length].floatAmplitude, 0] }}
      transition={{ duration: 8 + index * 1.5, ease: 'easeInOut', repeat: Infinity }}
    >
      {/* Inner: drag */}
      <CardTag
        {...linkProps}
        className="cursor-grab active:cursor-grabbing"
        style={{ x, opacity, y: innerY }}
        drag
        dragElastic={0.8}
        dragTransition={{ power: 0.3, timeConstant: 500 }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        aria-label={isCreator ? `${contributor.name} GitHub` : contributor.name}
      >
        {/* 기존 카드 내부 레이아웃 */}
      </CardTag>
    </motion.div>
  );
}

// 기여자 카드 위치 설정
// creator(index 0): startX 양수 → 뷰포트 내 즉시 등장
// 기타: startX 음수 → 화면 밖에서 등장
const CARD_CONFIGS = [
  { startX: 55, y: 72, floatAmplitude: 8,  driftDelay: 0 },   // creator: 즉시 화면 중앙-우측
  { startX: -20, y: 60, floatAmplitude: 12, driftDelay: 8 },
  { startX: -15, y: 82, floatAmplitude: 6,  driftDelay: 16 },
  { startX: -18, y: 68, floatAmplitude: 10, driftDelay: 24 },
];
```

---

### [Task 5] FloatingCanvas — `useMediaQuery` 적용

```tsx
export function FloatingCanvas() {
  const showFloating = useSettingsStore(s => s.showFloating);
  const isReduced = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)'); // ← 반응형 체크

  if (isReduced || isMobile || !showFloating) return null;
  // ...
}
```

---

### [Task 6] 모달 구조 (v3과 동일, 보안 보완)

**ContributorDetailModal**: `selectedContributorId`로 동적 렌더링. creator는 GitHub으로 이동하므로 모달 열지 않음.

**ContributorsModal**: Footer "Contributors" 버튼으로 진입. 모든 외부 링크에 `rel="noopener noreferrer"` 적용.

**EasterEggModal.tsx → ContributorDetailModal.tsx** 리팩토링.

---

## 변경 파일 목록 (최종)

```
수정:
  src/index.css
    → star-drift keyframes (CSS, 별 전용)
    → snippet/contributor 관련 CSS keyframe 없음 (Framer Motion 전담)

  src/features/background/StarField.tsx
    → generateTiledStars() 함수 (seamless tile)
    → STAR_LAYERS 3개 레이어

  src/features/background/FloatingCodeSnippet.tsx
    → Wrapper 패턴 (outer float / inner drag)
    → useDriftAndDrag 사용

  src/features/background/FloatingContributorCard.tsx
    → motion.a (creator) / motion.div (기타) 분기
    → CARD_CONFIGS (위치 분산, creator 즉시 등장)
    → useDriftAndDrag 사용

  src/features/background/FloatingCanvas.tsx
    → useMediaQuery 적용 (반응형 체크)

  src/hooks/useFloatingItems.ts
    → FloatingItem 인터페이스 변경

  src/constants/config.ts
    → creator.githubUrl: 'https://github.com/hamlsy' 수정
    → Contributor 인터페이스 확장

  src/store/useSettingsStore.ts
    → showEasterEgg → selectedContributorId: string | null
    → showContributors: boolean 추가

  src/components/layout/Footer.tsx
    → Contributors 버튼 추가

  src/App.tsx
    → ContributorDetailModal, ContributorsModal 마운트

신규:
  src/hooks/useDriftAndDrag.ts          ← 핵심 Hook
  src/hooks/useMediaQuery.ts            ← 반응형 체크
  src/features/modals/ContributorDetailModal.tsx
  src/features/modals/ContributorsModal.tsx
  src/features/modals/index.ts
  public/assets/contributors/

리팩토링:
  src/features/background/EasterEggModal.tsx
    → src/features/modals/ContributorDetailModal.tsx
```

---

## 구현 순서

```
Step 1.  index.css — star-drift keyframe 추가
Step 2.  useMediaQuery.ts — 신규 hook
Step 3.  StarField.tsx — 3-레이어 parallax (generateTiledStars)
Step 4.  useDriftAndDrag.ts — 핵심 hook (모든 버그 수정 반영)
Step 5.  useFloatingItems.ts — FloatingItem 인터페이스 변경
Step 6.  FloatingCodeSnippet.tsx — wrapper 패턴 + useDriftAndDrag
Step 7.  constants/config.ts — githubUrl 수정 + 인터페이스 확장
Step 8.  useSettingsStore.ts — 상태 교체
Step 9.  FloatingContributorCard.tsx — motion.a + CARD_CONFIGS + useDriftAndDrag
Step 10. FloatingCanvas.tsx — useMediaQuery 적용
Step 11. ContributorDetailModal.tsx — EasterEggModal 리팩토링
Step 12. ContributorsModal.tsx — 신규
Step 13. Footer.tsx — Contributors 버튼
Step 14. App.tsx — 모달 마운트
```

---

## 최종 체크리스트

### 애니메이션 품질
- [x] 루프 리셋 시 opacity 0 → teleport → fade-in (flash 없음)
- [x] float Y와 drag Y 분리 (wrapper 패턴)
- [x] 드래그 종료 후 Y spring-back (SPRING.gentle)
- [x] 별 오른쪽 이동 방향 확인 (translateX +50%)
- [x] 별 seamless tile (동일 패턴 2벌)
- [x] 3-레이어 parallax depth (60s / 100s / 160s)
- [x] prefers-reduced-motion 대응

### 성능
- [x] will-change 미남용 (Framer Motion 자동 compositing 신뢰)
- [x] isMobile useMediaQuery (반응형)
- [x] mountedRef (언마운트 후 메모리 릭 방지)
- [x] 드래그 종료 후 startDrift ref (stale closure 방지)

### UX
- [x] creator 카드: 페이지 로드 즉시 화면 내 등장 (startX 양수)
- [x] creator 클릭: motion.a + rel="noopener noreferrer"
- [x] 일반 기여자 클릭: ContributorDetailModal
- [x] 드래그 거리 < 3px → href 기본 동작 허용 (Framer Motion 자동 처리)

### 보안
- [x] creator.githubUrl: 'https://github.com/hamlsy' (config에서 관리)
- [x] 모든 외부 링크: rel="noopener noreferrer"
- [x] window.open 사용 금지 (motion.a로 대체)
