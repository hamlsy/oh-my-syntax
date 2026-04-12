import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/classNames';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  wrap?: boolean;
}

type TooltipPlacement = 'top' | 'bottom';

interface TooltipPosition {
  top: number;
  left: number;
  placement: TooltipPlacement;
}

const TOOLTIP_GAP = 8;
const VIEWPORT_MARGIN = 8;

function getTooltipPosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
): TooltipPosition {
  let placement: TooltipPlacement = 'top';
  let top = triggerRect.top - tooltipRect.height - TOOLTIP_GAP;

  if (top < VIEWPORT_MARGIN) {
    placement = 'bottom';
    top = triggerRect.bottom + TOOLTIP_GAP;
  }

  const halfWidth = tooltipRect.width / 2;
  const rawLeft = triggerRect.left + triggerRect.width / 2;
  const left = Math.min(
    Math.max(rawLeft, halfWidth + VIEWPORT_MARGIN),
    window.innerWidth - halfWidth - VIEWPORT_MARGIN,
  );

  return { top, left, placement };
}

export function Tooltip({
  content,
  children,
  className,
  wrap = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const triggerElement = triggerRef.current;
    const tooltipElement = tooltipRef.current;

    if (!triggerElement || !tooltipElement) {
      return;
    }

    setPosition(
      getTooltipPosition(
        triggerElement.getBoundingClientRect(),
        tooltipElement.getBoundingClientRect(),
      ),
    );
  }, []);

  useLayoutEffect(() => {
    if (!visible) {
      return;
    }

    updatePosition();
  }, [visible, content, wrap, updatePosition]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [visible, updatePosition]);

  const showTooltip = () => {
    setPosition(null);
    setVisible(true);
  };

  const hideTooltip = () => {
    setVisible(false);
  };

  const shouldRenderTooltip = visible && typeof document !== 'undefined';

  const tooltipBodyClassName = cn(
    'bg-bg-overlay border border-border-subtle text-text-primary text-xs font-medium rounded-lg px-2.5 py-1.5 shadow-card text-center',
    wrap
      ? 'max-w-[320px] whitespace-normal break-all'
      : 'whitespace-nowrap max-w-[240px]',
  );

  const tooltipArrowClassName = cn(
    'absolute left-1/2 -translate-x-1/2 border-4 border-transparent',
    position?.placement === 'bottom'
      ? 'bottom-full border-b-bg-overlay'
      : 'top-full border-t-bg-overlay',
  );

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-flex', className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}

      {shouldRenderTooltip &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              transform: 'translateX(-50%)',
              visibility: position ? 'visible' : 'hidden',
            }}
          >
            <div className={tooltipBodyClassName}>{content}</div>
            <div className={tooltipArrowClassName} />
          </div>,
          document.body,
        )}
    </div>
  );
}
