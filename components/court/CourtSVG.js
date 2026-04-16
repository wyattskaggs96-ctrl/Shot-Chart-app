import { COURT_GEOMETRY } from '../../lib/courtGeometry';
import CourtBackground from './CourtBackground';
import CourtLines from './CourtLines';
import HoopAndBackboard from './HoopAndBackboard';

export default function CourtSVG({ children }) {
  return (
    <svg
      className="court-svg dark"
      viewBox={`0 0 ${COURT_GEOMETRY.width} ${COURT_GEOMETRY.height}`}
      role="img"
      aria-label="Professional dark half-court shot chart"
    >
      <rect x="0" y="0" width={COURT_GEOMETRY.width} height={COURT_GEOMETRY.height} fill="#0a1018" />
      <CourtBackground />
      <CourtLines />
      <HoopAndBackboard />
      {children}
    </svg>
  );
}
