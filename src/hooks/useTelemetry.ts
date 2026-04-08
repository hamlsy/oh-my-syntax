import { useCallback } from 'react';
import { TELEMETRY_URL } from '@/constants/config';

export function useTelemetry() {
  const track = useCallback((commandId: string) => {
    if (!TELEMETRY_URL || !TELEMETRY_URL.startsWith('https://')) return;
    fetch(TELEMETRY_URL, {
      method: 'POST',
      body: JSON.stringify({ commandId, ts: Date.now() }),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => { /* silently ignore */ });
  }, []);

  return { track };
}
