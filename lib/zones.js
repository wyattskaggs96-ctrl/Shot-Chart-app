import { COURT, ZONES } from './constants';
import { clamp } from './format';

const ZONE_ANCHORS = {
  Rim: [{ x: 250, y: 75 }],
  Paint: [
    { x: 210, y: 155 },
    { x: 250, y: 155 },
    { x: 290, y: 155 },
  ],
  'Short Mid': [
    { x: 150, y: 210 },
    { x: 350, y: 210 },
    { x: 250, y: 250 },
  ],
  'Long Mid': [
    { x: 120, y: 280 },
    { x: 380, y: 280 },
    { x: 250, y: 320 },
  ],
  'Left Corner 3': [{ x: 50, y: 250 }],
  'Right Corner 3': [{ x: 450, y: 250 }],
  'Above-the-Break 3': [
    { x: 130, y: 360 },
    { x: 250, y: 390 },
    { x: 370, y: 360 },
  ],
};

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function classifyZone(x, y) {
  const dx = x - COURT.hoopX;
  const dy = y - COURT.hoopY;
  const r = Math.hypot(dx, dy);

  if (x <= 65 && y <= 300) {
    return 'Left Corner 3';
  }
  if (x >= COURT.width - 65 && y <= 300) {
    return 'Right Corner 3';
  }

  if (r <= 40) {
    return 'Rim';
  }

  if (x >= 170 && x <= 330 && y >= 30 && y <= 220) {
    return 'Paint';
  }

  if (r <= 180) {
    return 'Short Mid';
  }

  if (r <= 238) {
    return 'Long Mid';
  }

  return 'Above-the-Break 3';
}

export function snapShotToZone(rawX, rawY) {
  const zone = classifyZone(rawX, rawY);
  const anchors = ZONE_ANCHORS[zone] ?? [{ x: rawX, y: rawY }];

  const nearest = anchors.reduce((best, anchor) => {
    if (!best || distance({ x: rawX, y: rawY }, anchor) < distance({ x: rawX, y: rawY }, best)) {
      return anchor;
    }
    return best;
  }, null);

  return {
    zone,
    x: clamp(nearest.x, 0, COURT.width),
    y: clamp(nearest.y, 0, COURT.height),
  };
}

export function getZoneOverlay() {
  return ZONES.map((zone) => {
    const anchor = ZONE_ANCHORS[zone][0];
    return { zone, ...anchor };
  });
}
