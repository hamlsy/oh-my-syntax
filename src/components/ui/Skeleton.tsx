import { cn } from '@/utils/classNames';

interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
}

export function Skeleton({ width, height, rounded = 'rounded-md', className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-bg-elevated',
        rounded,
        className
      )}
      style={{ width, height }}
    />
  );
}
