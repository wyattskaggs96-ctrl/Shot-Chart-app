const FIELDS = [
  'playerName',
  'result',
  'shotType',
  'x',
  'y',
  'zone',
  'period',
  'gameClock',
  'distanceFeet',
  'rawDescription',
  'team',
  'opponent',
  'timestampSeconds',
];

export default function DataMappingPanel({ detectedKeys, mapping, onChange, onSavePreset, onLoadPreset, onNormalize }) {
  if (detectedKeys.length === 0) {
    return (
      <section className="panel">
        <h2>Data Mapping</h2>
        <p className="empty">Parse some JSON/CSV first to detect fields.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Data Mapping</h2>
      <p className="muted">Map source keys to normalized event fields.</p>

      <div className="mapping-grid">
        {FIELDS.map((field) => (
          <label key={field} className="stacked">
            {field}
            <select value={mapping[field] ?? ''} onChange={(event) => onChange(field, event.target.value)}>
              <option value="">(unmapped)</option>
              {detectedKeys.map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="row compact">
        <button type="button" onClick={onSavePreset}>Save Mapping Preset</button>
        <button type="button" onClick={onLoadPreset}>Load Mapping Preset</button>
        <button type="button" onClick={onNormalize}>Normalize + Generate Chart</button>
      </div>
    </section>
  );
}
