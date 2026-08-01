import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/api';
import type { CarPost, FeedSort } from '@/types';
import { Header } from '@/components/Header';
import { CarPostCard } from '@/components/CarPostCard';
import { CarPostModal } from '@/components/CarPostModal';
import { CarPostSkeleton } from '@/components/CarPostSkeleton';
import { IconClock, IconTrophy, IconSearch, IconClose } from '@/components/icons';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { hapticImpact, hapticNotification, hapticSelection } from '@/utils/haptic';

export function FeedPage() {
  const [sort, setSort] = useState<FeedSort>('new');
  const [posts, setPosts] = useState<CarPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<CarPost | null>(null);
  const [editPost, setEditPost] = useState<CarPost | null>(null);
  const [query, setQuery] = useState('');

  const loadPage = useCallback(async (s: FeedSort, p: number, replace: boolean) => {
    try {
      const res = await api.getFeed(s, p);
      setPosts((prev) => replace ? res.items : [...prev, ...res.items]);
      setHasMore(res.hasMore);
      setPage(p);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    }
  }, []);

  // Начальная загрузка / смена сортировки
  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setPage(1);
    setHasMore(true);
    loadPage(sort, 1, true).finally(() => setLoading(false));
  }, [sort, loadPage]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    hapticNotification('success');
    await loadPage(sort, 1, true);
    setPage(1);
  }, [sort, loadPage]);

  const { pullDistance, refreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  // Infinite scroll
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadPage(sort, page + 1, false);
    setLoadingMore(false);
  }, [loadingMore, hasMore, sort, page, loadPage]);

  const sentinelRef = useInfiniteScroll({ onLoadMore: handleLoadMore, hasMore, loading: loadingMore });

  const handleToggleLike = async (id: string) => {
    hapticImpact('light');
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) } : p,
      ),
    );
    if (selectedPost?.id === id) {
      setSelectedPost((prev) =>
        prev ? { ...prev, likedByMe: !prev.likedByMe, likesCount: prev.likesCount + (prev.likedByMe ? -1 : 1) } : null,
      );
    }
    try {
      const res = await api.toggleLike(id);
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...res } : p)));
      if (selectedPost?.id === id) setSelectedPost((prev) => (prev ? { ...prev, ...res } : null));
    } catch {
      await loadPage(sort, 1, true);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    hapticImpact('light');
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, favoritedByMe: !p.favoritedByMe } : p)));
    if (selectedPost?.id === id) {
      setSelectedPost((prev) => (prev ? { ...prev, favoritedByMe: !prev.favoritedByMe } : null));
    }
    try {
      const res = await api.toggleFavorite(id);
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...res } : p)));
      if (selectedPost?.id === id) setSelectedPost((prev) => (prev ? { ...prev, ...res } : null));
    } catch {
      await loadPage(sort, 1, true);
    }
  };

  const handleDelete = async (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setSelectedPost(null);
    try {
      await api.deleteCar(id);
    } catch {
      await loadPage(sort, 1, true);
    }
  };

  const handleUpdate = (updatedPost: CarPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    setSelectedPost((prev) => (prev ? updatedPost : null));
    setEditPost((prev) => (prev ? updatedPost : null));
  };

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) =>
      `${p.brand} ${p.model} ${p.caption} ${p.authorName}`.toLowerCase().includes(q),
    );
  }, [posts, query]);

  return (
    <div className="pb-28">
      <Header eyebrow="JDM Cars" title="Лента" />

      {/* Pull-to-refresh индикатор — фиксированный сверху */}
      {(pullDistance > 0 || refreshing) && (
        <div className="fixed top-0 left-0 right-0 z-30 flex justify-center items-end pointer-events-none"
          style={{ height: refreshing ? 48 : Math.max(pullDistance, 0) }}>
          <div className={`mb-2 w-7 h-7 rounded-full bg-base-raised border border-base-line flex items-center justify-center shadow-card transition-opacity ${pullDistance > 0 || refreshing ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-4 h-4 rounded-full border-2 border-accent border-t-transparent ${refreshing ? 'animate-spin' : ''}`}
              style={!refreshing ? { transform: `rotate(${(pullDistance / 70) * 360}deg)` } : undefined} />
          </div>
        </div>
      )}

      <div className="px-5 flex gap-2">
        <button onClick={() => { hapticSelection(); setSort('new'); }}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${sort === 'new' ? 'bg-accent-soft border-accent-line text-ink' : 'bg-base-surface border-base-line text-ink-dim'}`}>
          <IconClock size={14} /> Новое
        </button>
        <button onClick={() => { hapticSelection(); setSort('top'); }}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${sort === 'top' ? 'bg-accent-soft border-accent-line text-ink' : 'bg-base-surface border-base-line text-ink-dim'}`}>
          <IconTrophy size={14} /> Топ
        </button>
        <button onClick={() => { hapticSelection(); setSort('following'); }}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${sort === 'following' ? 'bg-accent-soft border-accent-line text-ink' : 'bg-base-surface border-base-line text-ink-dim'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Подписки
        </button>
      </div>

      <div className="px-5 mt-4">
        <div className="relative">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти марку, модель, автора"
            className="w-full rounded-xl2 bg-base-surface border border-base-line pl-10 pr-10 py-2.5 text-[14px] text-ink placeholder:text-ink-faint outline-none focus:border-accent-line transition-colors" />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint">
              <IconClose size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {error && (
          <div className="card-outline rounded-xl2 bg-base-surface p-4 text-[13px] text-ink-dim">
            Не удалось загрузить ленту: {error}
          </div>
        )}

        {loading && !error && (
          <>
            <CarPostSkeleton />
            <CarPostSkeleton />
            <CarPostSkeleton />
          </>
        )}

        {!loading && posts.length === 0 && !error && (
          <div className="text-center text-ink-faint text-[14px] py-16">
            Пока никто не выложил фото. Станьте первым во вкладке «Добавить».
          </div>
        )}

        {!loading && posts.length > 0 && filteredPosts.length === 0 && (
          <div className="text-center text-ink-faint text-[14px] py-16">Ничего не найдено.</div>
        )}

        {filteredPosts.map((post) => (
          <CarPostCard
            key={post.id}
            post={post}
            onToggleLike={handleToggleLike}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
            onEdit={() => setEditPost(post)}
            onClick={() => setSelectedPost(post)}
          />
        ))}

        {/* Sentinel для infinite scroll */}
        {!query && <div ref={sentinelRef} className="h-1" />}

        {/* Скелетон при подгрузке */}
        {loadingMore && (
          <>
            <CarPostSkeleton />
            <CarPostSkeleton />
          </>
        )}

        {/* Конец ленты */}
        {!hasMore && posts.length > 0 && !query && (
          <div className="text-center text-ink-faint text-[12px] py-4">Вы дошли до конца ленты</div>
        )}
      </div>

      {selectedPost && !editPost && (
        <CarPostModal post={selectedPost} isOpen={true} onClose={() => setSelectedPost(null)}
          onToggleLike={handleToggleLike} onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete} onUpdate={handleUpdate} />
      )}

      {editPost && (
        <CarPostModal post={editPost} isOpen={true} onClose={() => setEditPost(null)}
          onToggleLike={handleToggleLike} onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete} onUpdate={handleUpdate} startEditing={true} />
      )}
    </div>
  );
}
