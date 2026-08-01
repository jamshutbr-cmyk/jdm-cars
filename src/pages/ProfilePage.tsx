import { useEffect, useState } from 'react';
import { api } from '@/api';
import type { Profile, CarPost } from '@/types';
import { Header } from '@/components/Header';
import { CarPostCard } from '@/components/CarPostCard';
import { CarPostModal } from '@/components/CarPostModal';
import { IconHeart, IconImage, IconBookmark, IconTrophy } from '@/components/icons';
import { getRank } from '@/utils/rank';

type Tab = 'posts' | 'favorites';

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('posts');
  const [selectedPost, setSelectedPost] = useState<CarPost | null>(null);
  const [editPost, setEditPost] = useState<CarPost | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const load = () => {
    setError(null);
    api.getProfile().then(setProfile).catch((e) => setError(e.message));
    api.getAvatar().then((res) => setAvatarUrl(res.url)).catch(() => {});
  };

  useEffect(load, []);

  const handleToggleLike = async (id: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const update = (list: typeof prev.posts) =>
        list.map((p) =>
          p.id === id ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) } : p,
        );
      return { ...prev, posts: update(prev.posts), favorites: update(prev.favorites) };
    });
    if (selectedPost?.id === id) {
      setSelectedPost((prev) =>
        prev
          ? { ...prev, likedByMe: !prev.likedByMe, likesCount: prev.likesCount + (prev.likedByMe ? -1 : 1) }
          : null,
      );
    }
    try {
      await api.toggleLike(id);
    } catch {
      load();
    }
  };

  const handleToggleFavorite = async (id: string) => {
    if (selectedPost?.id === id) {
      setSelectedPost((prev) => (prev ? { ...prev, favoritedByMe: !prev.favoritedByMe } : null));
    }
    try {
      await api.toggleFavorite(id);
      load();
    } catch {
      load();
    }
  };

  const handleDelete = async (id: string) => {
    setProfile((prev) => (prev ? { ...prev, posts: prev.posts.filter((p) => p.id !== id) } : prev));
    setSelectedPost(null);
    try {
      await api.deleteCar(id);
      load();
    } catch {
      load();
    }
  };

  const handleUpdate = (updatedPost: CarPost) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
        favorites: prev.favorites.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      };
    });
    setSelectedPost((prev) => (prev ? updatedPost : null));
    setEditPost((prev) => (prev ? updatedPost : null));
  };

  if (error) {
    return (
      <div className="pb-28">
        <Header eyebrow="Аккаунт" title="Профиль" />
        <div className="px-5">
          <div className="card-outline rounded-xl2 bg-base-surface p-4 text-[13px] text-ink-dim">
            Не удалось загрузить профиль: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pb-28">
        <Header eyebrow="Аккаунт" title="Профиль" />
        <div className="text-center text-ink-faint text-[14px] py-16">Загрузка…</div>
      </div>
    );
  }

  const list = tab === 'posts' ? profile.posts : profile.favorites;
  const rank = getRank(profile.totalLikes);

  return (
    <div className="pb-28">
      <Header eyebrow="Аккаунт" title="Профиль" />

      <div className="px-5">
        <div className="card-outline rounded-xl2 bg-base-raised p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full shrink-0 overflow-hidden border border-accent-line">
            {avatarUrl ? (
              <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display font-bold text-[22px] bg-accent-soft text-ink">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-display font-semibold text-[18px] truncate">{profile.name}</div>
            {profile.username && <div className="text-[13px] text-ink-dim">@{profile.username}</div>}
            <div className={`inline-flex items-center gap-1.5 mt-2 rounded-full px-3 py-1 text-[13px] font-semibold border ${rank.bg} ${rank.border} ${rank.color}`}>
              <span>{rank.icon}</span>
              <span>{rank.title}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="card-outline rounded-xl2 bg-base-surface p-3.5 text-center">
            <IconImage size={16} className="text-accent mx-auto" />
            <div className="mt-2 font-display font-semibold text-[15px] tabular">{profile.postsCount}</div>
            <div className="text-[11px] text-ink-faint mt-0.5">Фото</div>
          </div>
          <div className="card-outline rounded-xl2 bg-base-surface p-3.5 text-center">
            <IconHeart size={16} className="text-accent mx-auto" />
            <div className="mt-2 font-display font-semibold text-[15px] tabular">{profile.totalLikes}</div>
            <div className="text-[11px] text-ink-faint mt-0.5">Лайков</div>
          </div>
          <div className="card-outline rounded-xl2 bg-base-surface p-3.5 text-center">
            <IconBookmark size={16} className="text-accent mx-auto" />
            <div className="mt-2 font-display font-semibold text-[15px] tabular">{profile.favoritesCount}</div>
            <div className="text-[11px] text-ink-faint mt-0.5">Избранное</div>
          </div>
        </div>

        {/* Счётчики подписок */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="card-outline rounded-xl2 bg-base-surface p-3.5 text-center">
            <div className="font-display font-semibold text-[18px] tabular">{profile.followersCount ?? 0}</div>
            <div className="text-[11px] text-ink-faint mt-0.5">Подписчики</div>
          </div>
          <div className="card-outline rounded-xl2 bg-base-surface p-3.5 text-center">
            <div className="font-display font-semibold text-[18px] tabular">{profile.followingCount ?? 0}</div>
            <div className="text-[11px] text-ink-faint mt-0.5">Подписки</div>
          </div>
        </div>

        {/* Виджет рейтинга */}
        <div className="mt-3 card-outline rounded-xl2 bg-base-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconTrophy size={14} className="text-accent" />
            <span className="text-[12px] font-medium text-ink-dim uppercase tracking-wider">Рейтинг</span>
          </div>
          {profile.leaderboardRank !== null ? (
            <>
              <div className="font-display font-bold text-[24px] leading-none mb-3">
                {profile.leaderboardRank}
                <span className="text-[14px] font-normal text-ink-dim ml-1.5">место из {profile.totalUsers}</span>
              </div>
              <div className="h-1.5 rounded-full bg-base-raised overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${Math.max(4, Math.round(((profile.totalUsers - profile.leaderboardRank + 1) / profile.totalUsers) * 100))}%` }}
                />
              </div>
              <div className="text-[11px] text-ink-faint mt-2">
                {profile.leaderboardRank === 1
                  ? 'Вы на первом месте!'
                  : `Обгоните ещё ${profile.leaderboardRank - 1} ${profile.leaderboardRank - 1 === 1 ? 'человека' : profile.leaderboardRank - 1 < 5 ? 'человека' : 'человек'} чтобы выйти в топ`}
              </div>
            </>
          ) : (
            <>
              <div className="font-display font-bold text-[24px] leading-none mb-3 text-ink-faint">—</div>
              <div className="h-1.5 rounded-full bg-base-raised overflow-hidden">
                <div className="h-full w-0 rounded-full bg-accent" />
              </div>
              <div className="text-[11px] text-ink-faint mt-2">Опубликуйте фото чтобы попасть в рейтинг</div>
            </>
          )}
        </div>
      </div>

      <div className="px-5 mt-5 flex gap-2">
        <button
          onClick={() => setTab('posts')}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
            tab === 'posts' ? 'bg-accent-soft border-accent-line text-ink' : 'bg-base-surface border-base-line text-ink-dim'
          }`}
        >
          Мои фото
        </button>
        <button
          onClick={() => setTab('favorites')}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
            tab === 'favorites' ? 'bg-accent-soft border-accent-line text-ink' : 'bg-base-surface border-base-line text-ink-dim'
          }`}
        >
          Избранное
        </button>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {list.length === 0 && (
          <div className="text-center text-ink-faint text-[14px] py-16">
            {tab === 'posts' ? 'Вы ещё не публиковали фото.' : 'Вы ещё ничего не добавили в избранное.'}
          </div>
        )}
        {list.map((post) => (
          <CarPostCard
            key={post.id}
            post={post}
            onToggleLike={handleToggleLike}
            onToggleFavorite={handleToggleFavorite}
            onDelete={tab === 'posts' ? handleDelete : undefined}
            onEdit={() => setEditPost(post)}
            onClick={() => setSelectedPost(post)}
          />
        ))}
      </div>

      {selectedPost && !editPost && (
        <CarPostModal
          post={selectedPost}
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          onToggleLike={handleToggleLike}
          onToggleFavorite={handleToggleFavorite}
          onDelete={tab === 'posts' ? handleDelete : undefined}
          onUpdate={handleUpdate}
        />
      )}

      {editPost && (
        <CarPostModal
          post={editPost}
          isOpen={true}
          onClose={() => setEditPost(null)}
          onToggleLike={handleToggleLike}
          onToggleFavorite={handleToggleFavorite}
          onDelete={tab === 'posts' ? handleDelete : undefined}
          onUpdate={handleUpdate}
          startEditing={true}
        />
      )}
    </div>
  );
}
