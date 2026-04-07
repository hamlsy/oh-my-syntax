import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const IDLE_MIN_DELAY = 5000;
const IDLE_MAX_DELAY = 15000;
const BUBBLE_DURATION = 3000;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface UseMascotBubbleReturn {
  currentPhrase: string | null;
  triggerClickBubble: () => void;
}

export function useMascotBubble(): UseMascotBubbleReturn {
  const { t } = useTranslation();
  const [currentPhrase, setCurrentPhrase] = useState<string | null>(null);
  const isBubbleVisibleRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const showBubble = useCallback((phrase: string) => {
    clearHideTimer();
    isBubbleVisibleRef.current = true;
    setCurrentPhrase(phrase);

    hideTimerRef.current = setTimeout(() => {
      isBubbleVisibleRef.current = false;
      setCurrentPhrase(null);
    }, BUBBLE_DURATION);
  }, []);

  // Schedule the next idle bubble after a random delay
  const scheduleNextIdle = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    const delay = IDLE_MIN_DELAY + Math.random() * (IDLE_MAX_DELAY - IDLE_MIN_DELAY);
    idleTimerRef.current = setTimeout(() => {
      if (!isBubbleVisibleRef.current) {
        const phrases = t('mascot.idle', { returnObjects: true }) as string[];
        showBubble(pickRandom(phrases));
      }
      scheduleNextIdle();
    }, delay);
  }, [t, showBubble]);

  useEffect(() => {
    scheduleNextIdle();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      clearHideTimer();
    };
  }, [scheduleNextIdle]);

  const triggerClickBubble = useCallback(() => {
    if (isBubbleVisibleRef.current) return;
    const phrases = t('mascot.click', { returnObjects: true }) as string[];
    showBubble(pickRandom(phrases));
  }, [t, showBubble]);

  return { currentPhrase, triggerClickBubble };
}
