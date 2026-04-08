import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useDriftAndDrag } from '@/hooks/useDriftAndDrag';
import type { Contributor } from '@/constants/config';

interface FloatingContributorCardProps {
  contributor: Contributor;
  waveIndex:   number;
}

// 3개 wave: 각각 10초 간격으로 등장 → 항상 10초 이내에 누군가 나타남
// driftDuration + restartDelay = 사이클 길이
// wave 0: delay=0s, wave 1: delay=10s, wave 2: delay=20s → 매 10초마다 등장 보장
const WAVE_CONFIGS = [
  { initialY: 28, floatAmplitude: 8,  driftDuration: 22, driftDelay: 0,  restartDelay: 8 },
  { initialY: 52, floatAmplitude: 10, driftDuration: 25, driftDelay: 10, restartDelay: 8 },
  { initialY: 72, floatAmplitude: 6,  driftDuration: 20, driftDelay: 20, restartDelay: 8 },
] as const;

export function FloatingContributorCard({ contributor, waveIndex }: FloatingContributorCardProps) {
  const setSelectedContributorId = useSettingsStore(s => s.setSelectedContributorId);

  const cfg = WAVE_CONFIGS[waveIndex % WAVE_CONFIGS.length];
  const { x, opacity, innerY, onDragStart, onDragEnd, isDragging } = useDriftAndDrag({
    startX:        -18,
    endX:          115,
    targetOpacity: 0.88,
    driftDuration: cfg.driftDuration,
    driftDelay:    cfg.driftDelay,
    restartDelay:  cfg.restartDelay,
  });

  const accentColor = contributor.color;
  const cardStyle = {
    x,
    opacity,
    y: innerY,
    ...(accentColor && { borderColor: `${accentColor}55` }),
  } as React.CSSProperties & object;

  const handleGithubClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(contributor.githubUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = () => {
    setSelectedContributorId(contributor.id);
  };

  const outerStyle = { position: 'fixed' as const, top: `${cfg.initialY}vh`, left: 0 };
  const floatTransition = {
    duration: 8 + waveIndex * 1.5,
    ease: 'easeInOut' as const,
    repeat: Infinity,
  };

  return (
    <motion.div
      style={outerStyle}
      animate={isDragging ? { y: 0 } : { y: [0, cfg.floatAmplitude, 0] }}
      transition={isDragging ? { duration: 0.2 } : floatTransition}
    >
      <motion.div
        onClick={handleCardClick}
        style={cardStyle}
        drag
        dragElastic={0.8}
        dragTransition={{ power: 0.3, timeConstant: 500 }}
        whileDrag={{ scale: 1.05 }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className="flex items-center gap-2 bg-bg-surface border border-border-subtle rounded-full px-3 py-1.5 shadow-card cursor-grab active:cursor-grabbing"
        aria-label={contributor.name}
      >
        {/* Avatar */}
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold overflow-hidden shrink-0"
          style={{
            backgroundColor: accentColor ? `${accentColor}22` : undefined,
            color: accentColor ?? undefined,
          }}
        >
          {contributor.avatarUrl ? (
            <img
              src={contributor.avatarUrl}
              alt={contributor.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            contributor.name[0]
          )}
        </div>

        {/* Name + Role */}
        <div className="text-left">
          <p className="text-text-primary text-2xs font-semibold leading-none">{contributor.name}</p>
          <p className="text-text-muted text-2xs leading-none mt-0.5">{contributor.role}</p>
        </div>

        {/* GitHub icon button — only click triggers navigation, drag is unaffected */}
        <button
          onClick={handleGithubClick}
          onPointerDown={(e) => e.stopPropagation()}
          className="ml-0.5 p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-colors shrink-0"
          aria-label={`${contributor.name} GitHub`}
        >
          <Github size={10} />
        </button>
      </motion.div>
    </motion.div>
  );
}
