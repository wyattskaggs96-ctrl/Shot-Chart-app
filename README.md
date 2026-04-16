# Shot Chart App (Next.js) — Version 3

Version 3 pivots the product to an **import-first analytics workflow**: users import structured event data, the app normalizes it client-side, auto-generates a shot chart, and sends only uncertain events to a review queue.

## What Version 3 adds

- New top-level workflow mode switch:
  - **Event Import** (default, primary)
  - **Manual / Video Review** (secondary fallback)
- Event import methods:
  - Paste JSON
  - Upload JSON file
  - Paste CSV
- Mapping UI for flexible source schemas:
  - Detects source keys/columns
  - Lets users map fields to normalized schema
  - Supports local mapping preset save/load in `localStorage`
- Normalized event pipeline with internal schema:
  - `id`, `playerName`, `team`, `opponent`, `period`, `gameClock`, `timestampSeconds`, `result`, `shotType`, `rawDescription`, `source`, `x`, `y`, `zone`, `distanceFeet`, `createdAt`
  - plus inference metadata: `inferredZone`, `inferenceConfidence`, `inferenceReason`
- Auto chart generation:
  - Uses provided `x/y` directly
  - Uses zone anchors when only zone is available
  - Uses heuristics to infer zone when both are missing
- Needs Review queue:
  - edit result/zone/x/y/notes
  - confirm event into chart
  - reject event
- Player filtering for single-player shot chart focus
- Extended session model persisted in `localStorage`:
  - session title, selected player, source type, imported raw data, normalized events, review queue, confirmed events, rejected events, notes
- Enhanced exports:
  - normalized events JSON
  - confirmed chart data JSON
  - shot list CSV
  - chart PNG
- Sample import templates:
  - JSON with x/y
  - JSON with zone-only
  - CSV with descriptions + result

## Supported zones

- Rim
- Paint
- Short Mid
- Long Mid
- Left Corner 3
- Right Corner 3
- Above-the-Break 3
- Free Throw
- Unknown

## How mapping works

1. Parse pasted/uploaded JSON or CSV.
2. App detects source keys/columns.
3. Map source keys to normalized fields.
4. Run normalize + generate.
5. Confirm uncertain events from the review queue.

## How zone inference works

If an event has no `x/y` and no usable zone:
- infer from `shotType`, `distanceFeet`, and `rawDescription`
- keyword heuristics include corner-3, layup/dunk/hook/floater, three-point, free throw terms
- inference produces:
  - `inferredZone`
  - `inferenceConfidence`
  - `inferenceReason`
- low-confidence or conflicting events are marked **Needs Review**

## What “Needs Review” means

Events are queued when data quality is insufficient, such as:
- missing make/miss result
- missing player
- unknown or low-confidence zone
- incomplete coordinate pair (`x` without `y`, or vice versa)

## LocalStorage usage

Version 3 stores local session state only in browser `localStorage`.
No auth, no backend DB, no paid APIs.

## Local run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm run start
```

## Vercel deployment notes

- Standard Next.js deployment.
- Import project into Vercel with default build settings.
- No external API credentials or database setup required for V3.

## Court visualization (V3 dark theme)

- SVG-based dark half-court with high-contrast white lines
- Includes hoop, backboard, restricted-area dotted arc, lane, free-throw line, split free-throw circle, three-point arc, and corner lines
- Makes render as green circles, misses render as red X markers
- Marker jitter avoids exact overlap when multiple shots are in the same area
- Hovering markers shows make/miss + zone + shot type tooltip
