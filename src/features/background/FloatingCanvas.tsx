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

  const WAVE_COUNT = 3;

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

  // StarField + grid are always rendered — they're pure CSS and have negligible cost.
  // Only the heavy floating items (snippets + contributor cards) are gated.
  const showFloatingItems = !isReduced && !isMobile && showFloating;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Layer 1: Star field (3-layer parallax) — always visible */}
      <StarField />

      {/* Grid overlay — always visible */}
      <div className="absolute inset-0 grid-overlay opacity-50" />

      {/* Layer 2 & 3: Floating items — only on desktop with motion + setting enabled */}
      {showFloatingItems && (
        <>
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

          <div className="pointer-events-auto">
            {contributorWaves.map(({ contributor, waveIndex, key }) => (
              <FloatingContributorCard
                key={key}
                contributor={contributor}
                waveIndex={waveIndex}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
