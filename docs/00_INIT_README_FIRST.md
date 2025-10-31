# 🚦 READ ME FIRST (ZED XGAMES INIT)
**Purpose:** Any new thread MUST read this before doing anything. No assumptions. Follow the rules below.

## 0) Scope of Work
We are building a modular competition platform with **two layers**:
- **New Skeleton (modules/...)**: athlete, federation, competition, master hub.
- **Existing Legacy (pages/ + root displays)**: working run console, heat select, display centre, scoreboard, leaderboard, intro.

## 1) Golden Rules
- ✅ Use **existing working pages** when practical (Run + Displays) while we build new skeleton UI.
- ✅ Do NOT change global helpers unless instructed: `shared/core.js`, `shared/state.js`, `shared/ui.js`, `shared/lang.js`.
- ✅ Confirm **storage keys** and **data contracts** in docs before coding.
- ✅ All navigation must follow **02_WIRING_PLAN.md**.
- ✅ If a file or key isn’t listed in docs, **ask / pause** (no guessing).

## 2) Tech Stack (current session)
- HTML + vanilla JS only (no frameworks).
- CSS: `styles.css`.
- JS: reuse from `/shared/` and specific page scripts where they already exist.
- State & sync: `localStorage` + `SyncLocal` (storage events) per existing code.

## 3) Page Sets (do not confuse)
- **New Skeleton**: `/modules/athlete/*.html`, `/modules/federation/*.html`, `/modules/competition/*.html`, `/modules/master/*.html`
- **Legacy**: `/pages/*.html`, plus root-level `display_centre.html`, `scoreboard.html`, `leaderboard.html`, `intro.html`

## 4) Current Truth Files
- Data contracts: `docs/03_DATA_CONTRACTS.md` (+ `data_contracts_v1.json`)
- Storage keys: `docs/04_STORAGE_KEYS.md`
- Reuse vs Rebuild decisions: `docs/05_REUSE_MATRIX.md`

## 5) What counts as DONE (per task)
- Links navigable end-to-end.
- Right storage keys used.
- No console errors.
- Does not break legacy behavior.

## 6) Start Here Every Thread
1) Read this file.
2) Open `docs/00_MASTER_INDEX.md`.
3) Follow `docs/90_RUNBOOK.md` for the day’s scope.

