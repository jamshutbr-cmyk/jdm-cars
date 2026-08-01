import { useEffect, useState } from 'react';
import { api } from '@/api';
import type { CarPost, UserLeaderboardEntry } from '@/types';
import { Header } from '@/components/Header';
import { CarPostCard } from '@/components/CarPostCard';
import { CarPostModal } from '@/components/CarPostModal';
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { IconHeart, IconTrophy, IconImage } from '@/components/icons';

// Компонент аватарки с ленивой загрузкой
function UserAvatar({ userId, name }: { userId: string; name: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    api.getUserAvatar(userId).then((r) => setUrl(r.url)).catch(() => {});
  }, [userId]);
  return (
    <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden border border-accent-line">
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-display font-semibold text-[13px] bg-accent-soft text-ink">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

type View = 'cars' | 'users';

export function LeaderboardPage() {
  const [view, setView] = useState<View>('cars');
  const [cars, setCars] = useState<CarPost[] | null>(null);
  const [users, setUsers] = useState<UserLeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<CarPost | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    Promise.all([api.getLeaderboardCars(), api.getLeaderboardUsers()])
      .then(([c, u]) => {
        setCars(c);
        setUsers(u);
      })
      .catch((e) => setError(e.message));
  }, []);

  const handleToggleLike = async (id: string) => {
    setCars((prev) =>
      prev?.map((p) =>
        p.id === id
          ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) }
          : p,
      ) ?? null,
    );
    if (selectedPost?.id === id) {
      setSelectedPost((prev) =>
        prev
          ? { ...prev, likedByMe: !prev.likedByMe, likesCount: prev.likesCount + (prev.likedByMe ? -1 : 1) }
          : null,
      );
    }
    try {
      const res = await api.toggleLike(id);
      setCars((prev) => prev?.map((p) => (p.id === id ? { ...p, ...res } : p)) ?? null);
      if (selectedPost?.id === id) {
        setSelectedPost((prev) => (prev ? { ...prev, ...res } : null));
      }
    } catch {
      api.getLeaderboardCars().then(setCars).catch(() => {});
    }
  };

  const handleToggleFavorite = async (id: string) => {
    setCars((prev) => prev?.map((p) => (p.id === id ? { ...p, favoritedByMe: !p.favoritedByMe } : p)) ?? null);
    if (selectedPost?.id === id) {
      setSelectedPost((prev) => (prev ? { ...prev, favoritedByMe: !prev.favoritedByMe } : null));
    }
    try {
      await api.toggleFavorite(id);
    } catch {
      api.getLeaderboardCars().then(setCars).catch(() => {});
    }
  };

  const handleUpdate = (updatedPost: CarPost) => {
    setCars((prev) => prev?.map((p) => (p.id === updatedPost.id ? updatedPost : p)) ?? null);
    setSelectedPost(updatedPost);
  };  return (
    <div className="pb-28">
      <Header eyebrow="Сообщество" title="Топ" />

      <div className="px-5 flex gap-2">
        <button
          onClick={() => setView('cars')}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
            view === 'cars' ? 'bg-accent-soft border-accent-line text-ink' : 'bg-base-surface border-base-line text-ink-dim'
          }`}
        >
          <IconImage size={14} />
          Машины
        </button>
        <button
          onClick={() => setView('users')}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
            view === 'users' ? 'bg-accent-soft border-accent-line text-ink' : 'bg-base-surface border-base-line text-ink-dim'
          }`}
        >
          <IconTrophy size={14} />
          Владельцы
        </button>
      </div>

      {error && (
        <div className="px-5 mt-5">
          <div className="card-outline rounded-xl2 bg-base-surface p-4 text-[13px] text-ink-dim">
            Не удалось загрузить рейтинг: {error}
          </div>
        </div>
      )}

      {!error && view === 'cars' && (
        <div className="px-5 mt-5 space-y-4">
          {cars === null && <div className="text-center text-ink-faint text-[14px] py-16">Загрузка…</div>}
          {cars?.length === 0 && (
            <div className="text-center text-ink-faint text-[14px] py-16">Пока нет ни одной машины в рейтинге.</div>
          )}
          {cars?.map((post, i) => (
            <CarPostCard
              key={post.id}
              post={post}
              rank={i + 1}
              onToggleLike={handleToggleLike}
              onToggleFavorite={handleToggleFavorite}
              onClick={() => setSelectedPost(post)}
              onAuthorClick={setViewingUserId}
            />
          ))}
        </div>
      )}

      {!error && view === 'users' && (
        <div className="px-5 mt-5">
          {users === null && <div className="text-center text-ink-faint text-[14px] py-16">Загрузка…</div>}
          {users?.length === 0 && (
            <div className="text-center text-ink-faint text-[14px] py-16">Пока нет ни одного участника рейтинга.</div>
          )}
          {users && users.length > 0 && (
            <div className="card-outline rounded-xl2 bg-base-surface divide-y divide-base-line overflow-hidden">
              {users.map((entry) => (
                <button
                  key={entry.userId}
                  onClick={() => setViewingUserId(entry.userId)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-base-raised transition-colors"
                >
                  <div className="w-6 text-[13px] text-ink-faint tabular shrink-0">{entry.rank}</div>
                  <UserAvatar userId={entry.userId} name={entry.name} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium truncate">{entry.name}</div>
                    <div className="text-[12px] text-ink-faint truncate">
                      {entry.topCar} &middot; {entry.postsCount} фото
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 font-display font-semibold text-[14px] tabular">
                      <IconHeart size={13} className="text-ink-faint" />
                      {entry.totalLikes}
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-faint">
                      <path d="M9 6l6 6-6 6"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedPost && (
        <CarPostModal
          post={selectedPost}
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          onToggleLike={handleToggleLike}
          onToggleFavorite={handleToggleFavorite}
          onUpdate={handleUpdate}
          onAuthorClick={(uid) => { setSelectedPost(null); setViewingUserId(uid); }}
        />
      )}

      {viewingUserId && (
        <PublicProfileModal
          userId={viewingUserId}
          onClose={() => setViewingUserId(null)}
        />
      )}
    </div>
  );
}
