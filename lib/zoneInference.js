import { ZONES } from './constants';

const SUPPORTED_ZONES = [...ZONES, 'Free Throw', 'Unknown'];

const ZONE_ANCHORS = {
  Rim: { x: 250, y: 75 },
  Paint: { x: 250, y: 155 },
  'Short Mid': { x: 250, y: 245 },
  'Long Mid': { x: 250, y: 320 },
  'Left Corner 3': { x: 50, y: 250 },
  'Right Corner 3': { x: 450, y: 250 },
  'Above-the-Break 3': { x: 250, y: 390 },
  'Free Throw': { x: 250, y: 140 },
  Unknown: { x: 250, y: 430 },
};

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

export function inferZone({ shotType = '', rawDescription = '', distanceFeet = null }) {
  const text = `${shotType} ${rawDescription}`.toLowerCase();
  const distance = Number(distanceFeet);

  if (includesAny(text, ['free throw'])) {
    return { inferredZone: 'Free Throw', inferenceConfidence: 0.98, inferenceReason: 'free throw keyword' };
  }

  if (includesAny(text, ['left corner', 'left-corner', 'l corner']) || (includesAny(text, ['corner', '3']) && includesAny(text, ['left']))) {
    return { inferredZone: 'Left Corner 3', inferenceConfidence: 0.93, inferenceReason: 'left corner 3 keyword' };
  }

  if (includesAny(text, ['right corner', 'right-corner', 'r corner']) || (includesAny(text, ['corner', '3']) && includesAny(text, ['right']))) {
    return { inferredZone: 'Right Corner 3', inferenceConfidence: 0.93, inferenceReason: 'right corner 3 keyword' };
  }

  if (includesAny(text, ['three', '3pt', '3-pt', '3pt', 'pull-up 3', 'step back 3']) || (!Number.isNaN(distance) && distance >= 23)) {
    return { inferredZone: 'Above-the-Break 3', inferenceConfidence: 0.86, inferenceReason: 'three-point signal' };
  }

  if (includesAny(text, ['layup', 'dunk', 'alley-oop', 'tip in', 'putback'])) {
    return { inferredZone: 'Rim', inferenceConfidence: 0.9, inferenceReason: 'rim-finish keyword' };
  }

  if (includesAny(text, ['hook', 'floater']) || (!Number.isNaN(distance) && distance <= 8)) {
    return { inferredZone: 'Paint', inferenceConfidence: 0.78, inferenceReason: 'paint-range indicator' };
  }

  if (!Number.isNaN(distance)) {
    if (distance <= 14) {
      return { inferredZone: 'Short Mid', inferenceConfidence: 0.75, inferenceReason: 'mid-range distance <= 14ft' };
    }
    if (distance <= 22) {
      return { inferredZone: 'Long Mid', inferenceConfidence: 0.72, inferenceReason: 'mid-range distance <= 22ft' };
    }
  }

  return { inferredZone: 'Unknown', inferenceConfidence: 0.35, inferenceReason: 'insufficient signals' };
}

export function getZoneAnchor(zone) {
  return ZONE_ANCHORS[zone] ?? ZONE_ANCHORS.Unknown;
}

export function isSupportedZone(zone) {
  return SUPPORTED_ZONES.includes(zone);
}

export function getSupportedZones() {
  return SUPPORTED_ZONES;
}
