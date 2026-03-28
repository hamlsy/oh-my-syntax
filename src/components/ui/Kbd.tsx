import { cn } from '@/utils/classNames';

interface KbdProps {
  keys: string[];
  className?: string;
}

export function Kbd({ keys, className }: KbdProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-2xs font-mono font-medium text-text-muted bg-bg-overlay border border-border-subtle rounded"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
