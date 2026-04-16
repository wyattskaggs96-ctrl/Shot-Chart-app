import { COURT_GEOMETRY } from '../../lib/courtGeometry';

export default function HoopAndBackboard() {
  const { hoopX, hoopY, hoopRadius, backboardY, backboardWidth } = COURT_GEOMETRY;

  return (
    <g stroke="#f8fafc" fill="none" strokeLinecap="round">
      <line x1={hoopX - backboardWidth / 2} y1={backboardY} x2={hoopX + backboardWidth / 2} y2={backboardY} strokeWidth="3" />
      <circle cx={hoopX} cy={hoopY} r={hoopRadius} strokeWidth="2.8" />
    </g>
  );
}
