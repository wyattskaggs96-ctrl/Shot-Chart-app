import { useEffect, useRef } from 'react';
import { COURT, LOGGING_MODES, ZONES } from '../lib/constants';
import { classifyZone, getZoneOverlay, snapShotToZone } from '../lib/zones';
import { clamp } from '../lib/format';

function CourtSvg({ shots, selectedShotId, pendingResult, mode, onCourtClick, onSelectShot, onDragShot }) {
  const overlays = getZoneOverlay();

  return (
    <svg
      className="court-svg"
      viewBox={`0 0 ${COURT.width} ${COURT.height}`}
      onClick={onCourtClick}
      onMouseMove={onDragShot}
      role="img"
      aria-label="Basketball half-court"
    >
      <rect x="0" y="0" width={COURT.width} height={COURT.height} fill="#fffdf7" />
      <rect x="30" y="30" width={COURT.width - 60} height={COURT.height - 30} fill="none" stroke="#0f172a" strokeWidth="4" />
      <circle cx={COURT.width / 2} cy="90" r="60" fill="none" stroke="#0f172a" strokeWidth="4" />
      <line x1="30" y1="140" x2={COURT.width - 30} y2="140" stroke="#0f172a" strokeWidth="4" />
      <rect x={COURT.width / 2 - 80} y="30" width="160" height="190" fill="none" stroke="#0f172a" strokeWidth="4" />
      <line x1="30" y1="30" x2="30" y2="300" stroke="#0f172a" strokeWidth="4" />
      <line x1={COURT.width - 30} y1="30" x2={COURT.width - 30} y2="300" stroke="#0f172a" strokeWidth="4" />
      <path d={`M 30 300 Q ${COURT.width / 2} ${COURT.height - 20} ${COURT.width - 30} 300`} fill="none" stroke="#0f172a" strokeWidth="4" />

      {overlays.map((zone) => (
        <text key={zone.zone} x={zone.x} y={zone.y} className="zone-label">
          {zone.zone}
        </text>
      ))}

      {shots.map((shot, index) => (
        <g
          key={shot.id}
          onMouseDown={(event) => onSelectShot(event, shot.id)}
          onClick={(event) => {
            event.stopPropagation();
            onSelectShot(event, shot.id);
          }}
          className="marker-group"
        >
          <circle
            cx={shot.x}
            cy={shot.y}
            r={selectedShotId === shot.id ? 11 : 8}
            fill={shot.makeMiss === 'MAKE' ? '#22c55e' : '#ef4444'}
            stroke={selectedShotId === shot.id ? '#1d4ed8' : '#0f172a'}
            strokeWidth={selectedShotId === shot.id ? '3' : '1'}
          />
          <text x={shot.x + 10} y={shot.y - 9} className="marker-index">{index + 1}</text>
        </g>
      ))}

      {pendingResult && (
        <text x="16" y={COURT.height - 18} className="pending-label">
          {mode === LOGGING_MODES.QUICK
            ? `Quick Mode: click court to snap a ${pendingResult.toLowerCase()} to nearest zone`
            : `Precision Mode: click exact location for ${pendingResult.toLowerCase()}`}
        </text>
      )}
    </svg>
  );
}

export default function CourtPanel({
  mode,
  setMode,
  pendingResult,
  setPendingResult,
  shots,
  selectedShotId,
  onSelectShotId,
  onAddShot,
  onUpdateShot,
}) {
  const draggingShotIdRef = useRef(null);

  useEffect(() => {
    const stopDrag = () => {
      draggingShotIdRef.current = null;
    };

    window.addEventListener('mouseup', stopDrag);
    return () => window.removeEventListener('mouseup', stopDrag);
  }, []);

  function convertToSvgCoordinates(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * COURT.width, 0, COURT.width);
    const y = clamp(((event.clientY - rect.top) / rect.height) * COURT.height, 0, COURT.height);
    return { x, y };
  }

  function handleCourtClick(event) {
    if (!pendingResult) return;

    const raw = convertToSvgCoordinates(event);
    if (mode === LOGGING_MODES.QUICK) {
      const snapped = snapShotToZone(raw.x, raw.y);
      onAddShot({ ...snapped, makeMiss: pendingResult });
    } else {
      onAddShot({
        x: raw.x,
        y: raw.y,
        zone: classifyZone(raw.x, raw.y),
        makeMiss: pendingResult,
      });
    }

    setPendingResult(null);
  }

  function handleSelectShot(event, shotId) {
    onSelectShotId(shotId);
    if (mode === LOGGING_MODES.PRECISION && event.type === 'mousedown') {
      draggingShotIdRef.current = shotId;
    }
  }

  function handleDragShot(event) {
    if (!draggingShotIdRef.current || mode !== LOGGING_MODES.PRECISION || (event.buttons & 1) !== 1) {
      return;
    }

    const next = convertToSvgCoordinates(event);
    onUpdateShot(draggingShotIdRef.current, {
      x: next.x,
      y: next.y,
      zone: classifyZone(next.x, next.y),
    });
  }

  return (
    <section className="panel">
      <h2>Shot Chart</h2>

      <div className="mode-toggle" role="tablist" aria-label="Logging mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === LOGGING_MODES.QUICK}
          className={mode === LOGGING_MODES.QUICK ? 'active' : ''}
          onClick={() => setMode(LOGGING_MODES.QUICK)}
        >
          Quick Mode
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === LOGGING_MODES.PRECISION}
          className={mode === LOGGING_MODES.PRECISION ? 'active' : ''}
          onClick={() => setMode(LOGGING_MODES.PRECISION)}
        >
          Precision Mode
        </button>
      </div>

      <div className="row compact">
        <button
          type="button"
          className={pendingResult === 'MAKE' ? 'active make' : 'make'}
          onClick={() => setPendingResult('MAKE')}
        >
          Log Make
        </button>
        <button
          type="button"
          className={pendingResult === 'MISS' ? 'active miss' : 'miss'}
          onClick={() => setPendingResult('MISS')}
        >
          Log Miss
        </button>
      </div>

      <p className="hint">
        {mode === LOGGING_MODES.QUICK
          ? 'Quick Mode snaps clicks to zone anchors to reduce manual precision work.'
          : 'Precision Mode preserves exact click points and enables marker dragging.'}
      </p>

      <div className="court-wrapper">
        <CourtSvg
          shots={shots}
          selectedShotId={selectedShotId}
          pendingResult={pendingResult}
          mode={mode}
          onCourtClick={handleCourtClick}
          onSelectShot={handleSelectShot}
          onDragShot={handleDragShot}
        />
      </div>

      <p className="legend">Zones: {ZONES.join(' • ')}</p>
    </section>
  );
}
