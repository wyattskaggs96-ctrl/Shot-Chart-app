import { formatClock } from '../lib/format';

export default function VideoPanel({
  videoRef,
  videoUrl,
  onUpload,
  onStepFrame,
  currentTime,
}) {
  return (
    <section className="panel">
      <h2>Video Review</h2>
      <label className="file-label">
        Upload Video
        <input type="file" accept="video/*" onChange={onUpload} />
      </label>

      <div className="video-shell">
        {videoUrl ? (
          <video ref={videoRef} src={videoUrl} controls playsInline className="video" />
        ) : (
          <div className="video-placeholder">Upload a local video to begin.</div>
        )}
      </div>

      <div className="row compact">
        <button type="button" onClick={() => onStepFrame(-1)} disabled={!videoUrl}>
          ◀ Step -1 Frame
        </button>
        <button type="button" onClick={() => onStepFrame(1)} disabled={!videoUrl}>
          Step +1 Frame ▶
        </button>
      </div>

      <p className="timestamp">Current Timestamp: <strong>{formatClock(currentTime)}</strong></p>
    </section>
  );
}
