import { exportShotsToCsv } from '../lib/export';
import { formatClock } from '../lib/format';

export default function ShotListPanel({ shots, selectedShotId, onSelect, onDelete }) {
  return (
    <section className="panel">
      <div className="list-header">
        <h2>Shot List</h2>
        <button type="button" disabled={shots.length === 0} onClick={() => exportShotsToCsv(shots)}>
          Export CSV
        </button>
      </div>

      {shots.length === 0 ? (
        <p className="empty">No shots logged yet.</p>
      ) : (
        <table className="shot-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Result</th>
              <th>Zone</th>
              <th>X</th>
              <th>Y</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shots.map((shot, index) => (
              <tr
                key={shot.id}
                className={selectedShotId === shot.id ? 'selected-row' : ''}
                onClick={() => onSelect(shot.id)}
              >
                <td>{index + 1}</td>
                <td>{shot.makeMiss}</td>
                <td>{shot.zone}</td>
                <td>{shot.x.toFixed(1)}</td>
                <td>{shot.y.toFixed(1)}</td>
                <td>{formatClock(shot.timestampSeconds)}</td>
                <td>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(shot.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
