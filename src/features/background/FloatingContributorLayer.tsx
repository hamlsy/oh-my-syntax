import { useMemo } from 'react';
import { FloatingContributorCard } from './FloatingContributorCard';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CONTRIBUTORS } from '@/constants/config';

export function FloatingContributorLayer() {
  const showFloating = useSettingsStore(s => s.showFloating);
  const isReduced    = useReducedMotion();
  const isMobile     = useMediaQuery('(max-width: 767px)');

  const activeContributors = useMemo(() => {
    return import.meta.env.DEV
      ? CONTRIBUTORS
      : CONTRIBUTORS.filter(c => Math.random() < c.spawnProbability);
  }, []);

  if (isReduced || isMobile || !showFloating) return null;

  return (
    // absolute inset-0 → sized to the hero wrapper (not the viewport)
    // pointer-events-none on container, re-enabled per card
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="relative w-full h-full">
        {activeContributors.map((contributor, index) => (
          <FloatingContributorCard
            key={contributor.id}
            contributor={contributor}
            contributorIndex={index}
            totalContributors={activeContributors.length}
          />
        ))}
      </div>
    </div>
  );
}
