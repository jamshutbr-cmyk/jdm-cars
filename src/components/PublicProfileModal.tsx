import { useEffect, useState } from 'react';
import { api } from '@/api';
import type { CarPost, PublicProfile } from '@/types';
import { CarPostCard } from './CarPostCard';
import { CarPostModal } from './CarPostModal';
import { IconX, IconHeart, IconImage } from './icons';
import { getRank } from '@/utils/rank';
import { hapticImpact } from '@/utils/haptic';

interface PublicProfileModalProps {
  userId: string;
  onClose: () => void;
}

export function PublicProfileModal({ userId, onClose }: PublicProfileModalProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<CarPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CarPost | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    api.getPublicProfile(userId)
      .then((p) => { setProfile(p); setPosts(p.posts); })
      .catch((e) => setError(e.message));
  }, [userId]);

  const handleToggleFollow = async () => {
    if (!profile || followLoading) return;
    hapticImpact('medium');
    setFollowLoading(true);
    try {
      const res = profile.isFollowing
        ? await api.unfollowUser(userId)
        : await api.followUser(userId);
      setProfile((prev) => prev ? { ...prev, isFollowing: res.isFollowing, followersCount: res.followersCount } : null);
    } catch {
      // ignore
    } finally {
      setFollowLoading(false);
    }
  };

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
      api.getPublicProfile(userId).then((p) => setPosts(p.posts)).catch(() => {});
    }
  };

  const handleToggleFavorite = async (id: string) => {
    hapticImpact('light');
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, favoritedByMe: !p.favoritedByMe } : p)));
    if (selectedPost?.id === id) {
      setSelectedPost((prev) => (prev ? { ...prev, favoritedByMe: !prev.favoritedByMe } : null));
    }
    try {
      await api.toggleFavorite(id);
    } catch {
      api.getPublicProfile(userId).then((p) => setPosts(p.posts)).catch(() => {});
    }
  };

  const rank = profile ? getRank(profile.totalLikes) : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-base" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Шапка */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-base-line shrink-0">
          <div className="font-display font-bold text-[18px]">Профиль</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-base-surface border border-base-line text-ink-dim">
            <IconX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error && <div className="px-5 pt-5 text-[13px] text-ink-dim">{error}</div>}
          {!profile && !error && <div className="text-center text-ink-faint text-[14px] py-16">Загрузка…</div>}

          {profile && (
            <>
              {/* Карточка пользователя */}
              <div className="px-5 pt-5">
                <div className="card-outline rounded-xl2 bg-base-raised p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-[20px] shrink-0 bg-accent-soft border border-accent-line text-ink">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-semibold text-[17px] truncate">{profile.name}</div>
                      {profile.username && <div className="text-[13px] text-ink-dim">@{profile.username}</div>}
                      {rank && (
                        <div className={`inline-flex items-center gap-1.5 mt-2 rounded-full px-3 py-1 text-[12px] font-semibold border ${rank.bg} ${rank.border} ${rank.color}`}>
                          <span>{rank.icon}</span>
                          <span>{rank.title}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Подписаться */}
                  <button
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className={`mt-4 w-full rounded-full py-2.5 text-[14px] font-semibold transition-all active:scale-[0.97] disabled:opacity-50 ${
                      profile.isFollowing
                        ? 'bg-base-surface border border-base-line text-ink-dim'
                        : 'bg-accent text-white'
                    }`}
                  >
                    {followLoading ? '…' : profile.isFollowing ? 'Отписаться' : 'Подписаться'}
                  </button>
                </div>

                {/* Статистика */}
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <div className="card-outline rounded-xl2 bg-base-surface p-3 text-center">
                    <IconImage size={13} className="text-accent mx-auto" />
                    <div className="mt-1.5 font-display font-semibold text-[14px] tabular">{profile.postsCount}</div>
                    <div className="text-[10px] text-ink-faint mt-0.5">Фото</div>
                  </div>
                  <div className="card-outline rounded-xl2 bg-base-surface p-3 text-center">
                    <IconHeart size={13} className="text-accent mx-auto" />
                    <div className="mt-1.5 font-display font-semibold text-[14px] tabular">{profile.totalLikes}</div>
                    <div className="text-[10px] text-ink-faint mt-0.5">Лайков</div>
                  </div>
                  <div className="card-outline rounded-xl2 bg-base-surface p-3 text-center">
                    <div className="mt-0.5 font-display font-semibold text-[14px] tabular">{profile.followersCount}</div>
                    <div className="text-[10px] text-ink-faint mt-0.5">Подписчики</div>
                  </div>
                  <div className="card-outline rounded-xl2 bg-base-surface p-3 text-center">
                    <div className="mt-0.5 font-display font-semibold text-[14px] tabular">{profile.followingCount}</div>
                    <div className="text-[10px] text-ink-faint mt-0.5">Подписки</div>
                  </div>
                </div>
              </div>

              {/* Посты */}
              <div className="px-5 mt-5 pb-8 space-y-4">
                {posts.length === 0 && (
                  <div className="text-center text-ink-faint text-[14px] py-10">Пользователь ещё не публиковал фото.</div>
                )}
                {posts.map((post) => (
                  <CarPostCard
                    key={post.id}
                    post={post}
                    onToggleLike={handleToggleLike}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={() => setSelectedPost(post)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedPost && (
        <CarPostModal
          post={selectedPost}
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          onToggleLike={handleToggleLike}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </>
  );
}
