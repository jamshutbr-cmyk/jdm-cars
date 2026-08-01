import { useLayoutEffect, useRef, useState } from 'react';
import type { TabKey } from '@/types';
import { IconImage, IconTrophy, IconPlus, IconUser } from './icons';

interface NavBarProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const tabs: Array<{ key: TabKey; label: string; Icon: typeof IconImage }> = [
  { key: 'feed', label: 'Лента', Icon: IconImage },
  { key: 'leaderboard', label: 'Топ', Icon: IconTrophy },
  { key: 'upload', label: 'Добавить', Icon: IconPlus },
  { key: 'profile', label: 'Профиль', Icon: IconUser },
];

export function NavBar({ active, onChange }: NavBarProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState({ x: 0, width: 0 });

  useLayoutEffect(() => {
    const el = refs.current[active];
    if (el) {
      setPill({ x: el.offsetLeft, width: el.offsetWidth });
    }
  }, [active]);

  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-40 flex justify-center px-4"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 14px)' }}
    >
      <div className="glass-shell relative flex items-center gap-1 rounded-full px-1.5 py-1.5 shadow-card">
        <div
          className="glass-pill absolute top-1.5 bottom-1.5 rounded-full"
          style={{ transform: `translateX(${pill.x - 6}px)`, width: pill.width }}
        />
        {tabs.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              ref={(node) => {
                refs.current[key] = node;
              }}
              onClick={() => onChange(key)}
              className={`relative z-10 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-300 ${
                isActive ? 'text-ink' : 'text-ink-dim'
              }`}
            >
              <Icon size={18} />
              <span className={isActive ? 'inline' : 'hidden sm:inline'}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
