import { useMemo } from 'react';
import { FLOATING_SNIPPETS } from '@/constants/config';

interface FloatingItem {
  id: string;
  snippet: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
  fontSize: 'text-xs' | 'text-sm';
  colorClass: string;
}

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
      id: `float-${i}`,
      snippet: FLOATING_SNIPPETS[Math.floor(rng() * FLOATING_SNIPPETS.length)],
      x: Math.floor(rng() * 90),
      y: Math.floor(rng() * 90),
      duration: 25 + Math.floor(rng() * 30),
      delay: Math.floor(rng() * 10),
      opacity: 0.05 + rng() * 0.07,
      fontSize: rng() > 0.5 ? 'text-sm' : 'text-xs',
      colorClass: COLOR_CLASSES[Math.floor(rng() * COLOR_CLASSES.length)],
    }));
  }, [count]);
}
