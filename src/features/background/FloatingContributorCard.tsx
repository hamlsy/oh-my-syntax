import { motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useDriftAndDrag } from '@/hooks/useDriftAndDrag';
import type { Contributor } from '@/constants/config';

interface FloatingContributorCardProps {
  contributor: Contributor;
  contributorIndex: number;
  totalContributors: number;
}

// Y position distributed evenly across the hero section (10% ~ 80%)
function getInitialY(index: number, total: number): number {
  if (total <= 1) return 30;
  return 10 + (index / (total - 1)) * 70;
}

export function FloatingContributorCard({ contributor, contributorIndex, totalContributors }: FloatingContributorCardProps) {
  const setSelectedContributorId = useSettingsStore(s => s.setSelectedContributorId);
  const didDragRef = useRef(false);

  const randomRestartDelay = React.useMemo(() => Math.random() * 5 + 5, [contributor.id]);
  const floatAmplitude = 6 + (contributorIndex % 3) * 2;
  const driftDuration = 20 + (contributorIndex % 3) * 3;
  // Stagger initial appearance by contributor index
  const driftDelay = contributorIndex * 3;

  const { x, opacity, innerY, onDragStart, onDragEnd, isDragging } = useDriftAndDrag({
    startX: -18,
    endX: 115,
    targetOpacity: 0.88,
    driftDuration,
    driftDelay,
    restartDelay: randomRestartDelay,
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
    if (didDragRef.current) return;
    setSelectedContributorId(contributor.id);
  };

  const handleDragStart = () => {
    didDragRef.current = true;
    onDragStart();
  };

  const handleDragEnd = () => {
    onDragEnd();
    // Reset after the click event that follows pointerup has fired
    setTimeout(() => { didDragRef.current = false; }, 100);
  };

  const initialY = getInitialY(contributorIndex, totalContributors);
  const outerStyle = { position: 'absolute' as const, top: `${initialY}%`, left: 0 };
  const floatTransition = {
    duration: 8 + contributorIndex * 1.5,
    ease: 'easeInOut' as const,
    repeat: Infinity,
  };

  return (
    <motion.div
      style={outerStyle}
      animate={isDragging ? { y: 0 } : { y: [0, floatAmplitude, 0] }}
      transition={isDragging ? { duration: 0.2 } : floatTransition}
      className="pointer-events-auto"
    >
      <motion.div
        onClick={handleCardClick}
        style={cardStyle}
        drag
        dragElastic={0.8}
        dragTransition={{ power: 0.3, timeConstant: 500 }}
        whileDrag={{ scale: 1.05 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="flex items-center gap-2 bg-bg-surface border border-border-subtle rounded-full px-3 py-1.5 shadow-card cursor-grab active:cursor-grabbing"
        aria-label={contributor.name}
      >
        {/* Avatar */}
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0 select-none"
          style={{
            backgroundColor: accentColor ? `${accentColor}22` : '#33333322',
            color: accentColor ?? '#888888',
          }}
        >
          {contributor.name[0].toUpperCase()}
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
          <img
            src="https://cdn.simpleicons.org/github/666666"
            alt="GitHub"
            style={{ width: '10px', height: '10px' }}
          />
        </button>
      </motion.div>
    </motion.div>
  );
}
