import { ZONES } from '../lib/constants';
import { formatClock } from '../lib/format';

export default function ShotEditorPanel({ shot, onChange, onDelete }) {
  return (
    <section className="panel">
      <h2>Selected Shot</h2>
      {!shot ? (
        <p className="empty">Click a shot marker or row to edit.</p>
      ) : (
        <>
          <p className="shot-meta">Timestamp: <strong>{formatClock(shot.timestampSeconds)}</strong></p>
          <div className="row compact">
            <button
              type="button"
              className={shot.makeMiss === 'MAKE' ? 'active make' : 'make'}
              onClick={() => onChange({ makeMiss: 'MAKE' })}
            >
              Make
            </button>
            <button
              type="button"
              className={shot.makeMiss === 'MISS' ? 'active miss' : 'miss'}
              onClick={() => onChange({ makeMiss: 'MISS' })}
            >
              Miss
            </button>
          </div>

          <label className="stacked">
            Zone
            <select value={shot.zone} onChange={(event) => onChange({ zone: event.target.value })}>
              {ZONES.map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </label>

          <label className="stacked">
            Shot Type (optional)
            <input
              value={shot.shotType ?? ''}
              onChange={(event) => onChange({ shotType: event.target.value })}
              placeholder="e.g. Pull-up 3"
            />
          </label>

          <label className="stacked">
            Notes
            <textarea
              rows={3}
              value={shot.notes ?? ''}
              onChange={(event) => onChange({ notes: event.target.value })}
              placeholder="Any context on this attempt"
            />
          </label>

          <button type="button" className="delete-btn" onClick={() => onDelete(shot.id)}>
            Delete Shot
          </button>
        </>
      )}
    </section>
  );
}
