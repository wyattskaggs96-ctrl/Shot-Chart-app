export function formatClock(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00.00';
  }

  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  const hundredths = Math.floor((seconds % 1) * 100)
    .toString()
    .padStart(2, '0');

  return `${mins}:${secs}.${hundredths}`;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
