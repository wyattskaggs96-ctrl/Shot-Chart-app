const SAMPLE_JSON_XY = JSON.stringify([
  { id: '1', player: 'A. Guard', result: 'make', shot_type: 'pull-up 3', x: 365, y: 350, period: 1, game_clock: '08:11' },
  { id: '2', player: 'A. Guard', result: 'miss', shot_type: 'layup', x: 248, y: 92, period: 1, game_clock: '07:42' },
], null, 2);

const SAMPLE_JSON_ZONE = JSON.stringify([
  { id: '101', playerName: 'A. Guard', outcome: 'made', shotType: 'corner 3 left', zone: 'Left Corner 3', period: 2 },
  { id: '102', playerName: 'A. Guard', outcome: 'missed', shotType: 'floater', zone: 'Paint', period: 2 },
], null, 2);

const SAMPLE_CSV = `player,result,shotType,distanceFeet,rawDescription,period,gameClock\nA. Guard,make,pull-up 3,25,step back three from top,3,05:20\nA. Guard,miss,layup,2,driving layup in traffic,3,04:57`;

export default function ImportPanel({
  importMethod,
  setImportMethod,
  importText,
  setImportText,
  onUploadJson,
  onParse,
  parseError,
}) {
  return (
    <section className="panel">
      <h2>Event Import (Primary)</h2>

      <div className="row compact">
        {['PASTE_JSON', 'UPLOAD_JSON', 'PASTE_CSV'].map((method) => (
          <button
            key={method}
            type="button"
            className={importMethod === method ? 'active' : ''}
            onClick={() => setImportMethod(method)}
          >
            {method === 'PASTE_JSON' ? 'Paste JSON' : method === 'UPLOAD_JSON' ? 'Upload JSON File' : 'Paste CSV'}
          </button>
        ))}
      </div>

      {importMethod === 'UPLOAD_JSON' ? (
        <label className="stacked">
          Select JSON file
          <input type="file" accept=".json,application/json" onChange={onUploadJson} />
        </label>
      ) : (
        <label className="stacked">
          {importMethod === 'PASTE_JSON' ? 'JSON input' : 'CSV input'}
          <textarea
            rows={10}
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder={importMethod === 'PASTE_JSON' ? '[{...}]' : 'col1,col2,...'}
          />
        </label>
      )}

      <div className="row compact">
        <button type="button" onClick={onParse}>Parse Input</button>
        <button type="button" onClick={() => setImportText(SAMPLE_JSON_XY)}>Load JSON (x/y) Template</button>
        <button type="button" onClick={() => setImportText(SAMPLE_JSON_ZONE)}>Load JSON (zone) Template</button>
        <button type="button" onClick={() => setImportText(SAMPLE_CSV)}>Load CSV Template</button>
      </div>

      {parseError && <p className="error-text">{parseError}</p>}
    </section>
  );
}
