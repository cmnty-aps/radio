## Radio Indonesia Streaming Website

Build a single-page radio streaming site that fetches stations from `https://api.cmnty.web.id/search/radio?country=indonesia` and lets users play them in the browser.

### Pages
- `/` — Radio station listing + persistent player

### Features
- Fetch station list via a TanStack server function (avoids CORS, cached with TanStack Query)
- Grid of station cards: image, name, genre, rating (stars + count)
- Search bar to filter by name/genre
- Sticky bottom player bar showing current station:
  - Play/Pause, Stop, Volume slider
  - Supports MP3 streams via `<audio>` and HLS streams via `hls.js`
  - Stream type selector when a station has multiple streams (e.g. CLASSY SD/HD/UHD)
- Loading skeletons + error state with retry

### Design
- Modern dark theme with warm accent (radio/broadcast vibe)
- Custom design tokens in `src/styles.css` (no hardcoded colors)
- Card grid, responsive (1 col mobile → 4 col desktop)

### Technical
- `src/lib/radio.functions.ts` — `getRadioStations` server function proxying the API
- `src/routes/index.tsx` — loader primes query, component uses `useSuspenseQuery`
- `src/components/StationCard.tsx`, `src/components/PlayerBar.tsx`, `src/components/SearchBar.tsx`
- `src/hooks/usePlayer.ts` — Zustand-free simple context/store for current station + audio ref
- Add `hls.js` dependency
- Update `__root.tsx` head metadata: title "Radio Indonesia — Live Streaming", proper description/og tags
