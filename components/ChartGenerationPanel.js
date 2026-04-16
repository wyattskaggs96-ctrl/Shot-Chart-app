import { COURT } from '../lib/constants';

export default function ChartGenerationPanel({ shots }) {
  return (
    <section className="panel">
      <h2>Auto-Generated Shot Chart</h2>
      <div className="court-wrapper">
        <svg className="court-svg" viewBox={`0 0 ${COURT.width} ${COURT.height}`}>
          <rect x="0" y="0" width={COURT.width} height={COURT.height} fill="#fffdf7" />
          <rect x="30" y="30" width={COURT.width - 60} height={COURT.height - 30} fill="none" stroke="#0f172a" strokeWidth="4" />
          <line x1="30" y1="140" x2={COURT.width - 30} y2="140" stroke="#0f172a" strokeWidth="4" />
          <line x1="30" y1="30" x2="30" y2="300" stroke="#0f172a" strokeWidth="4" />
          <line x1={COURT.width - 30} y1="30" x2={COURT.width - 30} y2="300" stroke="#0f172a" strokeWidth="4" />
          <path d={`M 30 300 Q ${COURT.width / 2} ${COURT.height - 20} ${COURT.width - 30} 300`} fill="none" stroke="#0f172a" strokeWidth="4" />

          {shots.map((shot, index) => (
            <g key={shot.id}>
              <circle
                cx={shot.x}
                cy={shot.y}
                r="8"
                fill={shot.result === 'MAKE' ? '#22c55e' : '#ef4444'}
                stroke="#0f172a"
              />
              <text x={shot.x + 9} y={shot.y - 8} className="marker-index">{index + 1}</text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
