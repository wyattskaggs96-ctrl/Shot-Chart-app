import { memo } from 'react';

function MissMarker({ x, y, label }) {
  return (
    <g className="shot-marker miss-marker">
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} stroke="#f87171" strokeWidth="2.6" strokeLinecap="round" />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} stroke="#f87171" strokeWidth="2.6" strokeLinecap="round" />
      <title>{label}</title>
    </g>
  );
}

export default memo(MissMarker);
