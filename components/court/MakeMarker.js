import { memo } from 'react';

function MakeMarker({ x, y, label }) {
  return (
    <g className="shot-marker make-marker">
      <circle cx={x} cy={y} r="7" fill="rgba(34, 197, 94, 0.88)" stroke="#d1fae5" strokeWidth="1.2" />
      <title>{label}</title>
    </g>
  );
}

export default memo(MakeMarker);
