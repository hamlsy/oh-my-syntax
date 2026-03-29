import { motion } from 'framer-motion';
import { cn } from '@/utils/classNames';
import { useDriftAndDrag } from '@/hooks/useDriftAndDrag';
import type { FloatingItem } from '@/hooks/useFloatingItems';

type FloatingCodeSnippetProps = Omit<FloatingItem, 'id'>;

export function FloatingCodeSnippet({
  snippet,
  startX,
  endX,
  targetOpacity,
  driftDuration,
  driftDelay,
  initialY,
  floatAmplitude,
  floatDuration,
  floatDelay,
  fontSize,
  colorClass,
}: FloatingCodeSnippetProps) {
  const { x, opacity, innerY, onDragStart, onDragEnd } = useDriftAndDrag({
    startX,
    endX,
    targetOpacity,
    driftDuration,
    driftDelay,
  });

  // Bug 4 fix: Wrapper 패턴 — outer(float Y) / inner(drift X + drag) 분리
  return (
    <motion.div
      className="fixed pointer-events-none"
      style={{ top: `${initialY}vh`, left: 0 }}
      animate={{ y: [0, floatAmplitude, 0] }}
      transition={{
        duration: floatDuration,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: floatDelay,
      }}
      aria-hidden="true"
    >
      <motion.div
        className={cn(
          'font-mono select-none cursor-grab active:cursor-grabbing pointer-events-auto',
          fontSize,
          colorClass,
        )}
        style={{ x, opacity, y: innerY }}
        drag
        dragElastic={0.8}
        dragTransition={{ power: 0.3, timeConstant: 500 }}
        whileDrag={{ scale: 1.1 }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {snippet}
      </motion.div>
    </motion.div>
  );
}
