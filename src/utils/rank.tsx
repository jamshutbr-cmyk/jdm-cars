import type { ReactNode } from 'react';

export interface Rank {
  title: string;
  icon: ReactNode;
  color: string;
  bg: string;
  border: string;
  minLikes: number;
  nextAt: number | null;
}

const tierStyles = {
  dim:    { color: 'text-ink-dim',  bg: 'bg-base-surface', border: 'border-base-line' },
  accent: { color: 'text-accent',   bg: 'bg-accent-soft',  border: 'border-accent-line' },
  racing: { color: 'text-racing',   bg: 'bg-racing-soft',  border: 'border-racing/30' },
};

const s = { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none' as const, stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const RankIcons: Record<string, ReactNode> = {
  'Новичок':    <svg {...s}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  'Механик':    <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M4.93 4.93A10 10 0 0 1 19.07 19.07"/></svg>,
  'Гонщик':     <svg {...s}><path d="M13 3 5 13.5h5.2L11 21l8-10.5h-5.2L13 3z"/></svg>,
  'Тюнер':      <svg {...s}><path d="M4 19h16"/><path d="M6 19V9l3-2 3 3 3-5 3 3v11"/></svg>,
  'JDM Мастер': <svg {...s}><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 5H5a3 3 0 0 0 3 5"/><path d="M16 5h3a3 3 0 0 1-3 5"/><path d="M10 15v2a2 2 0 0 0 4 0v-2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
  'Легенда':    <svg {...s}><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5z"/></svg>,
};

const rankDefs: Array<{ title: string; minLikes: number; nextAt: number | null; tier: keyof typeof tierStyles }> = [
  { title: 'Новичок',    minLikes: 0,   nextAt: 5,    tier: 'dim'    },
  { title: 'Механик',    minLikes: 5,   nextAt: 20,   tier: 'dim'    },
  { title: 'Гонщик',     minLikes: 20,  nextAt: 50,   tier: 'accent' },
  { title: 'Тюнер',      minLikes: 50,  nextAt: 150,  tier: 'accent' },
  { title: 'JDM Мастер', minLikes: 150, nextAt: 500,  tier: 'racing' },
  { title: 'Легенда',    minLikes: 500, nextAt: null,  tier: 'racing' },
];

export function getRank(totalLikes: number): Rank {
  let def = rankDefs[0];
  for (const d of rankDefs) {
    if (totalLikes >= d.minLikes) def = d;
  }
  return { ...def, ...tierStyles[def.tier], icon: RankIcons[def.title] };
}

export function getRankProgress(totalLikes: number): number {
  const rank = getRank(totalLikes);
  if (rank.nextAt === null) return 100;
  return Math.min(100, Math.round(((totalLikes - rank.minLikes) / (rank.nextAt - rank.minLikes)) * 100));
}
