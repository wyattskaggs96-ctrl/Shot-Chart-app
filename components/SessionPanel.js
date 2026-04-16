export default function SessionPanel({ session, onChange, onSave, onLoad, onClear }) {
  return (
    <section className="panel">
      <h2>Session</h2>
      <div className="session-grid">
        <label>
          Player Name
          <input
            value={session.playerName}
            onChange={(event) => onChange('playerName', event.target.value)}
            placeholder="e.g. J. Smith"
          />
        </label>
        <label>
          Opponent
          <input
            value={session.opponent}
            onChange={(event) => onChange('opponent', event.target.value)}
            placeholder="e.g. Lakers"
          />
        </label>
        <label>
          Game Date
          <input
            type="date"
            value={session.gameDate}
            onChange={(event) => onChange('gameDate', event.target.value)}
          />
        </label>
      </div>

      <label className="session-notes">
        Session Notes
        <textarea
          rows={3}
          value={session.notes}
          onChange={(event) => onChange('notes', event.target.value)}
          placeholder="Context for this chart..."
        />
      </label>

      <div className="row compact">
        <button type="button" onClick={onSave}>Save Session</button>
        <button type="button" onClick={onLoad}>Load Session</button>
        <button type="button" onClick={onClear}>Clear Session</button>
      </div>
    </section>
  );
}
