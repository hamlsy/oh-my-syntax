import { useMemo } from 'react';
import { StarField } from './StarField';
import { FloatingCodeSnippet } from './FloatingCodeSnippet';
import { FloatingContributorCard } from './FloatingContributorCard';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useFloatingItems } from '@/hooks/useFloatingItems';
import { CONTRIBUTORS } from '@/constants/config';

export function FloatingCanvas() {
  const showFloating = useSettingsStore(s => s.showFloating);
  const isReduced = useReducedMotion();
  const floatingItems = useFloatingItems(8);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Roll spawn probabilities once per mount
  const activeContributors = useMemo(() => {
    if (import.meta.env.DEV) return CONTRIBUTORS; // Show all in dev
    return CONTRIBUTORS.filter(c => Math.random() < c.spawnProbability);
  }, []);

  if (isReduced || isMobile || !showFloating) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Layer 1: Star field */}
      <StarField />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-50" />

      {/* Layer 2: Floating code snippets */}
      {floatingItems.map(item => (
        <FloatingCodeSnippet
          key={item.id}
          snippet={item.snippet}
          initialX={item.x}
          initialY={item.y}
          duration={item.duration}
          delay={item.delay}
          opacity={item.opacity}
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
