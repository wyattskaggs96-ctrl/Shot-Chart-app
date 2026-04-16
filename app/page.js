'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import CourtPanel from '../components/CourtPanel';
import SessionPanel from '../components/SessionPanel';
import ShotEditorPanel from '../components/ShotEditorPanel';
import ShotListPanel from '../components/ShotListPanel';
import StatsPanel from '../components/StatsPanel';
import VideoPanel from '../components/VideoPanel';
import { COURT, DEFAULT_SESSION, LOGGING_MODES } from '../lib/constants';
import { exportSvgElementToPng } from '../lib/export';
import { clamp } from '../lib/format';
import { clearSessionFromStorage, loadSessionFromStorage, saveSessionToStorage } from '../lib/storage';

const FRAME_STEP_SECONDS = 1 / 30;

export default function Home() {
  const videoRef = useRef(null);
  const chartRef = useRef(null);

  const [session, setSession] = useState(DEFAULT_SESSION);
  const [videoUrl, setVideoUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [mode, setMode] = useState(LOGGING_MODES.QUICK);
  const [pendingResult, setPendingResult] = useState(null);
  const [shots, setShots] = useState([]);
  const [selectedShotId, setSelectedShotId] = useState(null);
  const [isExportingPng, setIsExportingPng] = useState(false);

  const selectedShot = useMemo(
    () => shots.find((shot) => shot.id === selectedShotId) ?? null,
    [shots, selectedShotId],
  );

  useEffect(() => {
    const saved = loadSessionFromStorage();
    if (saved?.session || saved?.shots) {
      setSession(saved.session ?? DEFAULT_SESSION);
      setShots(saved.shots ?? []);
      setMode(saved.mode ?? LOGGING_MODES.QUICK);
    }
  }, []);

  useEffect(
    () => () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    },
    [videoUrl],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const update = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', update);
    video.addEventListener('seeked', update);

    return () => {
      video.removeEventListener('timeupdate', update);
      video.removeEventListener('seeked', update);
    };
  }, [videoUrl]);

  function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextUrl = URL.createObjectURL(file);
    setVideoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextUrl;
    });
    setCurrentTime(0);
  }

  function stepFrame(direction) {
    if (!videoRef.current) return;
    const nextTime = clamp(
      videoRef.current.currentTime + direction * FRAME_STEP_SECONDS,
      0,
      Number.isFinite(videoRef.current.duration) ? videoRef.current.duration : Number.MAX_SAFE_INTEGER,
    );
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  function addShot(baseShot) {
    const now = new Date().toISOString();
    const shot = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      x: baseShot.x,
      y: baseShot.y,
      makeMiss: baseShot.makeMiss,
      zone: baseShot.zone,
      timestampSeconds: currentTime,
      shotType: '',
      notes: '',
      createdAt: now,
    };

    setShots((prev) => [...prev, shot]);
    setSelectedShotId(shot.id);
  }

  function updateShot(shotId, patch) {
    setShots((prev) => prev.map((shot) => (shot.id === shotId ? { ...shot, ...patch } : shot)));
  }

  function deleteShot(shotId) {
    setShots((prev) => prev.filter((shot) => shot.id !== shotId));
    setSelectedShotId((prev) => (prev === shotId ? null : prev));
  }

  function clearAllSessionState() {
    setSession(DEFAULT_SESSION);
    setShots([]);
    setSelectedShotId(null);
    setPendingResult(null);
    setMode(LOGGING_MODES.QUICK);
  }

  function saveSession() {
    saveSessionToStorage({
      session,
      shots,
      mode,
      updatedAt: new Date().toISOString(),
    });
  }

  function loadSession() {
    const saved = loadSessionFromStorage();
    if (!saved) return;

    setSession(saved.session ?? DEFAULT_SESSION);
    setShots(saved.shots ?? []);
    setMode(saved.mode ?? LOGGING_MODES.QUICK);
    setSelectedShotId(null);
  }

  function clearSession() {
    clearSessionFromStorage();
    clearAllSessionState();
  }

  async function exportPng() {
    if (!chartRef.current) return;

    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;

    try {
      setIsExportingPng(true);
      await exportSvgElementToPng(svg, COURT.width, COURT.height, `shot-chart-${Date.now()}.png`);
    } finally {
      setIsExportingPng(false);
    }
  }

  return (
    <main className="page">
      <header className="header">
        <h1>Shot Chart V2</h1>
        <p>
          Faster shot logging with Quick Mode zone snapping, detailed shot editing, analytics, and local
          session save/load.
        </p>
      </header>

      <section className="layout">
        <div className="left-col">
          <SessionPanel
            session={session}
            onChange={(field, value) => setSession((prev) => ({ ...prev, [field]: value }))}
            onSave={saveSession}
            onLoad={loadSession}
            onClear={clearSession}
          />

          <VideoPanel
            videoRef={videoRef}
            videoUrl={videoUrl}
            onUpload={handleUpload}
            onStepFrame={stepFrame}
            currentTime={currentTime}
          />

          <div className="panel">
            <div className="row compact">
              <button type="button" onClick={exportPng} disabled={shots.length === 0 || isExportingPng}>
                {isExportingPng ? 'Exporting PNG…' : 'Export Shot Chart PNG'}
              </button>
              <button type="button" onClick={clearAllSessionState} disabled={shots.length === 0 && !selectedShotId}>
                Clear All Shots
              </button>
            </div>
          </div>
        </div>

        <div className="right-col">
          <div ref={chartRef}>
            <CourtPanel
              mode={mode}
              setMode={setMode}
              pendingResult={pendingResult}
              setPendingResult={setPendingResult}
              shots={shots}
              selectedShotId={selectedShotId}
              onSelectShotId={setSelectedShotId}
              onAddShot={addShot}
              onUpdateShot={updateShot}
            />
          </div>

          <StatsPanel shots={shots} />
          <ShotEditorPanel
            shot={selectedShot}
            onChange={(patch) => selectedShot && updateShot(selectedShot.id, patch)}
            onDelete={deleteShot}
          />
          <ShotListPanel
            shots={shots}
            selectedShotId={selectedShotId}
            onSelect={setSelectedShotId}
            onDelete={deleteShot}
          />
        </div>
      </section>
    </main>
  );
}
