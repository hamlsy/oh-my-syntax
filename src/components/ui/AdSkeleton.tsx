import { useTranslation } from 'react-i18next';

interface AdSkeletonProps {
  height: number;
}

export function AdSkeleton({ height }: AdSkeletonProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{ minHeight: `${height}px` }}
      className="w-full bg-bg-surface border border-border-subtle rounded-xl flex items-center justify-center"
    >
      <p className="text-text-muted text-xs animate-pulse">{t('ad.label')}</p>
    </div>
  );
}
