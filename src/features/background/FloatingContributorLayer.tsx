import { useMemo } from 'react';
import { FloatingContributorCard } from './FloatingContributorCard';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CONTRIBUTORS } from '@/constants/config';

const WAVE_COUNT = 3;

export function FloatingContributorLayer() {
  const showFloating = useSettingsStore(s => s.showFloating);
  const isReduced    = useReducedMotion();
  const isMobile     = useMediaQuery('(max-width: 767px)');

  const contributorWaves = useMemo(() => {
    const active = import.meta.env.DEV
      ? CONTRIBUTORS
      : CONTRIBUTORS.filter(c => Math.random() < c.spawnProbability);
    return active.flatMap((contributor) =>
      Array.from({ length: WAVE_COUNT }, (_, waveIndex) => ({
        contributor,
        waveIndex,
        key: `${contributor.id}-wave${waveIndex}`,
      }))
    );
  }, []);

  if (isReduced || isMobile || !showFloating) return null;

  return (
    // absolute inset-0 → sized to the hero wrapper (not the viewport)
    // pointer-events-none on container, re-enabled per card
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="pointer-events-auto relative w-full h-full">
        {contributorWaves.map(({ contributor, waveIndex, key }) => (
          <FloatingContributorCard
            key={key}
            contributor={contributor}
            waveIndex={waveIndex}
          />
        ))}
      </div>
    </div>
  );
}
