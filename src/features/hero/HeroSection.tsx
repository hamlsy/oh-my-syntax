import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SPRING } from '@/constants/animation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function HeroSection() {
  const { t } = useTranslation();
  const isReduced = useReducedMotion();

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
    <motion.div
      className="text-center py-16 px-4"
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
