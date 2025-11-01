# Phase D Diff Summary (Preflight)

| Area | Detected Logic | Gaps vs Ladder |
|------|----------------|----------------|
| `pages/heat_select.html` | Lists heats using stored array and links to Run Console. [pages/heat_select.html:L20-L35](../../pages/heat_select.html#L20-L35) | No status/round labels, no preset tags (D1). |
| `pages/event_admin.html` | Displays preset summary, seeds judges panel size, allows heat CRUD with preset defaults. [pages/event_admin.html:L179-L300](../../pages/event_admin.html#L179-L300) | Judges not copied into heats (D7); slots remain empty (D8); advancement fields static (D5). |
| `pages/run_console.html` | Provides manual scoring capture, judge link generation, reveal + leaderboard writes, drop-extremes calculation. [pages/run_console.html:L200-L860](../../pages/run_console.html#L200-L860) | Missing run counters/variable runs (D2), preset-driven rules (D3/D10), advancement tagging (D5), criteria UI (D13). |
| `modules/competition/setup_new.html` | Attaches preset snapshot to event model and allows preset selection UI. [modules/competition/setup_new.html:L942-L1055](../../modules/competition/setup_new.html#L942-L1055) | No validation to guarantee completeness (D11) or discipline alignment (D12). |
| `modules/competition/preset_mapper.html` | Saves chosen preset to `preset_snapshot_<cid>`. [modules/competition/preset_mapper.html:L31-L65](../../modules/competition/preset_mapper.html#L31-L65) | No auditing or sync safeguards (D18). |
| `shared/state.js` | Offers helpers for storage access and key registry. [shared/state.js:L1-L52](../../shared/state.js#L1-L52) | No new enforcement for preset/heats integrity (D14/D19). |
| `core/sync_local.js` | Storage event helper for judge status topic. [core/sync_local.js:L1-L32](../../core/sync_local.js#L1-L32) | Not integrated with Run Console flow (D6/D19). |
| Display/Leaderboard modules | Placeholder scaffolding only. [modules/competition/control.html:L18-L33](../../modules/competition/control.html#L18-L33) | No leaderboard/publish wiring (D6). |

**Net:** Existing code covers baseline UI flows but leaves majority of Ladder D objectives unimplemented or manual.
