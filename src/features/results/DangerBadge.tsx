import { useTranslation } from 'react-i18next';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/classNames';
import type { DangerLevel } from '@/types/command';

interface DangerBadgeProps {
  show: boolean;
  description?: string;
  dangerLevel?: DangerLevel;
}

const LEVEL_STYLES: Record<DangerLevel, string> = {
  low:      'bg-warning/10 text-warning border-warning/20',
  medium:   'bg-warning/10 text-warning border-warning/20',
  high:     'bg-error/10 text-error border-error/20',
  critical: 'bg-error/10 text-error border-error/20',
};

const LEVEL_ICONS: Record<DangerLevel, string> = {
  low:      '⚠',
  medium:   '⚠',
  high:     '🚨',
  critical: '🚨',
};

export function DangerBadge({ show, description, dangerLevel }: DangerBadgeProps) {
  const { t } = useTranslation();

  if (!show) return null;

  const level = dangerLevel ?? 'medium';
  const styleClass = LEVEL_STYLES[level];
  const icon = LEVEL_ICONS[level];

  return (
    <Tooltip content={description ?? t('danger.tooltip')}>
      <span
        className={cn(
          'inline-flex items-center gap-1 text-2xs font-semibold rounded-full px-2 py-0.5',
          'border',
          styleClass
        )}
      >
        {icon} {t('danger.badge')}
      </span>
    </Tooltip>
  );
}
