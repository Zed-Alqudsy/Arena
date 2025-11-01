# Phase D Preflight Audit — Findings

## Scope
Execution pages (`pages/event_admin.html`, `pages/heat_select.html`, `pages/run_console.html`) and supporting modules (`modules/competition/*.html`, `/shared/*.js`, `/core/*.js`). Audit cross-referenced against Phase D Ladder (D1–D20) and preflight checklist.

## Execution Layer Highlights
- **Heat Select (`pages/heat_select.html`)** – Loads heat list via `State.arr(State.keys.heats(cid,eid))` and renders name-only cards without status or preset metadata, leaving Ladder D1 partially met. [pages/heat_select.html:L20-L35](../../pages/heat_select.html#L20-L35)
- **Run Console (`pages/run_console.html`)** – Provides UI shell, manual scoring capture, reveal pipeline, and leaderboard publishing stub. Missing run iteration controls, advancement tagging, and preset-driven rule hydration. [pages/run_console.html:L200-L860](../../pages/run_console.html#L200-L860)
- **Event Admin (`pages/event_admin.html`)** – Summarises preset snapshot and seeds judges panel defaults but does not push roles into heat objects or seed athlete slots, leaving D7–D8 unmet. [pages/event_admin.html:L179-L300](../../pages/event_admin.html#L179-L300)

## Supporting Module Notes
- **Setup Wizard (`modules/competition/setup_new.html`)** – Persists preset snapshot onto event model but relies on manual intervention; no downstream enforcement detected. [modules/competition/setup_new.html:L942-L1055](../../modules/competition/setup_new.html#L942-L1055)
- **Preset Mapper (`modules/competition/preset_mapper.html`)** – Provides UI to store `preset_snapshot_<cid>` but no validation of completeness beyond raw snapshot save. [modules/competition/preset_mapper.html:L31-L65](../../modules/competition/preset_mapper.html#L31-L65)
- **Control/Display/Leaderboard Skeletons** – Presentational placeholders without new Phase D logic. [modules/competition/control.html:L18-L33](../../modules/competition/control.html#L18-L33)
- **Shared State Utilities (`shared/state.js`)** – Contains helper methods and storage keys but no new enforcement for heats/judges integrity beyond raw getters. [shared/state.js:L1-L52](../../shared/state.js#L1-L52)
- **Sync Bus (`core/sync_local.js`)** – Handles judge status storage events yet unused by current run console flow. [core/sync_local.js:L1-L32](../../core/sync_local.js#L1-L32)

## Preflight Checklist (1–8)
| # | Checkpoint | Status | Evidence |
|---|------------|:------:|----------|
| 1 | `preset_snapshot_<cid>` read across execution pages | ⚠️ | Event Admin + Run Console read snapshots; Heat Select lacks preset awareness. [pages/event_admin.html:L179-L205](../../pages/event_admin.html#L179-L205), [pages/run_console.html:L420-L452](../../pages/run_console.html#L420-L452) |
| 2 | Judges roles copied into heats | ❌ | Judges seeding updates `judges_<cid>` only; heat entries retain empty `judgesPanel`. [pages/event_admin.html:L217-L233](../../pages/event_admin.html#L217-L233), [pages/event_admin.html:L284-L292](../../pages/event_admin.html#L284-L292) |
| 3 | Heat `slots[]` seeded with athlete IDs | ❌ | Heats created with `slots: []`; Run Console merely reuses if present. [pages/event_admin.html:L284-L292](../../pages/event_admin.html#L284-L292), [pages/run_console.html:L452-L520](../../pages/run_console.html#L452-L520) |
| 4 | `scores_<cid>_<eid>_<heat>` uniform writes | ⚠️ | Manual save normalizes `{results:[]}` structure; judge page parity unverified within scope. [pages/run_console.html:L684-L708](../../pages/run_console.html#L684-L708) |
| 5 | Leaderboard auto-refresh | ⚠️ | `publishReveal()` triggers `publishLeaderboard()` but no listener ensures display refresh beyond local storage tick. [pages/run_console.html:L711-L860](../../pages/run_console.html#L711-L860) |
| 6 | Preset fields respected (runs, dropHighLow, advancement) | ❌ | Values displayed in Event Admin yet Run Console relies on manual toggles; advancement absent. [pages/event_admin.html:L194-L205](../../pages/event_admin.html#L194-L205), [pages/run_console.html:L420-L452](../../pages/run_console.html#L420-L452) |
| 7 | Legacy form overwrites preset params | ⚠️ | Setup wizard can still mutate preset fields directly in `window.model.preset`; no guard rails detected. [modules/competition/setup_new.html:L1522-L1640](../../modules/competition/setup_new.html#L1522-L1640) |
| 8 | Missing/duplicated logic Run Console ↔ State | ⚠️ | Run console defines local storage helpers duplicating `State` read/write patterns; no shared abstraction for scoring rules. [pages/run_console.html:L404-L452](../../pages/run_console.html#L404-L452), [shared/state.js:L1-L52](../../shared/state.js#L1-L52) |

## Additional Observations
- Heat records include preset metadata placeholders (`runsPerAthlete`, `advancementTopN`) but they remain static after creation and are not surfaced in Run Console UI. [pages/event_admin.html:L284-L295](../../pages/event_admin.html#L284-L295)
- Leaderboard publishing writes ID-only rows (`leaderboard_<CID>_<EID>`), yet TV/Display modules currently stubbed, indicating downstream consumers still pending. [pages/run_console.html:L820-L860](../../pages/run_console.html#L820-L860)
- `SyncLocal` storage bus unused, implying Phase D real-time judge syncing not wired. [core/sync_local.js:L1-L32](../../core/sync_local.js#L1-L32)

**Baseline Completion:** 2 ✅, 4 ⚠️, 14 ❌ across Phase D Ladder. Focus areas for next iteration include preset hydration, advancement workflow, and athlete/judge seeding automation.
