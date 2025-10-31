# Platform State Report (PSR) — Core Layer

## 1) Files Covered
- `/core/core.js`
- `/shared/state.js`
- `/core/sync_local.js`
- `/shared/lang.js`
- `/shared/ui.js`

## 2) Purpose & Role
The **Core Layer** provides shared utilities, state/storage helpers, a lightweight inter‑tab sync bus, language switching, and minimal UI affordances. All higher modules (Athlete, Competition, Run/Broadcast) depend on these primitives for URL param handling, localStorage data contracts, cross‑tab messaging, and quick UI feedback.

## 3) Functional Breakdown
- **Core utils**: URL param access/require, unique ID generator, URL builder.
- **State manager**: JSON read/write, array helpers, de‑dupe insert, tick bumping, age computation, and a canonical `keys` map for data contracts.
- **SyncLocal bus**: Emits & listens to `judge_status` packets via `localStorage` `storage` events (cross‑tab sync) with a `_tick` nudge.
- **Language**: Simple dictionary + `[data-key]` DOM replacement; supports EN/BM via runtime dictionary extension.
- **UI**: Minimal `toast()` notification.

## 4) Underlying Logic
- **URL/Navigation**: `requireParams()` guards pages that must be opened with specific query params; `buildUrl()` centralizes param construction.
- **Storage contracts**: All state is localStorage; helpers standardize JSON serialization/parsing and array operations, including `pushUnique()` with caller‑provided uniqueness predicate.
- **Refresh ticks**: `bumpTick(key)` writes a millisecond timestamp to force polling UIs to refresh.
- **Cross‑tab messaging**: `SyncLocal.send('judge_status', payload)` writes the packet to `localStorage` key `judge_status` and nudges listeners via `judge_status_tick`.
- **i18n**: `Lang.set('EN'|'BM')` replaces content of all DOM nodes with `data-key` using the internal dict; `Lang.load()` merges runtime entries.

## 5) Data Contracts Observed (as used/defined in code)
- **Judge channel**: `judge_status`, `judge_status_tick` (cross‑tab signal)
- **Competition & event scaffolding (via keys map)**:
  - `events_<CID>`
  - `athletes_<CID>`
  - `judges_<CID>`
  - `heats_<CID>_<EID>`
  - `reveal`, `leaderboard`, `eventLog`
- **Federation & roster pipeline (via keys map)**:
  - `federations_master`
  - `athletes_staging`
  - `athletes_master`
  - `entries_staging_<CID>`
  - `athletes_aid_cursor_<CID>`
  - `athletes_master_tick` (tick)
  - `athletes_tick_<CID>` (tick)

## 6) Execution Flow (how admins/users hit these primitives)
1. **Page guard**: Module pages call `Core.requireParams([...])`; if missing, redirect to `index.html`.
2. **Data IO**: Module logic uses `State.getJSON/setJSON/arr/push/pushUnique` to manipulate localStorage under canonical `State.keys.*` names.
3. **Judge submissions**: Judge UIs call `SyncLocal.send('judge_status', pkt)`; Run Console tabs subscribe via `SyncLocal.on()`.
4. **UI refresh**: Admin actions that change athlete rosters or entries call `State.bumpTick('athletes_master_tick' | 'athletes_tick_<CID>')` to poke listening views.
5. **Language**: Pages with `[data-key]` call `Lang.set('EN'|'BM')` and optionally `Lang.load()` to inject module dictionaries.

## 7) Status
- **Core utils**: ✅ Working; minimal, clear.
- **State manager**: ✅ Working; includes safety helpers & ticks.
- **SyncLocal bus**: ✅ Working; scoped to `judge_status` only.
- **Language**: ✅ Working; dictionary empty by default (expects runtime load).
- **UI toast**: ✅ Working.

## 8) Gaps / Risks
- **Single‑topic Sync bus**: Only supports `judge_status`. If more channels (e.g., `display_control_live1/2`) need cross‑tab sync, either extend or generalize the topic system.
- **Key naming divergence**: Tick key appears as `athletes_master_tick` in code; ensure all modules reference this exact key (watch for variants like `tickAthletesMaster`).
- **No error UI**: Storage/write errors only `console.warn`; consider user‑visible fallbacks in mission‑critical pages.
- **i18n dicts external**: Language dict is empty by default; ensure pages load their dictionaries before `Lang.set()`.

## 9) QA Checklist (Core Layer)
- Navigate to a page requiring params without query → expect redirect to `index.html`.
- Use State helpers to write/read a sample object under `athletes_master`; verify JSON stored and retrieved as object.
- Call `SyncLocal.send('judge_status', {cid:'C1', eid:'E1'})` in one tab; confirm a second tab receives the packet via `SyncLocal.on()`.
- Trigger `State.bumpTick('athletes_master_tick')`; confirm listeners react.
- Call `Lang.load('EN', { hello:'Hello' }); Lang.set('EN')` on an element with `data-key="hello"`; expect text replacement.
- Trigger `UI.toast('Saved')`; confirm toast appears and auto‑dismisses.

