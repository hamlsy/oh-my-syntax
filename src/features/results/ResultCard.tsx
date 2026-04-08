import { memo } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { DangerBadge } from './DangerBadge';
import { SPRING } from '@/constants/animation';
import { cn } from '@/utils/classNames';
import { CATEGORIES, CATEGORY_COLOR_MAP, ICON_MAP } from '@/data/categories';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useTelemetry } from '@/hooks/useTelemetry';
import { useRecentCommandsStore } from '@/store/useRecentCommandsStore';
import type { SearchResult } from '@/types/command';

interface ResultCardProps {
  result: SearchResult;
  isHighlighted: boolean;
}

export const ResultCard = memo(function ResultCard({ result, isHighlighted }: ResultCardProps) {
  const { command } = result;
  const { copied, error, copy } = useCopyToClipboard();
  const { track } = useTelemetry();
  const addRecentCommand = useRecentCommandsStore(s => s.addRecentCommand);

  const isMultiLine = command.command.includes('\n');
  const categoryColor = CATEGORY_COLOR_MAP[command.category];
  const borderStyle = {
    borderColor: isHighlighted
      ? `${categoryColor}55`
      : `${categoryColor}22`,
  };

  const categoryDef = CATEGORIES.find(c => c.id === command.category);
  const CategoryIcon = categoryDef ? (ICON_MAP[categoryDef.icon] ?? LayoutGrid) : LayoutGrid;

  const handleCopy = async () => {
    await copy(command.command);
    if (!error) {
      track(command.id);
      addRecentCommand({ commandId: command.id, command: command.command, title: command.title, category: command.category });
    }
  };

  return (
    <motion.div
      onClick={handleCopy}
      whileHover={{ scale: 1.002 }}
      transition={SPRING.snappy}
      style={borderStyle}
      className={cn(
        'group flex items-start gap-3 p-4 rounded-xl border transition-colors duration-150 cursor-pointer',
        'min-h-[72px]',
        isHighlighted
          ? 'bg-bg-elevated shadow-card-hover'
          : 'bg-bg-surface hover:bg-bg-elevated hover:shadow-card'
      )}
    >
      {/* Category icon */}
      <div className="shrink-0 mt-1">
        <CategoryIcon size={14} style={{ color: categoryColor }} />
      </div>

      {/* Left: content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1.5 flex-wrap">
          <code className={cn(
            'bg-bg-overlay text-text-primary font-mono text-sm rounded-lg px-3 leading-relaxed',
            isMultiLine
              ? 'block py-2 whitespace-pre-wrap overflow-x-auto w-full'
              : 'inline py-1 break-all whitespace-nowrap'
          )}>
            {command.command}
          </code>
          <DangerBadge
            show={!!command.isDangerous || !!command.dangerLevel}
            description={command.description}
            dangerLevel={command.dangerLevel}
          />
        </div>
        <p className="text-text-secondary text-xs leading-relaxed line-clamp-2">
          <span className="text-text-muted font-medium mr-1.5">{command.title}</span>
          {command.description}
        </p>
      </div>

      {/* Right: copy button */}
      <div className="shrink-0 mt-0.5">
        <CopyButton copied={copied} error={error} onCopy={handleCopy} />
      </div>
    </motion.div>
  );
}, (prev, next) =>
  prev.result.command.id === next.result.command.id &&
  prev.isHighlighted === next.isHighlighted
);
