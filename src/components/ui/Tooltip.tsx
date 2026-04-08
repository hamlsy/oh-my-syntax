import { useState } from 'react';
import { cn } from '@/utils/classNames';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  wrap?: boolean; // 긴 텍스트 줄바꿈 허용 (기본 false = whitespace-nowrap)
}

export function Tooltip({ content, children, className, wrap = false }: TooltipProps) {
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
          <div className={cn(
            'bg-bg-overlay border border-border-subtle text-text-primary text-xs font-medium rounded-lg px-2.5 py-1.5 shadow-card text-center',
            wrap ? 'max-w-[320px] whitespace-normal break-all' : 'whitespace-nowrap max-w-[240px]'
          )}>
            {content}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bg-overlay" />
        </div>
      )}
    </div>
  );
}
