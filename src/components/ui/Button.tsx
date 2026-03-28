import { forwardRef } from 'react';
import { cn } from '@/utils/classNames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            primary: 'bg-accent text-text-inverse hover:bg-accent/90',
            ghost:   'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
            danger:  'text-warning hover:bg-warning/10',
          }[variant],
          {
            sm: 'text-xs px-2.5 py-1.5 min-h-[32px]',
            md: 'text-sm px-3.5 py-2 min-h-[40px]',
            lg: 'text-base px-5 py-2.5 min-h-[48px]',
          }[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
