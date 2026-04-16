import { ZONES } from '../lib/constants';

export default function StatsPanel({ shots }) {
  const total = shots.length;
  const makes = shots.filter((shot) => shot.makeMiss === 'MAKE').length;
  const misses = total - makes;
  const fgPct = total > 0 ? (makes / total) * 100 : 0;

  const byZone = ZONES.map((zone) => {
    const attempts = shots.filter((shot) => shot.zone === zone).length;
    const zoneMakes = shots.filter((shot) => shot.zone === zone && shot.makeMiss === 'MAKE').length;
    return {
      zone,
      attempts,
      makes: zoneMakes,
      fg: attempts > 0 ? (zoneMakes / attempts) * 100 : 0,
    };
  });

  return (
    <section className="panel">
      <h2>Analytics</h2>
      <div className="stats-grid">
        <div><span>Total</span><strong>{total}</strong></div>
        <div><span>Makes</span><strong>{makes}</strong></div>
        <div><span>Misses</span><strong>{misses}</strong></div>
        <div><span>FG%</span><strong>{fgPct.toFixed(1)}%</strong></div>
      </div>

      <table className="zone-table">
        <thead>
          <tr>
            <th>Zone</th>
            <th>Att</th>
            <th>Makes</th>
            <th>FG%</th>
          </tr>
        </thead>
        <tbody>
          {byZone.map((row) => (
            <tr key={row.zone}>
              <td>{row.zone}</td>
              <td>{row.attempts}</td>
              <td>{row.makes}</td>
              <td>{row.fg.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
