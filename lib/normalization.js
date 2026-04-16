import { getZoneAnchor, inferZone, isSupportedZone } from './zoneInference';

function normalizeResult(value) {
  if (value === undefined || value === null || value === '') return null;
  const text = String(value).toLowerCase();
  if (['make', 'made', 'm', '1', 'true', 'yes', 'good'].includes(text)) return 'MAKE';
  if (['miss', 'missed', 'x', '0', 'false', 'no'].includes(text)) return 'MISS';
  return null;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function createDefaultMapping(keys) {
  const lower = keys.reduce((acc, key) => {
    acc[key.toLowerCase()] = key;
    return acc;
  }, {});

  const guess = (options) => options.map((o) => lower[o]).find(Boolean) ?? '';

  return {
    playerName: guess(['player', 'playername', 'player_name', 'shooter']),
    result: guess(['result', 'make_miss', 'outcome', 'made']),
    shotType: guess(['shottype', 'shot_type', 'actiontype', 'action']),
    x: guess(['x', 'locx', 'coordx']),
    y: guess(['y', 'locy', 'coordy']),
    zone: guess(['zone', 'shotzone']),
    period: guess(['period', 'quarter']),
    gameClock: guess(['gameclock', 'clock']),
    distanceFeet: guess(['distancefeet', 'distance', 'shotdistance']),
    rawDescription: guess(['rawdescription', 'description', 'playdescription', 'event']),
    team: guess(['team']),
    opponent: guess(['opponent']),
    timestampSeconds: guess(['timestampseconds', 'timestamp', 'time_seconds']),
  };
}

export function normalizeEvents(rows, mapping, source) {
  const now = new Date().toISOString();

  return rows.map((row, index) => {
    const shotType = mapping.shotType ? row[mapping.shotType] : '';
    const rawDescription = mapping.rawDescription ? row[mapping.rawDescription] : '';
    const result = normalizeResult(mapping.result ? row[mapping.result] : null);
    const distanceFeet = toNumber(mapping.distanceFeet ? row[mapping.distanceFeet] : null);

    const rawZone = mapping.zone ? row[mapping.zone] : '';
    const explicitZone = isSupportedZone(rawZone) ? rawZone : null;

    const x = toNumber(mapping.x ? row[mapping.x] : null);
    const y = toNumber(mapping.y ? row[mapping.y] : null);

    const inferred = inferZone({ shotType, rawDescription, distanceFeet });
    const finalZone = explicitZone || inferred.inferredZone;
    const anchor = getZoneAnchor(finalZone);

    const needsReview =
      !result
      || !((mapping.playerName && row[mapping.playerName]) || row.playerName)
      || finalZone === 'Unknown'
      || inferred.inferenceConfidence < 0.55
      || (x !== null && y === null)
      || (x === null && y !== null);

    return {
      id: row.id ?? `evt-${Date.now()}-${index}`,
      playerName: mapping.playerName ? row[mapping.playerName] ?? '' : row.playerName ?? '',
      team: mapping.team ? row[mapping.team] ?? '' : row.team ?? '',
      opponent: mapping.opponent ? row[mapping.opponent] ?? '' : row.opponent ?? '',
      period: mapping.period ? row[mapping.period] ?? '' : row.period ?? '',
      gameClock: mapping.gameClock ? row[mapping.gameClock] ?? '' : row.gameClock ?? '',
      timestampSeconds: toNumber(mapping.timestampSeconds ? row[mapping.timestampSeconds] : row.timestampSeconds),
      result,
      shotType: shotType ?? '',
      rawDescription: rawDescription ?? '',
      source,
      x: x ?? anchor.x,
      y: y ?? anchor.y,
      zone: finalZone,
      distanceFeet,
      inferredZone: inferred.inferredZone,
      inferenceConfidence: inferred.inferenceConfidence,
      inferenceReason: inferred.inferenceReason,
      createdAt: now,
      status: needsReview ? 'needs_review' : 'confirmed',
      notes: '',
      autoMapped: true,
      inferred: !explicitZone,
    };
  });
}
