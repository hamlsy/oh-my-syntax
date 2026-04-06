import { memo } from 'react';
import { motion } from 'framer-motion';
import { CopyButton } from './CopyButton';
import { DangerBadge } from './DangerBadge';
import { SPRING } from '@/constants/animation';
import { cn } from '@/utils/classNames';
import type { SearchResult } from '@/types/command';

interface ResultCardProps {
  result: SearchResult;
  isHighlighted: boolean;
  index: number;
}

export const ResultCard = memo(function ResultCard({ result, isHighlighted, index }: ResultCardProps) {
  const { command } = result;
  const isMultiLine = command.command.includes('\n');

  return (
    <motion.div
      whileHover={{ scale: 1.002 }}
      transition={SPRING.snappy}
      className={cn(
        'group flex items-start gap-3 p-4 rounded-xl border transition-colors duration-150 cursor-default',
        'min-h-[72px]',
        isHighlighted
          ? 'bg-bg-elevated border-border-default shadow-card-hover'
          : 'bg-bg-surface border-border-subtle hover:bg-bg-elevated hover:border-border-default hover:shadow-card'
      )}
    >
      {/* Left: content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1.5 flex-wrap">
          <code className={cn(
            'bg-bg-overlay text-text-primary font-mono text-sm rounded-lg px-3 leading-relaxed',
            isMultiLine
              ? 'block py-2 whitespace-pre overflow-x-auto max-h-32 w-full'
              : 'inline py-1 break-all whitespace-nowrap'
          )}>
            {command.command}
          </code>
          <DangerBadge show={!!command.isDangerous} description={command.description} />
        </div>
        <p className="text-text-secondary text-xs leading-relaxed line-clamp-2">
          <span className="text-text-muted font-medium mr-1.5">{command.title}</span>
          {command.description}
        </p>
      </div>

      {/* Right: copy button */}
      <div className="shrink-0 mt-0.5">
        <CopyButton
          command={command.command}
          commandId={command.id}
          title={command.title}
          category={command.category}
        />
      </div>
    </motion.div>
  );
}, (prev, next) =>
  prev.result.command.id === next.result.command.id &&
  prev.isHighlighted === next.isHighlighted &&
  prev.index === next.index
);
