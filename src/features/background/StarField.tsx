import { useMemo } from 'react';

function generateStaticStars(count: number): string {
  const stars: string[] = [];
  let seed = 12345;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  const colors = ['#ffffff', '#a5b4fc', '#c4b5fd', '#93c5fd'];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rand() * 100);
    const y = Math.floor(rand() * 100);
    const size = rand() > 0.8 ? '1.5px' : '1px';
    const color = colors[Math.floor(rand() * colors.length)];
    stars.push(`${x}vw ${y}vh 0 ${size} ${color}`);
  }
  return stars.join(', ');
}

interface TwinkleStar {
  id: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  size: number;
}

export function StarField() {
  const staticStars = useMemo(() => generateStaticStars(200), []);

  const twinkleStars = useMemo((): TwinkleStar[] => {
    let seed = 99887;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 0xffffffff;
    };

    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.floor(rand() * 100),
      y: Math.floor(rand() * 100),
      duration: 2 + rand() * 3,
      delay: rand() * 4,
      size: rand() > 0.5 ? 2 : 1.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Static stars via box-shadow */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: staticStars,
          width: 1,
          height: 1,
          top: 0,
          left: 0,
          borderRadius: '50%',
        }}
      />

      {/* Twinkling stars */}
      {twinkleStars.map(star => (
        <span
          key={star.id}
          className="absolute rounded-full star-twinkle bg-white"
          style={{
            left: `${star.x}vw`,
            top: `${star.y}vh`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            // @ts-expect-error CSS custom properties
            '--duration': `${star.duration}s`,
            '--delay': `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
