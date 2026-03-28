import { useState } from 'react';
import { cn } from '@/utils/classNames';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
        >
          <div className="bg-bg-overlay border border-border-subtle text-text-primary text-xs font-medium rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-card max-w-[240px] text-center">
            {content}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bg-overlay" />
        </div>
      )}
    </div>
  );
}
