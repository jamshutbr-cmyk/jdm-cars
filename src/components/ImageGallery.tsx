import { useState, useRef } from 'react';
import { resolveImageUrl } from '@/api';

interface ImageGalleryProps {
  imageUrls: string[];
  alt: string;
  className?: string;
  onClick?: () => void;
  showCounter?: boolean;
}

export function ImageGallery({ imageUrls, alt, className = 'w-full h-56 object-cover', onClick, showCounter = true }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);
  const startX = useRef<number | null>(null);

  if (imageUrls.length === 1) {
    return (
      <img
        src={resolveImageUrl(imageUrls[0])}
        alt={alt}
        className={`${className} cursor-pointer`}
        loading="lazy"
        onClick={onClick}
      />
    );
  }

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + imageUrls.length) % imageUrls.length);
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % imageUrls.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) setCurrent((c) => (c + 1) % imageUrls.length);
      else setCurrent((c) => (c - 1 + imageUrls.length) % imageUrls.length);
    }
    startX.current = null;
  };

  return (
    <div
      className="relative overflow-hidden cursor-pointer select-none"
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Фото */}
      <img
        src={resolveImageUrl(imageUrls[current])}
        alt={`${alt} ${current + 1}`}
        className={className}
        loading="lazy"
        draggable={false}
      />

      {/* Стрелки */}
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-base/70 border border-base-line flex items-center justify-center text-ink backdrop-blur-sm"
        onClick={prev}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 6l-6 6 6 6"/>
        </svg>
      </button>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-base/70 border border-base-line flex items-center justify-center text-ink backdrop-blur-sm"
        onClick={next}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6"/>
        </svg>
      </button>

      {/* Точки-индикаторы */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {imageUrls.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            className={`rounded-full transition-all ${
              i === current
                ? 'w-4 h-1.5 bg-white'
                : 'w-1.5 h-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Счётчик — только в карточке, не в модалке */}
      {showCounter && (
        <div className="absolute top-2.5 right-2.5 rounded-full bg-base/70 border border-base-line px-2 py-0.5 text-[11px] font-medium text-ink backdrop-blur-sm pointer-events-none">
          {current + 1}/{imageUrls.length}
        </div>
      )}
    </div>
  );
}
