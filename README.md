# Shot Chart App (Next.js) — Version 2

Version 2 upgrades the original prototype into a faster workflow for real video review sessions while staying fully local and simple to deploy.

## What Version 2 adds

- **Quick Mode** and **Precision Mode** logging
  - **Quick Mode:** click roughly, app snaps shot to nearest logical zone anchor
  - **Precision Mode:** exact point placement with drag-to-reposition editing
- **Court zones** with per-shot zone assignment:
  - Rim
  - Paint
  - Short Mid
  - Long Mid
  - Left Corner 3
  - Right Corner 3
  - Above-the-Break 3
- **Expanded shot model** for each shot:
  - `id`, `x`, `y`, `makeMiss`, `zone`, `timestampSeconds`, `shotType`, `notes`, `createdAt`
- **Video review upgrades**
  - frame stepping
  - current timestamp display
  - auto-attach timestamp when logging a shot
- **Shot editing workflow**
  - select marker or shot row
  - edit make/miss, zone, shot type, notes
  - delete shot
  - drag marker in Precision Mode
- **Session panel + localStorage persistence**
  - player name, opponent, game date, session notes
  - save session
  - load session
  - clear session
- **Analytics panel**
  - total, makes, misses, FG%
  - attempts/makes/FG% by zone
- **Export options**
  - export chart as PNG
  - export shot list as CSV

## Constraints honored

- Next.js app-router architecture
- Deployable on Vercel
- No auth
- No database
- localStorage persistence only
- Minimal dependencies

## Local run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build / production

```bash
npm run build
npm run start
```

## Vercel deployment notes

This project is a standard Next.js app and can be deployed directly on Vercel:

1. Push repo to GitHub/GitLab/Bitbucket.
2. Import project in Vercel.
3. Use default Next.js build settings.
4. Deploy.

No server-side database config is required for V2.

## Quick Mode vs Precision Mode

- **Quick Mode:**
  - Designed to reduce manual effort.
  - Your click is interpreted, classified to a zone, then snapped to a nearest zone anchor point for consistency.
  - Great for fast charting during review.

- **Precision Mode:**
  - Stores exact click coordinates.
  - Lets you drag markers for fine correction.
  - Better for detailed/manual chart accuracy.

## Save / Load behavior

- `Save Session` writes session metadata, shot list, and logging mode into browser `localStorage`.
- `Load Session` restores that saved snapshot.
- `Clear Session` wipes localStorage and resets current in-memory state.

All data remains on the user’s device in the browser.
