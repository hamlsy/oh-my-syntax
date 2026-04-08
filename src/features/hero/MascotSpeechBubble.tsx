import { AnimatePresence, motion } from 'framer-motion';
import { SPRING } from '@/constants/animation';

interface MascotSpeechBubbleProps {
  phrase: string | null;
}

const bubbleVariants = {
  hidden: { opacity: 0, scale: 0.7, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...SPRING.snappy },
  },
  exit: { opacity: 0, scale: 0.7, y: 6, transition: { duration: 0.15 } },
};

/**
 * "Thinking" style speech bubble rendered above the mascot.
 * Purely presentational — all state is managed by useMascotBubble.
 *
 * Visual structure:
 *   ┌──────────────┐
 *   │  phrase text │  ← rounded box
 *   └──────────────┘
 *        ●  ●  ●      ← three dots leading down to the mascot
 */
export function MascotSpeechBubble({ phrase }: MascotSpeechBubbleProps) {
  return (
    <AnimatePresence>
      {phrase && (
        <motion.div
          key={phrase}
          variants={bubbleVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          /* 말풍선 본체는 마스코트 기준 오른쪽 위에 배치 */
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-start pointer-events-none select-none"
          style={{ marginLeft: '8.75rem' }}
          style={{ zIndex: 10 }}
        >
          {/* Bubble box */}
          <div className="relative px-3 py-1.5 rounded-2xl bg-bg-elevated border border-border-subtle shadow-card whitespace-nowrap">
            <span className="text-text-primary text-xs font-medium">{phrase}</span>
          </div>

          {/* Thinking dots (꼬리) */}
          <div
            /* - origin-top-left: 가장 큰 점(맨 위)을 기준으로 회전
               - rotate-[35deg]: 시계 방향으로 35도 회전하여 '왼쪽 아래'를 향하게 함
               - ml-2 mt-0.5: 회전 후 말풍선 박스와 자연스럽게 연결되도록 위치 미세 조정
            */
            className="flex flex-col items-center gap-[3px] mt-0.5 ml-2 origin-top-left rotate-[35deg]"
          >
            <span className="w-2 h-2 rounded-full bg-bg-elevated border border-border-subtle" />
            <span className="w-1.5 h-1.5 rounded-full bg-bg-elevated border border-border-subtle" />
            <span className="w-1 h-1 rounded-full bg-bg-elevated border border-border-subtle" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}