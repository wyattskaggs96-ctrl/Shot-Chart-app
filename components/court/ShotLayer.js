import { memo, useMemo } from 'react';
import MakeMarker from './MakeMarker';
import MissMarker from './MissMarker';

function hashId(input) {
  let hash = 0;
  const str = String(input ?? '');
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function computeJitter(index, id) {
  const seed = hashId(`${id}-${index}`);
  const angle = (seed % 360) * (Math.PI / 180);
  const radius = 2 + (seed % 5);
  return {
    dx: Math.cos(angle) * radius,
    dy: Math.sin(angle) * radius,
  };
}

function ShotLayer({ shots }) {
  const withOffsets = useMemo(() => {
    const bucketCounts = new Map();

    return shots.map((shot) => {
      const key = `${Math.round(shot.x / 6)}-${Math.round(shot.y / 6)}`;
      const count = bucketCounts.get(key) ?? 0;
      bucketCounts.set(key, count + 1);
      const jitter = computeJitter(count, shot.id);
      return {
        ...shot,
        jitterX: shot.x + jitter.dx,
        jitterY: shot.y + jitter.dy,
      };
    });
  }, [shots]);

  return (
    <g>
      {withOffsets.map((shot) => {
        const label = `${shot.result} • ${shot.zone ?? 'Unknown'}${shot.shotType ? ` • ${shot.shotType}` : ''}`;

        if (shot.result === 'MAKE') {
          return <MakeMarker key={shot.id} x={shot.jitterX} y={shot.jitterY} label={label} />;
        }

        return <MissMarker key={shot.id} x={shot.jitterX} y={shot.jitterY} label={label} />;
      })}
    </g>
  );
}

export default memo(ShotLayer);
