import { COURT_GEOMETRY, getThreeArcJoinY, getThreePointArcPath } from '../../lib/courtGeometry';

export default function CourtLines() {
  const g = COURT_GEOMETRY;
  const courtBottom = g.height - g.padding;
  const laneLeft = g.hoopX - g.laneWidth / 2;
  const laneRight = g.hoopX + g.laneWidth / 2;
  const joinY = getThreeArcJoinY();

  return (
    <g stroke="#f8fafc" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x={g.padding} y={g.padding} width={g.width - g.padding * 2} height={courtBottom - g.padding} />

      <line x1={laneLeft} y1={g.laneTopY} x2={laneLeft} y2={g.laneBottomY} />
      <line x1={laneRight} y1={g.laneTopY} x2={laneRight} y2={g.laneBottomY} />
      <line x1={laneLeft} y1={g.laneBottomY} x2={laneRight} y2={g.laneBottomY} />

      <path d={`M ${g.hoopX - g.freeThrowRadius} ${g.laneBottomY} A ${g.freeThrowRadius} ${g.freeThrowRadius} 0 0 1 ${g.hoopX + g.freeThrowRadius} ${g.laneBottomY}`} />
      <path d={`M ${g.hoopX - g.freeThrowRadius} ${g.laneBottomY} A ${g.freeThrowRadius} ${g.freeThrowRadius} 0 0 0 ${g.hoopX + g.freeThrowRadius} ${g.laneBottomY}`} strokeDasharray="6 6" opacity="0.9" />

      <path d={`M ${g.hoopX - g.restrictedRadius} ${g.hoopY + g.restrictedRadius} A ${g.restrictedRadius} ${g.restrictedRadius} 0 0 1 ${g.hoopX + g.restrictedRadius} ${g.hoopY + g.restrictedRadius}`} strokeDasharray="4 6" />

      <line x1={g.cornerThreeXLeft} y1={g.padding} x2={g.cornerThreeXLeft} y2={joinY} />
      <line x1={g.cornerThreeXRight} y1={g.padding} x2={g.cornerThreeXRight} y2={joinY} />
      <path d={getThreePointArcPath()} />
    </g>
  );
}
