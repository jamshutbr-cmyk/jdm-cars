import { useState } from 'react';
import type { CarPost } from '@/types';
import { ImageGallery } from './ImageGallery';
import { IconHeart, IconHeartFilled, IconBookmark, IconBookmarkFilled, IconTrash, IconEdit } from './icons';
import { hapticImpact } from '@/utils/haptic';

interface CarPostCardProps {
  post: CarPost;
  rank?: number;
  onToggleLike: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: () => void;
  onClick?: () => void;
  onAuthorClick?: (userId: string) => void;
}

const dateFmt = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' });

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return dateFmt.format(-mins, 'minute');
  const hours = Math.round(mins / 60);
  if (hours < 24) return dateFmt.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  return dateFmt.format(-days, 'day');
}

export function CarPostCard({ post, rank, onToggleLike, onToggleFavorite, onDelete, onEdit, onClick, onAuthorClick }: CarPostCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="card-outline rounded-xl2 bg-base-surface overflow-hidden">
      <div className="relative">
        <ImageGallery
          imageUrls={post.imageUrls ?? [post.imageUrl]}
          alt={`${post.brand} ${post.model}`}
          className="w-full h-56 object-cover"
          onClick={onClick}
        />
        {rank && (
          <div className="absolute top-3 left-3 flex items-center justify-center w-7 h-7 rounded-full bg-base/75 border border-base-line text-[13px] font-display font-semibold pointer-events-none">
            {rank}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 cursor-pointer" onClick={onClick}>
            <div className="font-display font-semibold text-[16px] leading-tight truncate">
              {post.brand} {post.model}
            </div>
            <div className="text-[12px] text-ink-faint mt-0.5">{post.year} год</div>
          </div>
          <div className="text-right shrink-0">
            <div
              className={`text-[13px] text-ink-dim ${!post.isMine && onAuthorClick ? 'cursor-pointer active:opacity-60 transition-opacity' : ''}`}
              onClick={(e) => {
                if (!post.isMine && onAuthorClick) {
                  e.stopPropagation();
                  onAuthorClick(post.authorId);
                }
              }}
            >
              {post.authorName}
            </div>
            <div className="text-[11px] text-ink-faint">{timeAgo(post.createdAt)}</div>
          </div>
        </div>

        {post.caption && <p className="mt-2.5 text-[13px] text-ink-dim leading-relaxed cursor-pointer" onClick={onClick}>{post.caption}</p>}

        <div className="mt-3.5 flex items-center justify-between border-t border-base-line pt-3">
          <div className="flex items-center gap-4">
            {/* Просмотры */}
            <div className="flex items-center gap-1 text-ink-faint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span className="text-[12px] tabular">{post.viewsCount ?? 0}</span>
            </div>
            {/* Лайк */}
            <button
              onClick={(e) => { e.stopPropagation(); hapticImpact('light'); onToggleLike(post.id); }}
              className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${post.likedByMe ? 'text-racing' : 'text-ink-dim'}`}
            >
              {post.likedByMe ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
              <span className="tabular">{post.likesCount}</span>
            </button>
            {/* Избранное */}
            <button
              onClick={(e) => { e.stopPropagation(); hapticImpact('light'); onToggleFavorite(post.id); }}
              className={`transition-colors ${post.favoritedByMe ? 'text-accent' : 'text-ink-dim'}`}
            >
              {post.favoritedByMe ? <IconBookmarkFilled size={18} /> : <IconBookmark size={18} />}
            </button>
          </div>

          {post.isMine && (
            <div className="flex items-center gap-2">
              {onEdit && !confirmDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="text-ink-faint hover:text-accent transition-colors"
                >
                  <IconEdit size={16} />
                </button>
              )}
              {onDelete && (
                confirmDelete ? (
                  <div className="flex items-center gap-2 text-[12px]">
                    <span className="text-ink-faint">Удалить?</span>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(post.id); }} className="text-racing font-medium">Да</button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }} className="text-ink-faint font-medium">Нет</button>
                  </div>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} className="text-ink-faint hover:text-racing transition-colors">
                    <IconTrash size={16} />
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
