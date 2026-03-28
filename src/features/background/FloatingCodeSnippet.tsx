import { motion } from 'framer-motion';
import { cn } from '@/utils/classNames';

interface FloatingCodeSnippetProps {
  snippet: string;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
  opacity: number;
  fontSize: 'text-xs' | 'text-sm';
  colorClass: string;
}

export function FloatingCodeSnippet({
  snippet,
  initialX,
  initialY,
  duration,
  delay,
  opacity,
  fontSize,
  colorClass,
}: FloatingCodeSnippetProps) {
  const xRange = [0, 20, -15, 10, -5, 0];
  const yRange = [0, -30, 15, -20, 10, 0];
  const rotateRange = [-2, 3, -1, 4, -2, 0];

  return (
    <motion.div
      className={cn(
        'absolute font-mono pointer-events-none select-none',
        fontSize,
        colorClass
      )}
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        opacity,
      }}
      animate={{
        x: xRange,
        y: yRange,
        rotate: rotateRange,
      }}
      transition={{
        duration,
        delay,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'mirror',
      }}
      aria-hidden="true"
    >
      {snippet}
    </motion.div>
  );
}
