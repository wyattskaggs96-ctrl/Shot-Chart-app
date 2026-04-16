import { COURT_GEOMETRY } from '../../lib/courtGeometry';

export default function CourtBackground() {
  return (
    <rect
      x={COURT_GEOMETRY.padding}
      y={COURT_GEOMETRY.padding}
      width={COURT_GEOMETRY.width - COURT_GEOMETRY.padding * 2}
      height={COURT_GEOMETRY.height - COURT_GEOMETRY.padding}
      rx="8"
      fill="#0f1620"
    />
  );
}
