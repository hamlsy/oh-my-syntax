import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SPRING } from '@/constants/animation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useRecentCommandsStore } from '@/store/useRecentCommandsStore';
import { cn } from '@/utils/classNames';

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

      <motion.p
        variants={itemVariants}
        className="text-text-muted text-sm font-mono"
      >
        {t('hero.hint')}
      </motion.p>
    </motion.div>
  );
}
