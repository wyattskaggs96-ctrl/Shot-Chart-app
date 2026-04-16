export default function PlayerFilterPanel({ players, selectedPlayer, onChange }) {
  return (
    <section className="panel">
      <h2>Player Filter</h2>
      <label className="stacked">
        Selected Player
        <select value={selectedPlayer} onChange={(event) => onChange(event.target.value)}>
          <option value="ALL">All Players</option>
          {players.map((player) => (
            <option key={player} value={player}>{player}</option>
          ))}
        </select>
      </label>
    </section>
  );
}
