'use client';

import { useMemo, useRef, useState } from 'react';
import ChartGenerationPanel from '../components/ChartGenerationPanel';
import DataMappingPanel from '../components/DataMappingPanel';
import ImportPanel from '../components/ImportPanel';
import PlayerFilterPanel from '../components/PlayerFilterPanel';
import ReviewQueuePanel from '../components/ReviewQueuePanel';
import ShotListPanel from '../components/ShotListPanel';
import StatsPanel from '../components/StatsPanel';
import VideoPanel from '../components/VideoPanel';
import { COURT } from '../lib/constants';
import { exportShotsToCsv, exportSvgElementToPng } from '../lib/export';
import { parseCsvText, parseJsonText, detectKeys } from '../lib/eventImportParser';
import { createDefaultMapping, normalizeEvents } from '../lib/normalization';

const STORAGE_KEY_V3 = 'shot-chart-v3-session';
const FRAME_STEP_SECONDS = 1 / 30;

function saveV3Session(data) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(data));
}

function loadV3Session() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY_V3);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function fgStats(shots) {
  const total = shots.length;
  const makes = shots.filter((s) => s.result === 'MAKE').length;
  return { total, makes, misses: total - makes, fg: total ? ((makes / total) * 100).toFixed(1) : '0.0' };
}

export default function Home() {
  const videoRef = useRef(null);
  const chartRef = useRef(null);

  const [topMode, setTopMode] = useState('EVENT_IMPORT');
  const [sessionTitle, setSessionTitle] = useState('V3 Session');
  const [sessionNotes, setSessionNotes] = useState('');

  const [importMethod, setImportMethod] = useState('PASTE_JSON');
  const [importText, setImportText] = useState('');
  const [parseError, setParseError] = useState('');
  const [rawRows, setRawRows] = useState([]);
  const [detectedKeys, setDetectedKeys] = useState([]);
  const [mapping, setMapping] = useState({});

  const [sourceType, setSourceType] = useState('none');
  const [normalizedEvents, setNormalizedEvents] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [confirmedEvents, setConfirmedEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('ALL');

  const [videoUrl, setVideoUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [manualResult, setManualResult] = useState(null);

  const players = useMemo(() => {
    const set = new Set(normalizedEvents.map((evt) => evt.playerName).filter(Boolean));
    return Array.from(set);
  }, [normalizedEvents]);

  const filteredConfirmedEvents = useMemo(() => {
    if (selectedPlayer === 'ALL') return confirmedEvents;
    return confirmedEvents.filter((evt) => evt.playerName === selectedPlayer);
  }, [confirmedEvents, selectedPlayer]);

  const chartShots = useMemo(
    () => filteredConfirmedEvents.map((evt) => ({
      id: evt.id,
      x: evt.x,
      y: evt.y,
      result: evt.result,
      zone: evt.zone,
      timestampSeconds: evt.timestampSeconds ?? 0,
    })),
    [filteredConfirmedEvents],
  );

  const shotListRows = useMemo(
    () => chartShots.map((s) => ({ ...s, makeMiss: s.result })),
    [chartShots],
  );

  const analytics = fgStats(filteredConfirmedEvents);

  function parseInput() {
    try {
      setParseError('');
      const rows = importMethod === 'PASTE_CSV' ? parseCsvText(importText) : parseJsonText(importText);
      setRawRows(rows);
      const keys = detectKeys(rows);
      setDetectedKeys(keys);
      setMapping(createDefaultMapping(keys));
      setSourceType(importMethod);
    } catch (error) {
      setParseError(`Parse failed: ${error.message}`);
    }
  }

  function handleUploadJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImportText(String(reader.result ?? ''));
      setImportMethod('PASTE_JSON');
    };
    reader.readAsText(file);
  }

  function normalizeAndGenerate() {
    const normalized = normalizeEvents(rawRows, mapping, sourceType);
    setNormalizedEvents(normalized);
    setReviewQueue(normalized.filter((evt) => evt.status === 'needs_review'));
    setConfirmedEvents(normalized.filter((evt) => evt.status === 'confirmed'));
    setRejectedEvents([]);
  }

  function updateReviewItem(id, patch) {
    setReviewQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function confirmReviewItem(id) {
    const item = reviewQueue.find((evt) => evt.id === id);
    if (!item) return;

    setReviewQueue((prev) => prev.filter((evt) => evt.id !== id));
    setConfirmedEvents((prev) => [...prev, { ...item, status: 'confirmed' }]);
  }

  function rejectReviewItem(id) {
    const item = reviewQueue.find((evt) => evt.id === id);
    if (!item) return;

    setReviewQueue((prev) => prev.filter((evt) => evt.id !== id));
    setRejectedEvents((prev) => [...prev, { ...item, status: 'rejected' }]);
  }

  function saveSession() {
    saveV3Session({
      sessionTitle,
      selectedPlayer,
      sourceType,
      importText,
      mapping,
      rawRows,
      normalizedEvents,
      reviewQueue,
      confirmedEvents,
      rejectedEvents,
      notes: sessionNotes,
    });
  }

  function loadSession() {
    const saved = loadV3Session();
    if (!saved) return;

    setSessionTitle(saved.sessionTitle ?? 'V3 Session');
    setSelectedPlayer(saved.selectedPlayer ?? 'ALL');
    setSourceType(saved.sourceType ?? 'none');
    setImportText(saved.importText ?? '');
    setMapping(saved.mapping ?? {});
    setRawRows(saved.rawRows ?? []);
    setDetectedKeys(detectKeys(saved.rawRows ?? []));
    setNormalizedEvents(saved.normalizedEvents ?? []);
    setReviewQueue(saved.reviewQueue ?? []);
    setConfirmedEvents(saved.confirmedEvents ?? []);
    setRejectedEvents(saved.rejectedEvents ?? []);
    setSessionNotes(saved.notes ?? '');
  }

  function clearSession() {
    window.localStorage.removeItem(STORAGE_KEY_V3);
    setRawRows([]);
    setDetectedKeys([]);
    setMapping({});
    setNormalizedEvents([]);
    setReviewQueue([]);
    setConfirmedEvents([]);
    setRejectedEvents([]);
    setImportText('');
  }

  function exportNormalizedJson() {
    const blob = new Blob([JSON.stringify(normalizedEvents, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `normalized-events-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportConfirmedJson() {
    const blob = new Blob([JSON.stringify(confirmedEvents, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `confirmed-events-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportChartPng() {
    if (!chartRef.current) return;
    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;
    await exportSvgElementToPng(svg, COURT.width, COURT.height, `shot-chart-v3-${Date.now()}.png`);
  }

  function handleVideoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const next = URL.createObjectURL(file);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(next);
    setCurrentTime(0);
  }

  function stepFrame(direction) {
    if (!videoRef.current) return;
    const next = Math.max(0, videoRef.current.currentTime + direction * FRAME_STEP_SECONDS);
    videoRef.current.currentTime = next;
    setCurrentTime(next);
  }

  function addManualShot(event) {
    if (topMode !== 'MANUAL_VIDEO' || !manualResult) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * COURT.width;
    const y = ((event.clientY - rect.top) / rect.height) * COURT.height;
    const id = `manual-${Date.now()}`;
    setConfirmedEvents((prev) => [
      ...prev,
      {
        id,
        playerName: selectedPlayer === 'ALL' ? 'Manual Entry' : selectedPlayer,
        result: manualResult,
        zone: 'Unknown',
        shotType: 'Manual',
        rawDescription: 'Manual chart click',
        source: 'manual-video',
        x,
        y,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        timestampSeconds: currentTime,
      },
    ]);
    setManualResult(null);
  }

  return (
    <main className="page">
      <header className="header">
        <h1>Shot Chart V3 — Event Import + Auto Chart Generation</h1>
        <p>Import structured events, normalize, auto-generate chart and stats, then review only uncertain items.</p>
      </header>

      <section className="panel">
        <div className="row compact">
          <button type="button" className={topMode === 'EVENT_IMPORT' ? 'active' : ''} onClick={() => setTopMode('EVENT_IMPORT')}>Event Import</button>
          <button type="button" className={topMode === 'MANUAL_VIDEO' ? 'active' : ''} onClick={() => setTopMode('MANUAL_VIDEO')}>Manual / Video Review</button>
          <input value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder="Session title" />
          <button type="button" onClick={saveSession}>Save Session</button>
          <button type="button" onClick={loadSession}>Load Session</button>
          <button type="button" onClick={clearSession}>Clear Session</button>
        </div>
      </section>

      <section className="layout v3">
        <div className="left-col">
          {topMode === 'EVENT_IMPORT' ? (
            <>
              <ImportPanel
                importMethod={importMethod}
                setImportMethod={setImportMethod}
                importText={importText}
                setImportText={setImportText}
                onUploadJson={handleUploadJson}
                onParse={parseInput}
                parseError={parseError}
              />
              <DataMappingPanel
                detectedKeys={detectedKeys}
                mapping={mapping}
                onChange={(field, value) => setMapping((prev) => ({ ...prev, [field]: value }))}
                onSavePreset={() => window.localStorage.setItem('v3-mapping-preset', JSON.stringify(mapping))}
                onLoadPreset={() => {
                  const raw = window.localStorage.getItem('v3-mapping-preset');
                  if (raw) setMapping(JSON.parse(raw));
                }}
                onNormalize={normalizeAndGenerate}
              />
            </>
          ) : (
            <section className="panel">
              <h2>Manual / Video Fallback</h2>
              <VideoPanel
                videoRef={videoRef}
                videoUrl={videoUrl}
                onUpload={handleVideoUpload}
                onStepFrame={stepFrame}
                currentTime={currentTime}
              />
              <div className="row compact">
                <button type="button" className={manualResult === 'MAKE' ? 'active make' : 'make'} onClick={() => setManualResult('MAKE')}>Log Make</button>
                <button type="button" className={manualResult === 'MISS' ? 'active miss' : 'miss'} onClick={() => setManualResult('MISS')}>Log Miss</button>
              </div>
              <p className="hint">Click the chart on the right to place the next manual shot.</p>
            </section>
          )}

          <PlayerFilterPanel players={players} selectedPlayer={selectedPlayer} onChange={setSelectedPlayer} />
          <section className="panel">
            <h2>Session Notes</h2>
            <textarea rows={4} value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} />
            <div className="row compact">
              <button type="button" onClick={exportNormalizedJson} disabled={normalizedEvents.length === 0}>Export Normalized JSON</button>
              <button type="button" onClick={exportConfirmedJson} disabled={confirmedEvents.length === 0}>Export Confirmed JSON</button>
              <button type="button" onClick={() => exportShotsToCsv(filteredConfirmedEvents.map((e) => ({ ...e, makeMiss: e.result })))} disabled={filteredConfirmedEvents.length === 0}>Export Shot CSV</button>
              <button type="button" onClick={exportChartPng} disabled={filteredConfirmedEvents.length === 0}>Export Chart PNG</button>
            </div>
          </section>
        </div>

        <div className="right-col">
          <div ref={chartRef} onClick={addManualShot}>
            <ChartGenerationPanel shots={chartShots} />
          </div>

          <section className="panel">
            <h2>V3 Automation Summary</h2>
            <div className="stats-grid">
              <div><span>Imported</span><strong>{normalizedEvents.length}</strong></div>
              <div><span>Needs Review</span><strong>{reviewQueue.length}</strong></div>
              <div><span>Confirmed</span><strong>{confirmedEvents.length}</strong></div>
              <div><span>Rejected</span><strong>{rejectedEvents.length}</strong></div>
              <div><span>Total Shots</span><strong>{analytics.total}</strong></div>
              <div><span>Makes</span><strong>{analytics.makes}</strong></div>
              <div><span>Misses</span><strong>{analytics.misses}</strong></div>
              <div><span>FG%</span><strong>{analytics.fg}%</strong></div>
            </div>
          </section>

          <StatsPanel shots={filteredConfirmedEvents.map((e) => ({ ...e, makeMiss: e.result }))} />

          <ReviewQueuePanel
            queue={reviewQueue}
            onUpdate={updateReviewItem}
            onConfirm={confirmReviewItem}
            onReject={rejectReviewItem}
          />

          <ShotListPanel
            shots={shotListRows}
            selectedShotId={null}
            onSelect={() => {}}
            onDelete={(id) => setConfirmedEvents((prev) => prev.filter((evt) => evt.id !== id))}
          />
        </div>
      </section>
    </main>
  );
}
