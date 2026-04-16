import { getSupportedZones } from '../lib/zoneInference';

const ZONES = getSupportedZones();

export default function ReviewQueuePanel({ queue, onUpdate, onConfirm, onReject }) {
  return (
    <section className="panel">
      <h2>Needs Review Queue</h2>
      {queue.length === 0 ? (
        <p className="empty">No events need review.</p>
      ) : (
        <div className="review-list">
          {queue.map((item) => (
            <div key={item.id} className="review-card">
              <div className="review-head">
                <strong>{item.playerName || 'Unknown Player'}</strong>
                <span className="badge needs">Needs Review</span>
              </div>
              <p className="muted">{item.rawDescription || item.shotType || 'No description'}</p>

              <div className="review-grid">
                <label className="stacked">Result
                  <select value={item.result ?? ''} onChange={(e) => onUpdate(item.id, { result: e.target.value || null })}>
                    <option value="">Unknown</option>
                    <option value="MAKE">MAKE</option>
                    <option value="MISS">MISS</option>
                  </select>
                </label>
                <label className="stacked">Zone
                  <select value={item.zone ?? 'Unknown'} onChange={(e) => onUpdate(item.id, { zone: e.target.value })}>
                    {ZONES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
                  </select>
                </label>
                <label className="stacked">X
                  <input value={item.x ?? ''} onChange={(e) => onUpdate(item.id, { x: Number(e.target.value) })} />
                </label>
                <label className="stacked">Y
                  <input value={item.y ?? ''} onChange={(e) => onUpdate(item.id, { y: Number(e.target.value) })} />
                </label>
              </div>

              <label className="stacked">Notes
                <input value={item.notes ?? ''} onChange={(e) => onUpdate(item.id, { notes: e.target.value })} />
              </label>

              <div className="row compact">
                <button type="button" onClick={() => onConfirm(item.id)}>Confirm Event</button>
                <button type="button" className="delete-btn" onClick={() => onReject(item.id)}>Reject Event</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
