import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 22) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconGarage = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M3 21V10.5L12 4l9 6.5V21" />
    <path d="M6 21v-7h12v7" />
    <path d="M9 21v-4h6v4" />
  </svg>
);

export const IconTrophy = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
    <path d="M8 5H5a3 3 0 0 0 3 5" />
    <path d="M16 5h3a3 3 0 0 1-3 5" />
    <path d="M10 15v2a2 2 0 0 0 4 0v-2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </svg>
);

export const IconTag = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12.5 3H5a2 2 0 0 0-2 2v7.5a2 2 0 0 0 .59 1.41l9 9a2 2 0 0 0 2.82 0l7.5-7.5a2 2 0 0 0 0-2.82l-9-9A2 2 0 0 0 12.5 3z" />
    <circle cx="8.5" cy="8.5" r="1.5" />
  </svg>
);

export const IconUser = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20.5c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
  </svg>
);

export const IconBolt = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M13 3 5 13.5h5.2L11 21l8-10.5h-5.2L13 3z" />
  </svg>
);

export const IconGauge = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 4a9 9 0 0 0-7.4 14.1" />
    <path d="M12 4a9 9 0 0 1 7.4 14.1" />
    <path d="M4.6 18.1h14.8" />
    <path d="M12 13 15 9" />
    <circle cx="12" cy="13" r="1" />
  </svg>
);

export const IconWeight = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M8.5 7h7l2.5 13h-12L8.5 7z" />
    <path d="M9.5 7a2.5 2.5 0 0 1 5 0" />
  </svg>
);

export const IconTimer = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l3 2" />
    <path d="M10 2h4" />
    <path d="M12 2v2" />
  </svg>
);

export const IconTop = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 19h16" />
    <path d="M6 19V9l3-2 3 3 3-5 3 3v11" />
  </svg>
);

export const IconDrivetrain = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="6" cy="7" r="2.2" />
    <circle cx="18" cy="7" r="2.2" />
    <circle cx="6" cy="17" r="2.2" />
    <circle cx="18" cy="17" r="2.2" />
    <path d="M6 9.2V14.8" />
    <path d="M18 9.2V14.8" />
    <path d="M8.2 7h7.6" />
    <path d="M8.2 17h7.6" />
  </svg>
);

export const IconEngine = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="9" width="10" height="7" rx="1" />
    <path d="M13 11h3l3-2v9l-3-2h-3" />
    <path d="M6 9V6h4v3" />
  </svg>
);

export const IconChevronRight = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const IconChevronLeft = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const IconPlus = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

export const IconCamera = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 8h3l1.5-2h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="3.4" />
  </svg>
);

export const IconCheck = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M5 13l4 4 10-10" />
  </svg>
);

export const IconMedal = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="14" r="6" />
    <path d="M9 8.5 6 3h3l2 4" />
    <path d="M15 8.5 18 3h-3l-2 4" />
    <path d="M12 11v6" />
  </svg>
);

export const IconStar = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5z" />
  </svg>
);

export const IconClose = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </svg>
);

export const IconX = IconClose;

export const IconHeart = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 20s-7-4.35-9.5-9.06C1.1 8.1 2.4 5 5.6 4.4c1.9-.35 3.6.5 4.9 2.2 1.3-1.7 3-2.55 4.9-2.2 3.2.6 4.5 3.7 3.1 6.54C19 15.65 12 20 12 20z" />
  </svg>
);

export const IconHeartFilled = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M12 20s-7-4.35-9.5-9.06C1.1 8.1 2.4 5 5.6 4.4c1.9-.35 3.6.5 4.9 2.2 1.3-1.7 3-2.55 4.9-2.2 3.2.6 4.5 3.7 3.1 6.54C19 15.65 12 20 12 20z" />
  </svg>
);

export const IconBookmark = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-4-6.5 4V5a1 1 0 0 1 1-1z" />
  </svg>
);

export const IconBookmarkFilled = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-4-6.5 4V5a1 1 0 0 1 1-1z" />
  </svg>
);

export const IconTrash = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

export const IconImage = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M4.5 17.5 9 13l3.2 3.2L16 12l3.5 3.5" />
  </svg>
);

export const IconClock = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v5l3.2 1.8" />
  </svg>
);

export const IconEdit = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

export const IconSearch = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.3 15.3 20 20" />
  </svg>
);
