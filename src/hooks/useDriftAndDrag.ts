import { useCallback, useEffect, useRef } from 'react';
import { animate, useMotionValue, type AnimationPlaybackControls } from 'framer-motion';
import { SPRING } from '@/constants/animation';

export interface DriftConfig {
  startX:        number; // vw (음수: 화면 왼쪽 밖, 양수: 뷰포트 내 즉시 등장)
  endX:          number; // vw (기본 115 — 완전히 화면 밖)
  targetOpacity: number; // drift 중 표시 opacity
  driftDuration: number; // 초
  driftDelay:    number; // 초 (첫 등장 딜레이)
}

const vwToPx = (vw: number) => vw * window.innerWidth / 100;

export function useDriftAndDrag(config: DriftConfig) {
  const x       = useMotionValue(-300); // 초기: 화면 밖 (opacity 0이므로 안 보임)
  const opacity = useMotionValue(0);
  const innerY  = useMotionValue(0);   // drag 종료 후 Y spring-back 용

  const mountedRef      = useRef(true);
  const isDragging      = useRef(false);
  const driftControlRef = useRef<AnimationPlaybackControls | null>(null);
  // ref로 항상 최신 startDrift 참조 (stale closure 방지 — Bug 2 fix)
  const startDriftRef   = useRef<((fromX?: number) => void) | null>(null);

  const startDrift = useCallback((fromX?: number) => {
    if (!mountedRef.current) return;

    const startPx    = fromX ?? vwToPx(config.startX);
    const endPx      = vwToPx(config.endX);
    const fullRange  = Math.abs(vwToPx(config.endX) - vwToPx(config.startX));
    const remaining  = Math.abs(endPx - startPx);
    const duration   = config.driftDuration * Math.max(remaining / fullRange, 0.1);

    // fade-in (Bug 1 fix: opacity 0에서 시작 → 순간이동 flash 없음)
    animate(opacity, config.targetOpacity, { duration: 1.2, ease: 'easeIn' });

    driftControlRef.current?.stop();
    driftControlRef.current = animate(x, endPx, {
      duration,
      ease: 'linear',
      onComplete: () => {
        // Bug 3 fix: mountedRef guard
        if (!mountedRef.current) return;
        // 화면 밖 도달 → opacity 0 → teleport → 재시작
        opacity.set(0);
        x.set(vwToPx(config.startX));
        if (!isDragging.current) startDriftRef.current?.();
      },
    });
  }, [config, x, opacity]);

  // ref 항상 최신 유지 (Bug 2 fix)
  startDriftRef.current = startDrift;

  useEffect(() => {
    // Bug 5 fix: useEffect 내에서 실제 viewport 크기로 초기화
    x.set(vwToPx(config.startX));
    const timer = setTimeout(() => startDriftRef.current?.(), config.driftDelay * 1000);

    return () => {
      // Bug 3 fix: 언마운트 cleanup
      mountedRef.current = false;
      clearTimeout(timer);
      driftControlRef.current?.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDragStart = useCallback(() => {
    isDragging.current = true;
    driftControlRef.current?.stop();
  }, []);

  const onDragEnd = useCallback(() => {
    if (!mountedRef.current) return;
    isDragging.current = false;
    // Bug 4 fix: inner Y를 spring으로 0 복귀 (outer float 경로로 돌아옴)
    animate(innerY, 0, { ...SPRING.gentle });
    // 현재 x 위치에서 drift 재개
    startDriftRef.current?.(x.get());
  }, [x, innerY]);

  return { x, opacity, innerY, onDragStart, onDragEnd };
}
