import { memo, useMemo } from 'react';
import MakeMarker from './MakeMarker';
import MissMarker from './MissMarker';

function hash(value) {
  let h = 0;
  const s = String(value ?? '');
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function MarkerLayer({ shots }) {
  const jitteredShots = useMemo(() => {
    const slots = new Map();

    return shots.map((shot) => {
      const key = `${Math.round(shot.x / 8)}-${Math.round(shot.y / 8)}`;
      const idx = slots.get(key) ?? 0;
      slots.set(key, idx + 1);

      const seed = hash(`${shot.id}-${idx}`);
      const angle = (seed % 360) * (Math.PI / 180);
      const radius = 1.5 + (seed % 4);

      return {
        ...shot,
        drawX: shot.x + Math.cos(angle) * radius,
        drawY: shot.y + Math.sin(angle) * radius,
      };
    });
  }, [shots]);

  return (
    <g>
      {jitteredShots.map((shot) => {
        const label = `${shot.result} • ${shot.zone ?? 'Unknown'}${shot.shotType ? ` • ${shot.shotType}` : ''}`;
        return shot.result === 'MAKE'
          ? <MakeMarker key={shot.id} x={shot.drawX} y={shot.drawY} label={label} />
          : <MissMarker key={shot.id} x={shot.drawX} y={shot.drawY} label={label} />;
      })}
    </g>
  );
}

export default memo(MarkerLayer);
