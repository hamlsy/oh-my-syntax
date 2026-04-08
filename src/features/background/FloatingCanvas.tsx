import { StarField } from './StarField';
import { FloatingCodeSnippet } from './FloatingCodeSnippet';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useFloatingItems } from '@/hooks/useFloatingItems';

export function FloatingCanvas() {
  const showFloating = useSettingsStore(s => s.showFloating);
  const isReduced    = useReducedMotion();
  const isMobile     = useMediaQuery('(max-width: 767px)');
  const floatingItems = useFloatingItems(8);

  // StarField + grid are always rendered — they're pure CSS and have negligible cost.
  // Only the heavy floating items (code snippets) are gated.
  // Contributor cards are rendered inside the hero wrapper (FloatingContributorLayer).
  const showFloatingItems = !isReduced && !isMobile && showFloating;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Layer 1: Star field (3-layer parallax) — always visible */}
      <StarField />

      {/* Grid overlay — always visible */}
      <div className="absolute inset-0 grid-overlay opacity-50" />

      {/* Layer 2: Floating code snippets — only on desktop with motion + setting enabled */}
      {showFloatingItems && floatingItems.map(item => (
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
    </div>
  );
}
