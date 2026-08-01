import { useState, useEffect } from 'react';
import type { CarPost } from '@/types';
import { api } from '@/api';
import { ImageGallery } from './ImageGallery';
import { IconHeart, IconHeartFilled, IconBookmark, IconBookmarkFilled, IconTrash, IconX, IconEdit } from './icons';
import { AnriAlert } from './AnriAlert';

interface CarPostModalProps {
  post: CarPost;
  isOpen: boolean;
  onClose: () => void;
  onToggleLike: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (updatedPost: CarPost) => void;
  startEditing?: boolean;
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

export function CarPostModal({ post, isOpen, onClose, onToggleLike, onToggleFavorite, onDelete, onUpdate, startEditing }: CarPostModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewsCount, setViewsCount] = useState(post.viewsCount ?? 0);

  // Записываем просмотр при открытии
  useEffect(() => {
    if (!isOpen) return;
    api.recordView(post.id)
      .then((res) => setViewsCount(res.viewsCount))
      .catch(() => {});
  }, [isOpen, post.id]);

  // Режим редактирования основных полей
  const [isEditing, setIsEditing] = useState(startEditing ?? false);
  const [editedBrand, setEditedBrand] = useState(post.brand);
  const [editedModel, setEditedModel] = useState(post.model);
  const [editedYear, setEditedYear] = useState(post.year.toString());

  // Режим редактирования описания — отдельно, открывается только по кнопке
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.caption);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = () => {
    onDelete?.(post.id);
    onClose();
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (!editedBrand.trim() || !editedModel.trim() || !editedYear.trim()) {
      alert('Заполните марку, модель и год');
      return;
    }
    const yearNum = Number(editedYear);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      alert('Укажите корректный год');
      return;
    }

    setSaveError(null);
    setIsSaving(true);
    try {
      const updatedPost = await api.updateCar(post.id, {
        brand: editedBrand.trim(),
        model: editedModel.trim(),
        year: yearNum,
        category: post.category,
        caption: isEditingCaption ? editedCaption.trim() : post.caption,
      });
      onUpdate?.(updatedPost);
      setIsEditing(false);
      setIsEditingCaption(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedBrand(post.brand);
    setEditedModel(post.model);
    setEditedYear(post.year.toString());
    setEditedCaption(post.caption);
    setIsEditing(false);
    setIsEditingCaption(false);
    setSaveError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-base rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-base/80 border border-base-line text-ink-dim hover:text-ink transition-colors backdrop-blur-sm"
        >
          <IconX size={20} />
        </button>

        {/* Изображение */}
        <div className="relative">
          <ImageGallery
            imageUrls={post.imageUrls ?? [post.imageUrl]}
            alt={`${post.brand} ${post.model}`}
            className="w-full max-h-[500px] object-contain bg-base-surface"
            showCounter={false}
          />
        </div>

        {/* Контент */}
        <div className="p-6">

          {/* Заголовок / режим редактирования */}
          {isEditing ? (
            <div className="pb-4 border-b border-base-line space-y-3">
              <div className="text-[13px] text-accent font-medium">Редактирование</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-ink-faint uppercase tracking-wider mb-1.5">Марка</div>
                  <input
                    value={editedBrand}
                    onChange={(e) => setEditedBrand(e.target.value.slice(0, 20))}
                    placeholder="Nissan"
                    maxLength={20}
                    autoFocus
                    className="w-full rounded-xl bg-base-surface border border-base-line px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint outline-none focus:border-accent-line transition-colors"
                  />
                </div>
                <div>
                  <div className="text-[11px] text-ink-faint uppercase tracking-wider mb-1.5">Модель</div>
                  <input
                    value={editedModel}
                    onChange={(e) => setEditedModel(e.target.value.slice(0, 20))}
                    placeholder="Skyline GT-R"
                    maxLength={20}
                    className="w-full rounded-xl bg-base-surface border border-base-line px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint outline-none focus:border-accent-line transition-colors"
                  />
                </div>
              </div>
              <div>
                <div className="text-[11px] text-ink-faint uppercase tracking-wider mb-1.5">Год</div>
                <input
                  value={editedYear}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || /^\d{0,4}$/.test(v)) {
                      const num = Number(v);
                      if (v.length < 4 || (num >= 1885 && num <= new Date().getFullYear())) {
                        setEditedYear(v);
                      }
                    }
                  }}
                  placeholder="1999"
                  inputMode="numeric"
                  maxLength={4}
                  className="w-full rounded-xl bg-base-surface border border-base-line px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint outline-none focus:border-accent-line transition-colors"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-base-line">
              <div className="min-w-0 flex-1">
                <h2 className="font-display font-bold text-[24px] leading-tight">
                  {post.brand} {post.model}
                </h2>
                <div className="text-[14px] text-ink-dim mt-1">{post.year} год</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[14px] font-medium text-ink">{post.authorName}</div>
                {post.authorUsername && (
                  <div className="text-[12px] text-ink-faint">@{post.authorUsername}</div>
                )}
                <div className="text-[11px] text-ink-faint mt-1">{timeAgo(post.createdAt)}</div>
              </div>
            </div>
          )}

          {/* Описание */}
          <div className="py-4 border-b border-base-line">
            {isEditingCaption ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] text-ink-faint uppercase tracking-wider">Описание</div>
                  <div className="text-[11px] text-ink-faint tabular">{editedCaption.length}/500</div>
                </div>
                <textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value.slice(0, 500))}
                  rows={4}
                  autoFocus
                  placeholder="Расскажите о вашей машине..."
                  className="w-full rounded-xl bg-base-surface border border-base-line px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint outline-none focus:border-accent-line transition-colors resize-none"
                />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] text-ink-faint uppercase tracking-wider">Описание</div>
                  {post.isMine && (
                    <button
                      onClick={() => setIsEditingCaption(true)}
                      className="text-[12px] text-ink-faint hover:text-accent transition-colors font-medium"
                    >
                      {post.caption ? 'Изменить' : '+ Добавить'}
                    </button>
                  )}
                </div>
                {post.caption ? (
                  <p className="text-[15px] text-ink-dim leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                ) : (
                  <p className="text-[14px] text-ink-faint italic">Нет описания</p>
                )}
              </>
            )}
          </div>

          {/* Характеристики (только когда не в режиме редактирования) */}
          {!isEditing && (
            <div className="py-4 grid grid-cols-2 gap-4 border-b border-base-line">
              <div>
                <div className="text-[11px] text-ink-faint uppercase tracking-wider mb-1">Марка</div>
                <div className="text-[15px] font-medium text-ink">{post.brand}</div>
              </div>
              <div>
                <div className="text-[11px] text-ink-faint uppercase tracking-wider mb-1">Модель</div>
                <div className="text-[15px] font-medium text-ink">{post.model}</div>
              </div>
              <div>
                <div className="text-[11px] text-ink-faint uppercase tracking-wider mb-1">Год</div>
                <div className="text-[15px] font-medium text-ink">{post.year}</div>
              </div>
            </div>
          )}

          {/* Кнопки сохранить/отмена в режиме редактирования */}
          {(isEditing || isEditingCaption) && (
            <div className="py-4 border-b border-base-line space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 rounded-full bg-ink text-base font-semibold text-[14px] py-2.5 disabled:opacity-40 active:scale-[0.98] transition-transform"
                >
                  {isSaving ? 'Сохраняем…' : 'Сохранить'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex-1 rounded-full bg-base-surface border border-base-line text-ink-dim font-medium text-[14px] py-2.5"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {saveError && (
            <AnriAlert message={saveError} onClose={() => setSaveError(null)} />
          )}

          {/* Действия */}
          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                onClick={() => onToggleLike(post.id)}
                className={`flex items-center gap-2 text-[15px] font-medium transition-colors ${
                  post.likedByMe ? 'text-racing' : 'text-ink-dim hover:text-racing'
                }`}
              >
                {post.likedByMe ? <IconHeartFilled size={22} /> : <IconHeart size={22} />}
                <span className="tabular">{post.likesCount}</span>
              </button>
              <button
                onClick={() => onToggleFavorite(post.id)}
                className={`transition-colors ${
                  post.favoritedByMe ? 'text-accent' : 'text-ink-dim hover:text-accent'
                }`}
              >
                {post.favoritedByMe ? <IconBookmarkFilled size={22} /> : <IconBookmark size={22} />}
              </button>
              {/* Просмотры */}
              <div className="flex items-center gap-1.5 text-ink-faint">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span className="text-[14px] tabular">{viewsCount}</span>
              </div>
            </div>

            {post.isMine && (
              <div className="flex items-center gap-3">
                {!isEditing && !isEditingCaption && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-ink-dim hover:text-accent transition-colors"
                    title="Редактировать"
                  >
                    <IconEdit size={18} />
                  </button>
                )}
                {onDelete && !isEditing && !isEditingCaption && (
                  confirmDelete ? (
                    <div className="flex items-center gap-3 text-[13px]">
                      <span className="text-ink-faint">Удалить?</span>
                      <button onClick={handleDelete} className="text-racing font-medium hover:underline">Да</button>
                      <button onClick={() => setConfirmDelete(false)} className="text-ink-faint font-medium hover:underline">Нет</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="text-ink-faint hover:text-racing transition-colors"
                      title="Удалить"
                    >
                      <IconTrash size={18} />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
