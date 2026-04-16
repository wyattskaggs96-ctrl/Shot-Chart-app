import CourtSVG from './court/CourtSVG';
import ShotLayer from './court/ShotLayer';

export default function ChartGenerationPanel({ shots }) {
  return (
    <section className="panel">
      <h2>Auto-Generated Shot Chart</h2>
      <div className="court-wrapper dark-court-wrapper">
        <CourtSVG>
          <ShotLayer shots={shots} />
        </CourtSVG>
      </div>
    </section>
  );
}
