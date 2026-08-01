import { IconX } from './icons';
import anriAvatar from '@/data/bot.png';

interface AnriAlertProps {
  message: string;
  onClose: () => void;
}

export function AnriAlert({ message, onClose }: AnriAlertProps) {
  const text = message
    .replace(/^Анри не пропустил:\s*/i, '')
    .replace(/^Анри:\s*/i, '');

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 pb-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-sm card-outline rounded-xl2 bg-base-raised overflow-hidden shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <img
                src={anriAvatar}
                alt="Анри"
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-base-line"
              />
              <div>
                <div className="font-display font-semibold text-[14px] text-ink">Анри</div>
                <div className="text-[11px] text-ink-faint">модератор</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-ink-faint hover:text-ink transition-colors mt-0.5"
            >
              <IconX size={18} />
            </button>
          </div>

          <p className="text-[13px] text-ink-dim leading-relaxed">{text}</p>

          <button
            onClick={onClose}
            className="mt-4 w-full rounded-full bg-base-surface border border-base-line text-ink-dim font-medium text-[13px] py-2.5 active:scale-[0.98] transition-transform"
          >
            Понял, исправлю
          </button>
        </div>
      </div>
    </div>
  );
}
