import { COURT } from '../../lib/constants';

export default function CourtSVG({ children }) {
  const cx = COURT.width / 2;

  return (
    <svg className="court-svg dark" viewBox={`0 0 ${COURT.width} ${COURT.height}`} role="img" aria-label="Dark themed basketball half court shot chart">
      <defs>
        <pattern id="dottedStroke" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#d1d5db" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={COURT.width} height={COURT.height} fill="#111418" rx="10" />

      <g stroke="#f8fafc" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="30" y="30" width={COURT.width - 60} height={COURT.height - 30} />

        <line x1={cx - 22} y1="44" x2={cx + 22} y2="44" />
        <circle cx={cx} cy="56" r="7" />

        <rect x={cx - 80} y="30" width="160" height="190" />
        <rect x={cx - 60} y="30" width="120" height="190" />

        <line x1="30" y1="300" x2="30" y2="30" />
        <line x1={COURT.width - 30} y1="300" x2={COURT.width - 30} y2="30" />
        <path d={`M 30 300 Q ${cx} ${COURT.height - 30} ${COURT.width - 30} 300`} />

        <line x1="30" y1="140" x2={COURT.width - 30} y2="140" />
        <path d={`M ${cx - 60} 140 A 60 60 0 0 1 ${cx + 60} 140`} />
        <path d={`M ${cx - 60} 140 A 60 60 0 0 0 ${cx + 60} 140`} stroke="url(#dottedStroke)" />

        <path d={`M ${cx - 40} 92 A 40 40 0 0 0 ${cx + 40} 92`} stroke="url(#dottedStroke)" />
      </g>

      {children}
    </svg>
  );
}
