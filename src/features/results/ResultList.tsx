import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ResultCard } from './ResultCard';
import { useSearchStore } from '@/store/useSearchStore';
import { SPRING, DURATION } from '@/constants/animation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { SearchResult } from '@/types/command';

interface ResultListProps {
  results: SearchResult[];
}

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: DURATION.staggerDelay,
    },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: SPRING.smooth },
  exit:    { opacity: 0, y: -6, transition: { duration: DURATION.exitFast } },
};

const itemVariantsReduced = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } },
  exit:    { opacity: 0, transition: { duration: 0.1 } },
};

export function ResultList({ results }: ResultListProps) {
  const { t } = useTranslation();
  const highlightedIndex = useSearchStore(s => s.highlightedIndex);
  const query = useSearchStore(s => s.query);
  const isReduced = useReducedMotion();

  const variants = isReduced ? itemVariantsReduced : itemVariants;

  if (results.length === 0 && query.trim()) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-text-secondary text-sm">
          {t('search.noResults', { query })}
        </p>
        <p className="text-text-muted text-xs mt-2">
          {t('search.noResultsHint')}
        </p>
      </motion.div>
    );
  }

  return (
    <div
      style={{ maxHeight: '600px', overflowY: 'auto' }}
      className="pr-1 -mr-1"
    >
      <motion.ul
        role="listbox"
        id="result-listbox"
        className="flex flex-col gap-2"
        variants={isReduced ? undefined : listVariants}
        initial="hidden"
        animate="visible"
        aria-label="Search results"
      >
        <AnimatePresence mode="popLayout">
          {results.map((result, index) => (
            <motion.li
              key={result.command.id}
              layout
              variants={variants}
              exit="exit"
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <ResultCard
                result={result}
                isHighlighted={index === highlightedIndex}
                index={index}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
