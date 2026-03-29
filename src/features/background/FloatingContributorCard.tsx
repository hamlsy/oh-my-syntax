import { motion } from 'framer-motion';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useDriftAndDrag } from '@/hooks/useDriftAndDrag';
import type { Contributor } from '@/constants/config';

interface FloatingContributorCardProps {
  contributor: Contributor;
  index:       number;
}

// creator: 즉시 뷰포트 내 등장 (startX 양수)
// 기타: 화면 밖에서 진입 (startX 음수)
const CARD_CONFIGS = [
  { startX: 55, initialY: 72, floatAmplitude: 8,  driftDelay: 0,  driftDuration: 70 },
  { startX: -20, initialY: 60, floatAmplitude: 12, driftDelay: 8,  driftDuration: 80 },
  { startX: -15, initialY: 82, floatAmplitude: 6,  driftDelay: 16, driftDuration: 75 },
  { startX: -18, initialY: 68, floatAmplitude: 10, driftDelay: 24, driftDuration: 85 },
] as const;

export function FloatingContributorCard({ contributor, index }: FloatingContributorCardProps) {
  const setSelectedContributorId = useSettingsStore(s => s.setSelectedContributorId);

  const cfg = CARD_CONFIGS[index % CARD_CONFIGS.length];
  const { x, opacity, innerY, onDragStart, onDragEnd } = useDriftAndDrag({
    startX:        cfg.startX,
    endX:          115,
    targetOpacity: 0.85,
    driftDuration: cfg.driftDuration + (contributor.id.length % 15),
    driftDelay:    cfg.driftDelay,
  });

  const isCreator = contributor.id === 'creator';

  const innerProps = {
    style: { x, opacity, y: innerY } as React.CSSProperties & object,
    drag: true as const,
    dragElastic: 0.8 as const,
    dragTransition: { power: 0.3, timeConstant: 500 },
    whileDrag: { scale: 1.05 },
    onDragStart,
    onDragEnd,
    className: 'flex items-center gap-2 bg-bg-surface border border-border-subtle rounded-full px-3 py-1.5 shadow-card cursor-grab active:cursor-grabbing',
    'aria-label': isCreator ? `${contributor.name} GitHub` : contributor.name,
  };

  const avatar = (
    <div className="w-5 h-5 rounded-full bg-accent-soft flex items-center justify-center text-2xs font-bold text-accent overflow-hidden shrink-0">
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
  );

  const label = (
    <div className="text-left">
      <p className="text-text-primary text-2xs font-semibold leading-none">{contributor.name}</p>
      <p className="text-text-muted text-2xs leading-none mt-0.5">{contributor.role}</p>
    </div>
  );

  // Outer: float Y animation (drag 없음)
  const outerStyle = { position: 'fixed' as const, top: `${cfg.initialY}vh`, left: 0 };
  const floatTransition = {
    duration: 8 + index * 1.5,
    ease: 'easeInOut' as const,
    repeat: Infinity,
  };

  return (
    <motion.div
      style={outerStyle}
      animate={{ y: [0, cfg.floatAmplitude, 0] }}
      transition={floatTransition}
    >
      {isCreator ? (
        // UX 2 fix: motion.a — 시맨틱 링크 + drag 동시 지원
        // drag threshold 3px 미만 = href 기본 동작(탭으로 이동), 초과 = drag
        <motion.a
          href={contributor.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          {...innerProps}
        >
          {avatar}
          {label}
        </motion.a>
      ) : (
        <motion.div
          onClick={() => setSelectedContributorId(contributor.id)}
          {...innerProps}
        >
          {avatar}
          {label}
        </motion.div>
      )}
    </motion.div>
  );
}
