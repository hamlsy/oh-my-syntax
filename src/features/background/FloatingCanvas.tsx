import { useMemo } from 'react';
import { StarField } from './StarField';
import { FloatingCodeSnippet } from './FloatingCodeSnippet';
import { FloatingContributorCard } from './FloatingContributorCard';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useFloatingItems } from '@/hooks/useFloatingItems';
import { CONTRIBUTORS } from '@/constants/config';

export function FloatingCanvas() {
  const showFloating = useSettingsStore(s => s.showFloating);
  const isReduced    = useReducedMotion();
  // 성능 3 fix: useMediaQuery로 반응형 체크 (창 리사이즈/회전 대응)
  const isMobile     = useMediaQuery('(max-width: 767px)');
  const floatingItems = useFloatingItems(8);

  const activeContributors = useMemo(() => {
    if (import.meta.env.DEV) return CONTRIBUTORS;
    return CONTRIBUTORS.filter(c => Math.random() < c.spawnProbability);
  }, []);

  if (isReduced || isMobile || !showFloating) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Layer 1: Star field (3-레이어 parallax) */}
      <StarField />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-50" />

      {/* Layer 2: Floating code snippets (drift + drag) */}
      {floatingItems.map(item => (
        <FloatingCodeSnippet
          key={item.id}
          snippet={item.snippet}
          startX={item.startX}
          endX={item.endX}
          targetOpacity={item.targetOpacity}
          driftDuration={item.driftDuration}
          driftDelay={item.driftDelay}
          initialY={item.initialY}
          floatAmplitude={item.floatAmplitude}
          floatDuration={item.floatDuration}
          floatDelay={item.floatDelay}
          fontSize={item.fontSize}
          colorClass={item.colorClass}
        />
      ))}

      {/* Layer 3: Contributor cards (pointer-events: auto) */}
      <div className="pointer-events-auto">
        {activeContributors.map((contributor, index) => (
          <FloatingContributorCard
            key={contributor.id}
            contributor={contributor}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
