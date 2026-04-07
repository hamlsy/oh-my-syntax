import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SPRING } from '@/constants/animation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useRecentCommandsStore } from '@/store/useRecentCommandsStore';
import { useMascotBubble } from '@/hooks/useMascotBubble';
import { MascotSpeechBubble } from './MascotSpeechBubble';
import { cn } from '@/utils/classNames';

const MASCOT_PATH = '/mascot.gif';
// TODO: 2배속 마스코트 gif를 /mascot-fast.gif 경로에 추가해주세요.
//       일반 속도: /mascot.gif | 2배속(클릭 중): /mascot-fast.gif
//       파일 형식은 gif여야 하며 public/ 폴더에 위치해야 합니다.
const MASCOT_FAST_PATH = '/mascot-fast.gif';

// 1. [최적화] 깜빡임 방지를 위한 이미지 프리로딩
if (typeof window !== 'undefined') {
  const img = new Image();
  img.src = MASCOT_FAST_PATH;
}
function MascotDisplay({ isReduced }: { isReduced: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // 1. 상태 분리: 물리적 눌림(isPressed) vs GIF 속도(isSpeedUp)
  const [isPressed, setIsPressed] = useState(false);
  const [isSpeedUp, setIsSpeedUp] = useState(false);

  const speedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { currentPhrase, triggerClickBubble } = useMascotBubble();

  const handlePointerDown = () => {
    if (errored) return;

    // A. 물리적 눌림 효과 즉시 시작
    setIsPressed(true);
    triggerClickBubble();

    // B. GIF 속도 업 상태 시작
    setIsSpeedUp(true);

    // C. 기존 타이머가 있다면 초기화 (연속 클릭 대응)
    if (speedTimerRef.current) clearTimeout(speedTimerRef.current);

    // D. 0.8초(800ms) 후에 GIF만 원래대로 복구
    speedTimerRef.current = setTimeout(() => {
      setIsSpeedUp(false);
      speedTimerRef.current = null;
    }, 800);
  };

  const handlePointerUp = () => {
    // 손을 떼면 물리적 눌림 효과만 즉시 해제 (Scale은 원래대로)
    setIsPressed(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={isReduced ? { duration: 0 } : SPRING.entrance}
      className="flex justify-center mt-8 mb-2"
    >
      <div className="relative w-40 h-40 md:w-48 md:h-48">
        <MascotSpeechBubble phrase={currentPhrase} />

        {!errored && (
          <motion.img
            // 2. 이미지 소스는 isSpeedUp 상태에 따라 결정 (0.8초 유지)
            src={isSpeedUp ? MASCOT_FAST_PATH : MASCOT_PATH}
            alt="Mascot"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}

            // 3. 애니메이션은 isPressed(누르고 있는 동안)에만 반응
            animate={{
              scale: isPressed ? 0.92 : 1,
            }}
            transition={isReduced ? { duration: 0 } : {
              type: "spring",
              stiffness: 600, // 눌릴 때 더 빠르게
              damping: 15,
              mass: 0.4
            }}

            className={cn(
              'w-full h-full object-contain cursor-pointer touch-none select-none',
              'transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0',
            )}
            draggable={false}
          />
        )}

        {(!loaded || errored) && (
          <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 bg-surface/40">
            <span className="text-3xl select-none">🐱</span>
            <span className="text-text-muted text-xs font-mono">mascot.gif</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
export function HeroSection() {
  const { t } = useTranslation();
  const isReduced = useReducedMotion();

  // Compact mode when user has any recent commands — reduces bottom padding
  // to create natural visual proximity with the RecentCommandsSection below.
  // Uses length > 0 (not isVisible) so hero stays compact even while searching.
  const compact = useRecentCommandsStore(s => s.recentCommands.length > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = isReduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
      hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: SPRING.entrance },
    };

  return (
    // Mi-3: layout="position" animates the hero's position when compact changes,
    // preventing an instant jump when RecentCommandsSection appears for the first time.
    <motion.div
      layout="position"
      transition={SPRING.smooth}
      className={cn('text-center px-4', compact ? 'pt-16 pb-6' : 'py-16')}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        variants={itemVariants}
        className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight"
      >
        <span className="bg-gradient-to-r from-text-primary via-accent to-text-primary bg-clip-text text-transparent">
          {t('hero.title')}
        </span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="text-text-secondary text-lg md:text-xl mb-3 font-medium"
      >
        {t('hero.subtitle')}
      </motion.p>

      <motion.div variants={itemVariants}>
        <MascotDisplay isReduced={isReduced} />
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="text-text-muted text-sm font-mono mt-6"
      >
        {t('hero.hint')}
      </motion.p>
    </motion.div>
  );
}