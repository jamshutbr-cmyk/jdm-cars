import type { CarCategory } from '@/types';

interface CarArtProps {
  category: CarCategory;
  seed: string;
  className?: string;
}

// Deterministic pseudo-random from a string seed, used only to vary silhouette details
function hash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const categoryAccent: Record<CarCategory, string> = {
  'JDM Legends': '#4C7EA8',
  Drift: '#A63B34',
  Tuner: '#8A8D93',
  Kei: '#6E7681',
  GT: '#4C7EA8',
};

export function CarArt({ category, seed, className }: CarArtProps) {
  const n = hash(seed);
  const hasWing = category === 'Drift' || (n % 3 === 0 && category !== 'Kei');
  const roofDrop = category === 'Kei' ? 6 : 0;
  const accent = categoryAccent[category];

  return (
    <div className={className}>
      <svg viewBox="0 0 320 180" className="w-full h-full" fill="none">
        <rect x="0" y="0" width="320" height="180" fill="#101218" />
        <line x1="0" y1="150" x2="320" y2="150" stroke="#242730" strokeWidth="1" />
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1={i * 40} y1="0" x2={i * 40} y2="180" stroke="#1B1E25" strokeWidth="1" />
        ))}

        {/* ground shadow */}
        <ellipse cx="165" cy="153" rx="118" ry="7" fill="#000000" opacity="0.35" />

        {/* body */}
        <path
          d={`M40 ${140 - roofDrop}
              C 50 ${112 - roofDrop} 78 ${98 - roofDrop} 108 ${96 - roofDrop}
              L 132 ${64 - roofDrop}
              C 140 ${56 - roofDrop} 152 ${52 - roofDrop} 164 ${52 - roofDrop}
              L 202 ${52 - roofDrop}
              C 214 ${52 - roofDrop} 224 ${58 - roofDrop} 230 ${68 - roofDrop}
              L 244 ${96 - roofDrop}
              C 262 ${99 - roofDrop} 276 ${108 - roofDrop} 284 ${122 - roofDrop}
              L 288 140
              L 40 140 Z`}
          fill="#181B22"
          stroke={accent}
          strokeOpacity="0.55"
          strokeWidth="1.6"
        />

        {/* cabin glass */}
        <path
          d={`M134 ${63 - roofDrop} L 160 ${55 - roofDrop} L 200 ${55 - roofDrop} L 226 ${65 - roofDrop} L 222 ${95 - roofDrop} L 140 ${95 - roofDrop} Z`}
          fill="#0B0D12"
          stroke={accent}
          strokeOpacity="0.35"
          strokeWidth="1.2"
        />

        {/* side accent line */}
        <path d="M46 122 L 282 122" stroke={accent} strokeOpacity="0.8" strokeWidth="1.4" />

        {/* front bumper detail */}
        <path d="M40 140 L40 128 C 40 122 44 118 50 118 L 66 118" stroke="#2A2E38" strokeWidth="1.2" />

        {/* wheels */}
        <circle cx="98" cy="140" r="19" fill="#0B0D12" stroke="#2A2E38" strokeWidth="2" />
        <circle cx="98" cy="140" r="9" fill="none" stroke={accent} strokeOpacity="0.7" strokeWidth="1.4" />
        <circle cx="236" cy="140" r="19" fill="#0B0D12" stroke="#2A2E38" strokeWidth="2" />
        <circle cx="236" cy="140" r="9" fill="none" stroke={accent} strokeOpacity="0.7" strokeWidth="1.4" />

        {/* headlight / taillight */}
        <rect x="42" y="102" width="10" height="6" rx="1.5" fill={accent} opacity="0.55" />
        <rect x="276" y="102" width="8" height="5" rx="1.5" fill="#A63B34" opacity="0.5" />

        {hasWing && (
          <path
            d={`M250 ${96 - roofDrop} L282 ${94 - roofDrop} M250 ${96 - roofDrop} L250 ${86 - roofDrop} L 264 ${86 - roofDrop} M282 ${94 - roofDrop} L282 ${84 - roofDrop} L268 ${84 - roofDrop}`}
            stroke={accent}
            strokeOpacity="0.75"
            strokeWidth="1.6"
          />
        )}
      </svg>
    </div>
  );
}
