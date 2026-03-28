import { useTranslation } from 'react-i18next';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/classNames';

interface DangerBadgeProps {
  show: boolean;
  description?: string;
}

export function DangerBadge({ show, description }: DangerBadgeProps) {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <Tooltip content={description ?? t('danger.tooltip')}>
      <span
        className={cn(
          'inline-flex items-center gap-1 text-2xs font-semibold rounded-full px-2 py-0.5',
          'bg-warning/10 text-warning border border-warning/20'
        )}
      >
        ⚠ {t('danger.badge')}
      </span>
    </Tooltip>
  );
}
