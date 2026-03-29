import { useMemo } from 'react';

const STAR_LAYERS = [
  { seed: 11111, count: 120, sizeThreshold: 0.95, duration: '160s', opacity: 0.5 },
  { seed: 22222, count: 60, sizeThreshold: 0.85, duration: '100s', opacity: 0.7 },
  { seed: 33333, count: 20, sizeThreshold: 0.50, duration: '60s', opacity: 1.0 },
] as const;

function generateTiledStars(count: number, seed: number, sizeThreshold: number): string {
  const stars: string[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
  const colors = ['#ffffff', '#a5b4fc', '#c4b5fd', '#93c5fd'];

  for (let i = 0; i < count; i++) {
    const x = Math.floor(rand() * 100);
    const y = Math.floor(rand() * 100);
    const size = rand() > sizeThreshold ? '1.5px' : '1px';
    const color = colors[Math.floor(rand() * colors.length)];
    // 원본 타일 + -100vw 복사본 → 우측 이동(0vw -> 100vw) 시 빈틈없이 채워짐
    stars.push(`${x}vw ${y}vh 0 ${size} ${color}`);
    stars.push(`${x - 100}vw ${y}vh 0 ${size} ${color}`);
  }
  return stars.join(', ');
}

export function StarField() {
  const layers = useMemo(
    () => STAR_LAYERS.map(l => ({
      ...l,
      boxShadow: generateTiledStars(l.count, l.seed, l.sizeThreshold),
    })),
    [],
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {layers.map((layer) => (
        <div
          key={layer.seed}
          className="star-layer"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            top: 0,
            left: 0,
            borderRadius: '50%',
            boxShadow: layer.boxShadow,
            opacity: layer.opacity,
            // @ts-expect-error CSS custom properties
            '--layer-duration': layer.duration,
          }}
        />
      ))}
    </div>
  );
}
