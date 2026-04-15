'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const COURT = {
  width: 500,
  height: 470,
};

const FRAME_STEP_SECONDS = 1 / 30;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function downloadDataUri(dataUri, filename) {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = filename;
  link.click();
}

function CourtSvg({ shots, onCourtClick, pendingResult }) {
  return (
    <svg
      className="court-svg"
      viewBox={`0 0 ${COURT.width} ${COURT.height}`}
      onClick={onCourtClick}
      role="img"
      aria-label="Basketball half-court shot chart"
    >
      <rect x="0" y="0" width={COURT.width} height={COURT.height} fill="#fffdf7" />

      <rect x="30" y="30" width={COURT.width - 60} height={COURT.height - 30} fill="none" stroke="#0f172a" strokeWidth="4" />
      <circle cx={COURT.width / 2} cy="90" r="60" fill="none" stroke="#0f172a" strokeWidth="4" />
      <line x1="30" y1="140" x2={COURT.width - 30} y2="140" stroke="#0f172a" strokeWidth="4" />

      <rect x={COURT.width / 2 - 80} y="30" width="160" height="190" fill="none" stroke="#0f172a" strokeWidth="4" />
      <rect x={COURT.width / 2 - 60} y="30" width="120" height="190" fill="none" stroke="#0f172a" strokeWidth="2" />
      <circle cx={COURT.width / 2} cy="190" r="60" fill="none" stroke="#0f172a" strokeWidth="4" />

      <circle cx={COURT.width / 2} cy="52" r="8" fill="none" stroke="#0f172a" strokeWidth="4" />
      <line x1={COURT.width / 2 - 30} y1="50" x2={COURT.width / 2 + 30} y2="50" stroke="#0f172a" strokeWidth="4" />

      <line x1="30" y1="30" x2="30" y2="300" stroke="#0f172a" strokeWidth="4" />
      <line x1={COURT.width - 30} y1="30" x2={COURT.width - 30} y2="300" stroke="#0f172a" strokeWidth="4" />
      <path
        d={`M 30 300 Q ${COURT.width / 2} ${COURT.height - 20} ${COURT.width - 30} 300`}
        fill="none"
        stroke="#0f172a"
        strokeWidth="4"
      />

      {shots.map((shot, index) => (
        <g key={shot.id}>
          <circle
            cx={shot.x}
            cy={shot.y}
            r="8"
            fill={shot.result === 'MAKE' ? '#22c55e' : '#ef4444'}
            stroke="#0f172a"
            strokeWidth="1"
          />
          <text
            x={shot.x + 10}
            y={shot.y - 10}
            fontSize="12"
            fill="#111827"
            fontWeight="700"
          >
            {index + 1}
          </text>
        </g>
      ))}

      {pendingResult && (
        <text x="16" y={COURT.height - 16} fontSize="14" fontWeight="700" fill="#1d4ed8">
          Click court to place next {pendingResult.toLowerCase()}
        </text>
      )}
    </svg>
  );
}

export default function Home() {
  const videoRef = useRef(null);
  const courtWrapperRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState('');
  const [shots, setShots] = useState([]);
  const [pendingResult, setPendingResult] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const makeCount = useMemo(() => shots.filter((shot) => shot.result === 'MAKE').length, [shots]);
  const missCount = shots.length - makeCount;

  useEffect(
    () => () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    },
    [videoUrl],
  );

  function handleVideoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setVideoUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return nextUrl;
    });
  }

  function nudgeFrame(direction) {
    if (!videoRef.current) {
      return;
    }

    const nextTime = clamp(
      videoRef.current.currentTime + direction * FRAME_STEP_SECONDS,
      0,
      Number.isFinite(videoRef.current.duration) ? videoRef.current.duration : Number.MAX_SAFE_INTEGER,
    );

    videoRef.current.currentTime = nextTime;
  }

  function handleCourtClick(event) {
    if (!pendingResult) {
      return;
    }

    const svgRect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - svgRect.left;
    const clickY = event.clientY - svgRect.top;

    const normalizedX = (clickX / svgRect.width) * COURT.width;
    const normalizedY = (clickY / svgRect.height) * COURT.height;

    setShots((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        x: clamp(normalizedX, 0, COURT.width),
        y: clamp(normalizedY, 0, COURT.height),
        result: pendingResult,
      },
    ]);

    setPendingResult(null);
  }

  function deleteShot(shotId) {
    setShots((prev) => prev.filter((shot) => shot.id !== shotId));
  }

  async function exportChart() {
    if (!courtWrapperRef.current) {
      return;
    }

    const svgElement = courtWrapperRef.current.querySelector('svg');
    if (!svgElement) {
      return;
    }

    try {
      setIsExporting(true);

      const serializer = new XMLSerializer();
      const svgMarkup = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.src = url;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = COURT.width * 2;
      canvas.height = COURT.height * 2;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas rendering context is not available.');
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(url);
      downloadDataUri(canvas.toDataURL('image/png'), `shot-chart-${Date.now()}.png`);
    } finally {
      setIsExporting(false);
    }
  }

  function clearShots() {
    setShots([]);
    setPendingResult(null);
  }

  return (
    <main className="page">
      <header className="header">
        <h1>Basketball Shot Chart Prototype</h1>
        <p>
          Upload a clip, step through frames, choose <strong>Log Make</strong> or{' '}
          <strong>Log Miss</strong>, then click the court once to place that shot.
        </p>
      </header>

      <section className="layout">
        <article className="panel video-panel">
          <h2>Video Review</h2>
          <label className="file-label">
            <span>Upload video</span>
            <input type="file" accept="video/*" onChange={handleVideoUpload} />
          </label>

          <div className="video-shell">
            {videoUrl ? (
              <video ref={videoRef} src={videoUrl} controls playsInline className="video" />
            ) : (
              <div className="video-placeholder">Upload a video to start charting shots.</div>
            )}
          </div>

          <div className="row">
            <button type="button" onClick={() => nudgeFrame(-1)} disabled={!videoUrl}>
              ◀ Prev Frame
            </button>
            <button type="button" onClick={() => nudgeFrame(1)} disabled={!videoUrl}>
              Next Frame ▶
            </button>
          </div>
        </article>

        <article className="panel chart-panel">
          <h2>Half-Court Shot Chart</h2>
          <div className="row">
            <button
              type="button"
              className={pendingResult === 'MAKE' ? 'active make' : 'make'}
              onClick={() => setPendingResult('MAKE')}
            >
              Log Make
            </button>
            <button
              type="button"
              className={pendingResult === 'MISS' ? 'active miss' : 'miss'}
              onClick={() => setPendingResult('MISS')}
            >
              Log Miss
            </button>
          </div>

          <p className="hint">
            {pendingResult
              ? `Ready to place: ${pendingResult}`
              : 'Select Log Make or Log Miss. Your next court click places one shot.'}
          </p>

          <div className="court-wrapper" ref={courtWrapperRef}>
            <CourtSvg shots={shots} onCourtClick={handleCourtClick} pendingResult={pendingResult} />
          </div>

          <div className="stats">
            <span>Makes: {makeCount}</span>
            <span>Misses: {missCount}</span>
            <span>Total: {shots.length}</span>
          </div>

          <div className="row actions">
            <button type="button" onClick={exportChart} disabled={isExporting || shots.length === 0}>
              {isExporting ? 'Exporting…' : 'Export Shot Chart PNG'}
            </button>
            <button type="button" onClick={clearShots} disabled={shots.length === 0}>
              Clear All
            </button>
          </div>

          <div className="shot-list-wrapper">
            <h3>Shot List</h3>
            {shots.length === 0 ? (
              <p className="empty">No shots logged yet.</p>
            ) : (
              <table className="shot-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Result</th>
                    <th>X</th>
                    <th>Y</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shots.map((shot, index) => (
                    <tr key={shot.id}>
                      <td>{index + 1}</td>
                      <td>
                        <span className={shot.result === 'MAKE' ? 'pill make-pill' : 'pill miss-pill'}>
                          {shot.result}
                        </span>
                      </td>
                      <td>{shot.x.toFixed(1)}</td>
                      <td>{shot.y.toFixed(1)}</td>
                      <td>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => deleteShot(shot.id)}
                          aria-label={`Delete shot ${index + 1}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
