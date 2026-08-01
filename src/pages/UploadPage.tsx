import { useRef, useState } from 'react';
import { api } from '@/api';
import { Header } from '@/components/Header';
import { AnriAlert } from '@/components/AnriAlert';
import { IconCamera, IconCheck, IconClose, IconPlus } from '@/components/icons';

const MAX_SIZE = 8 * 1024 * 1024;
const MAX_FILES = 5;

interface PreviewFile {
  id: string;
  file: File;
  url: string;
}

export function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const canSubmit = previews.length > 0 && brand.trim() && model.trim() && year.trim() && !submitting;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handlePickFiles(e.dataTransfer.files);
  };

  const handlePickFiles = (files: FileList | null) => {
    setError(null);
    if (!files) return;
    const toAdd: PreviewFile[] = [];
    for (const f of Array.from(files)) {
      if (previews.length + toAdd.length >= MAX_FILES) {
        setError(`Максимум ${MAX_FILES} фото на один пост`);
        break;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        setError('Поддерживаются только JPEG, PNG и WEBP');
        continue;
      }
      if (f.size > MAX_SIZE) {
        setError('Один из файлов больше 8 МБ');
        continue;
      }
      toAdd.push({ id: `${Date.now()}-${Math.random()}`, file: f, url: URL.createObjectURL(f) });
    }
    setPreviews((prev) => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePreview = (i: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i].url);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setPreviews((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const reset = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    setBrand('');
    setModel('');
    setYear('');
    setCaption('');
    setDone(false);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!previews.length) return;
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      previews.forEach((p) => form.append('photos', p.file));
      form.append('brand', brand.trim());
      form.append('model', model.trim());
      form.append('year', year.trim());
      form.append('caption', caption.trim());
      await api.uploadCar(form);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить фото');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="pb-28 px-5 pt-24 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-accent-soft border border-accent-line flex items-center justify-center">
          <IconCheck size={26} className="text-accent" />
        </div>
        <h2 className="font-display font-bold text-[20px] mt-5">Опубликовано</h2>
        <p className="text-[14px] text-ink-dim mt-2 max-w-xs">
          Фото уже видно всем в ленте. Загляните во вкладку «Лента», чтобы проверить.
        </p>
        <button onClick={reset} className="mt-6 rounded-full bg-base-surface border border-base-line px-5 py-3 text-[14px] font-medium">
          Добавить ещё один пост
        </button>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <Header eyebrow="Поделиться" title="Добавить фото" />
      <div className="px-5 space-y-4">
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => handlePickFiles(e.target.files)} />

        {previews.length > 0 ? (
          <div>
            {/* Главное фото */}
            <div
              className={`relative rounded-xl2 overflow-hidden transition-opacity ${dragIndex === 0 ? 'opacity-40' : 'opacity-100'}`}
              draggable
              onDragStart={() => setDragIndex(0)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (dragIndex !== null) handleReorder(dragIndex, 0); setDragIndex(null); }}
            >
              <img src={previews[0].url} alt="Главное фото" className="w-full h-56 object-cover cursor-grab active:cursor-grabbing" />
              <button onClick={() => removePreview(0)} className="absolute top-3 right-3 rounded-full bg-base/75 border border-base-line p-2 text-ink">
                <IconClose size={16} />
              </button>
              {previews.length > 1 && (
                <div className="absolute bottom-2.5 right-2.5 rounded-full bg-base/70 border border-base-line px-2 py-0.5 text-[11px] font-medium text-ink backdrop-blur-sm">
                  1/{previews.length}
                </div>
              )}
              <div className="absolute top-3 left-3 rounded-full bg-base/70 border border-base-line px-2 py-0.5 text-[10px] text-ink-faint backdrop-blur-sm pointer-events-none">
                Главное
              </div>
            </div>

            {/* Доп. фото с drag & drop */}
            {previews.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
                {previews.slice(1).map((p, i) => {
                  const realIndex = i + 1;
                  const isDragging = dragIndex === realIndex;
                  const isOver = dragIndex !== null && dragIndex !== realIndex;
                  return (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={() => setDragIndex(realIndex)}
                      onDragEnd={() => setDragIndex(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); if (dragIndex !== null) handleReorder(dragIndex, realIndex); setDragIndex(null); }}
                      className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing transition-all
                        ${isDragging ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}
                        ${isOver ? 'ring-2 ring-accent' : ''}
                      `}
                    >
                      <img src={p.url} alt={`Фото ${realIndex + 1}`} className="w-full h-full object-cover" />
                      <button onClick={() => removePreview(realIndex)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-base/80 flex items-center justify-center text-ink">
                        <IconClose size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {previews.length < MAX_FILES && (
              <button onClick={() => fileInputRef.current?.click()} className="mt-2 w-full rounded-xl2 border border-dashed border-base-line bg-base-surface flex items-center justify-center gap-2 py-3 text-[13px] text-ink-faint">
                <IconPlus size={15} />
                Добавить ещё фото ({previews.length}/{MAX_FILES})
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`w-full h-44 rounded-xl2 border border-dashed bg-base-surface flex flex-col items-center justify-center gap-2 text-ink-faint transition-colors ${dragging ? 'border-accent bg-accent-soft' : 'border-base-line'}`}
          >
            <IconCamera size={24} className={dragging ? 'text-accent' : ''} />
            <span className={`text-[13px] ${dragging ? 'text-accent' : ''}`}>
              {dragging ? 'Отпустите чтобы добавить' : 'Выбрать фото или перетащить сюда'}
            </span>
            <span className="text-[11px] text-ink-faint">до {MAX_FILES} фото · JPEG, PNG, WEBP · макс. 8 МБ</span>
          </button>
        )}

        {error && <AnriAlert message={error} onClose={() => setError(null)} />}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Марка" value={brand} onChange={setBrand} placeholder="Nissan" maxLength={20} />
          <Field label="Модель" value={model} onChange={setModel} placeholder="Skyline GT-R" maxLength={20} />
        </div>
        <Field label="Год" value={year} onChange={(v) => {
          if (v === '' || /^\d{0,4}$/.test(v)) {
            const num = Number(v);
            if (v.length < 4 || (num >= 1885 && num <= new Date().getFullYear())) setYear(v);
          }
        }} placeholder="1999" numeric maxLength={4} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13px] text-ink-dim">Описание (необязательно)</div>
            <div className="text-[11px] text-ink-faint tabular">{caption.length}/500</div>
          </div>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 500))} rows={4} placeholder="Расскажите о вашей машине: где снято, модификации, история, особенности..." className="w-full rounded-xl2 bg-base-surface border border-base-line px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint outline-none focus:border-accent-line transition-colors resize-none" />
        </div>
      </div>

      <div className="fixed left-0 right-0 z-20 px-5" style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-full rounded-2xl py-4 font-display font-bold text-[15px] tracking-wide transition-all active:scale-[0.97] disabled:opacity-30"
          style={{ background: canSubmit ? 'linear-gradient(135deg, #4C7EA8 0%, #3a6690 100%)' : '#16181E', color: '#fff', boxShadow: canSubmit ? '0 4px 24px rgba(76,126,168,0.45)' : 'none' }}
        >
          {submitting ? 'Публикуем…' : 'Опубликовать в ленту'}
        </button>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  maxLength?: number;
}

function Field({ label, value, onChange, placeholder, numeric, maxLength }: FieldProps) {
  return (
    <div>
      <div className="text-[13px] text-ink-dim mb-2">{label}</div>
      <input value={value} onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)} placeholder={placeholder} inputMode={numeric ? 'numeric' : 'text'} maxLength={maxLength} className="w-full rounded-xl2 bg-base-surface border border-base-line px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint outline-none focus:border-accent-line transition-colors" />
    </div>
  );
}
