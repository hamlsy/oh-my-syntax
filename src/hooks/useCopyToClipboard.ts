import { useState, useCallback, useRef, useEffect } from 'react';
import { COPY_REVERT_MS } from '@/constants/config';

interface UseCopyToClipboardReturn {
  copied: boolean;
  error:  boolean;
  copy:   (text: string) => Promise<void>;
}

export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false);
  const [error,  setError]  = useState(false);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(async (text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      await navigator.clipboard.writeText(text);
      if (!mountedRef.current) return;
      setCopied(true);
      setError(false);
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) setCopied(false);
        timerRef.current = null;
      }, COPY_REVERT_MS);
    } catch {
      if (!mountedRef.current) return;
      setError(true);
      setCopied(false);
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) setError(false);
        timerRef.current = null;
      }, COPY_REVERT_MS);
    }
  }, []);

  return { copied, error, copy };
}
