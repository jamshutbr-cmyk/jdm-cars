import { useEffect, useRef, useState } from 'react';
import { hapticImpact } from '@/utils/haptic';

interface Options {
  onRefresh: () => Promise<void>;
  threshold?: number; // px to pull before triggering
}

export function usePullToRefresh({ onRefresh, threshold = 70 }: Options) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      // Только когда скролл вверху
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        triggered.current = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current === null || refreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        setPullDistance(Math.min(dy * 0.5, threshold + 20));
        if (dy * 0.5 >= threshold && !triggered.current) {
          triggered.current = true;
          hapticImpact('medium');
        }
      }
    };

    const onTouchEnd = async () => {
      if (triggered.current && !refreshing) {
        setRefreshing(true);
        setPullDistance(0);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      } else {
        setPullDistance(0);
      }
      startY.current = null;
      triggered.current = false;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, refreshing, threshold]);

  return { pullDistance, refreshing };
}
