# 🗺️ ARCHITECTURE MAP

## Layers
- **New Skeleton:** `/modules/athlete`, `/modules/federation`, `/modules/competition`, `/modules/master`
- **Legacy (working):** `/pages` (setup/run), root displays: `display_centre.html`, `scoreboard.html`, `leaderboard.html`, `intro.html`

## Core Runtime
- `shared/core.js` (routing, utils)
- `shared/state.js` (in-memory state, storage helpers)
- `shared/ui.js` (UI helpers)
- `shared/lang.js` (i18n)
- `sync_local.js` (tab-to-tab sync)
- `bus.js` (event bus)
- `rules.js` (scoring math)
- `competitions_repo.js` (persist competitions)

## Data Flow (high-level)
Athlete registers → `athletes_pending`
→ Federation approves → `athletes_master`
→ Athlete joins comp → `competition_entries_{cid}`
→ Federation approves entry → `athletes_{cid}`
→ Organizer assigns heats → `heats_{cid}_{eid}`
→ Judges score → `scores_{cid}_{eid}_{heat}`
→ Displays render (leaderboard/scoreboard)
