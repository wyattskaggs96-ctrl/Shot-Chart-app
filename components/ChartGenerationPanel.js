import { useMemo, useState } from 'react';
import { getDemoShots } from '../lib/courtGeometry';
import CourtSVG from './court/CourtSVG';
import MarkerLayer from './court/MarkerLayer';

export default function ChartGenerationPanel({ shots }) {
  const [showDemoMarkers, setShowDemoMarkers] = useState(false);

  const renderedShots = useMemo(
    () => (showDemoMarkers ? getDemoShots() : shots),
    [showDemoMarkers, shots],
  );

  return (
    <section className="panel">
      <div className="list-header">
        <h2>Auto-Generated Shot Chart</h2>
        <button type="button" onClick={() => setShowDemoMarkers((prev) => !prev)}>
          {showDemoMarkers ? 'Hide Demo Markers' : 'Show Demo Markers'}
        </button>
      </div>

      <div className="court-wrapper dark-court-wrapper">
        <CourtSVG>
          <MarkerLayer shots={renderedShots} />
        </CourtSVG>
      </div>
    </section>
  );
}
