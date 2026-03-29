import { useMemo } from 'react';
import { FLOATING_SNIPPETS } from '@/constants/config';
import type { DriftConfig } from './useDriftAndDrag';

export interface FloatingItem {
  id:             string;
  snippet:        string;
  // Drift config
  startX:        number; // vw
  endX:          number; // vw
  targetOpacity: number;
  driftDuration: number; // 초
  driftDelay:    number; // 초
  // Float animation (outer wrapper Y)
  initialY:      number; // vh
  floatAmplitude: number; // px
  floatDuration:  number; // 초
  floatDelay:     number; // 초
  // Visual
  fontSize:   'text-xs' | 'text-sm';
  colorClass: string;
}

export type { DriftConfig };

const COLOR_CLASSES = [
  'text-syntax-keyword',
  'text-syntax-string',
  'text-syntax-comment',
  'text-syntax-number',
  'text-syntax-function',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function useFloatingItems(count = 8): FloatingItem[] {
  return useMemo(() => {
    const rng = seededRandom(42);
    return Array.from({ length: count }, (_, i) => ({
      id:             `float-${i}`,
      snippet:        FLOATING_SNIPPETS[Math.floor(rng() * FLOATING_SNIPPETS.length)],
      // 화면 왼쪽 밖에서 시작, 오른쪽으로 드리프트
      startX:        -(10 + Math.floor(rng() * 15)), // -10 ~ -25vw
      endX:          115,
      targetOpacity: 0.05 + rng() * 0.07,
      driftDuration: 60 + Math.floor(rng() * 50),
      driftDelay:    Math.floor(rng() * 20),
      initialY:      5 + Math.floor(rng() * 85),  // 5~90vh
      floatAmplitude: 8 + Math.floor(rng() * 16),
      floatDuration:  18 + Math.floor(rng() * 20),
      floatDelay:     rng() * 6,
      fontSize:       rng() > 0.5 ? 'text-sm' : 'text-xs',
      colorClass:     COLOR_CLASSES[Math.floor(rng() * COLOR_CLASSES.length)],
    }));
  }, [count]);
}
