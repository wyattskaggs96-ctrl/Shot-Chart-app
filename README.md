# Shot Chart App (Next.js)

A polished v1 prototype for building a basketball shot chart from uploaded video.

## Features

- Two-column workflow UI
  - Left: video upload + player + frame controls
  - Right: interactive half-court shot chart
- `Log Make` / `Log Miss` actions
  - Choose a result, then the **next click** on court places one shot
- Local shot state only (no auth, no database)
- Shot rendering
  - Makes: green dots
  - Misses: red dots
- Shot list table with:
  - shot number
  - result
  - x/y coordinates
  - per-shot delete button
- Clear all shots button
- Export shot chart to PNG
- Minimal Node backend endpoint via Next route handler (`/api/health`)

## Tech Stack

- Frontend: Next.js + React
- Backend: Node.js runtime via Next.js route handlers

## Run locally

```bash
npm install
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Production

```bash
npm run build
npm run start
```
