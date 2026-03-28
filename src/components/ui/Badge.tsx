import { cn } from '@/utils/classNames';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ label, size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        size === 'sm' ? 'text-2xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
        'bg-accent-soft text-accent',
        className
      )}
    >
      {label}
    </span>
  );
}
