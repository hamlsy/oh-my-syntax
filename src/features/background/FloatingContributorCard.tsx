import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SPRING } from '@/constants/animation';
import type { Contributor } from '@/constants/config';

interface FloatingContributorCardProps {
  contributor: Contributor;
  index: number;
}

function seededFloat(seed: string, offset: number): number[] {
  let s = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + offset;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff) * 2 - 1;
  };
  return [0, rand() * 25, rand() * -15, rand() * 20, rand() * -10, 0];
}

export function FloatingContributorCard({ contributor, index }: FloatingContributorCardProps) {
  const { t } = useTranslation();
  const setShowEasterEgg = useSettingsStore(s => s.setShowEasterEgg);

  const xRange = seededFloat(contributor.id, 1);
  const yRange = seededFloat(contributor.id, 2);
  const duration = 55 + (contributor.id.length % 20);

  return (
    <motion.button
      className="absolute bottom-24 right-8 md:right-16 z-10 cursor-pointer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.15, scale: 1 }}
      transition={{ ...SPRING.gentle, delay: 3 + index * 1.5 }}
      whileHover={{ opacity: 0.92, scale: 1.08, transition: SPRING.snappy }}
      onClick={() => setShowEasterEgg(true)}
      style={{ x: 0, y: 0 }}
      aria-label={`${t('easter.cardLabel')} ${contributor.name}`}
    >
      <motion.div
        animate={{ x: xRange, y: yRange, rotate: [-4, 3, -2, 5, -3, 0] }}
        transition={{
          duration,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'mirror',
        }}
        className="flex items-center gap-2 bg-bg-surface border border-border-subtle rounded-full px-3 py-1.5 shadow-card"
      >
        <div className="w-5 h-5 rounded-full bg-accent-soft flex items-center justify-center text-2xs font-bold text-accent overflow-hidden">
          {contributor.avatarUrl ? (
            <img
              src={contributor.avatarUrl}
              alt={contributor.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            contributor.name[0]
          )}
        </div>
        <div className="text-left">
          <p className="text-text-primary text-2xs font-semibold leading-none">{contributor.name}</p>
          <p className="text-text-muted text-2xs leading-none mt-0.5">{contributor.role}</p>
        </div>
      </motion.div>
    </motion.button>
  );
}
