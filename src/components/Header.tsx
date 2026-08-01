import type { ReactNode } from 'react';

interface HeaderProps {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
}

export function Header({ eyebrow, title, right }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <div className="flex items-center gap-2 font-display text-[20px] leading-tight tracking-tight">
        {eyebrow && (
          <>
            <span className="font-medium text-ink-faint">{eyebrow}</span>
            <span className="text-ink-faint/40">/</span>
          </>
        )}
        <span className="font-bold text-ink">{title}</span>
      </div>
      {right}
    </div>
  );
}
