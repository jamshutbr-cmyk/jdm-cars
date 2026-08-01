import { useEffect, useRef } from 'react';

interface Options {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number; // px from bottom
}

export function useInfiniteScroll({ onLoadMore, hasMore, loading, threshold = 200 }: Options) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: `${threshold}px` },
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loading, onLoadMore, threshold]);

  return sentinelRef;
}
