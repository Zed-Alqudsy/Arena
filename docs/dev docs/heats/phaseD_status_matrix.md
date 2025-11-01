# Phase D Status Matrix (Preflight Audit)

| ID | Focus | Status | Evidence |
|----|-------|:------:|----------|
| D1 | Heat Select listing | ⚠️ | `pages/heat_select.html` lists heats by name via `State.arr(...)` but omits status/round labels. [pages/heat_select.html:L20-L35](../../pages/heat_select.html#L20-L35) |
| D2 | Run Console extension | ❌ | No run counter or variable run handling detected in `pages/run_console.html`. [pages/run_console.html:L200-L360](../../pages/run_console.html#L200-L360) |
| D3 | Preset scoring model | ⚠️ | Event admin reads `preset_snapshot_<cid>` for summary, but run console only references it for a mismatch badge; scoring parameters not hydrated. [pages/event_admin.html:L179-L205](../../pages/event_admin.html#L179-L205), [pages/run_console.html:L420-L452](../../pages/run_console.html#L420-L452) |
| D4 | Compute scoring | ⚠️ | Averages per athlete with optional drop extremes exist, yet no best-of-runs aggregation. [pages/run_console.html:L562-L680](../../pages/run_console.html#L562-L680) |
| D5 | Implement advancement | ❌ | No writes to `advancement_<cid>_<eid>_<round>` or auto-tagging logic present. |
| D6 | Leaderboard / publish flow | ⚠️ | `publishReveal()` triggers `publishLeaderboard()` storing `leaderboard_<CID>_<EID>`, but no evidence of reveal sync back to UI consumers. [pages/run_console.html:L711-L820](../../pages/run_console.html#L711-L820), [pages/run_console.html:L820-L860](../../pages/run_console.html#L820-L860) |
| D7 | Attach judges to heats | ❌ | Judges panel seeding updates `judges_<cid>` only; heat records keep empty `judgesPanel`. [pages/event_admin.html:L217-L233](../../pages/event_admin.html#L217-L233), [pages/event_admin.html:L284-L295](../../pages/event_admin.html#L284-L295) |
| D8 | Athlete slot seeding scaffold | ❌ | New heats initialize `slots: []` with no auto-population from roster. [pages/event_admin.html:L284-L292](../../pages/event_admin.html#L284-L292) |
| D9 | Preset vs judges mismatch notice | ✅ | Run console injects non-blocking `⚠ Judges Mismatch` badge when counts differ. [pages/run_console.html:L420-L452](../../pages/run_console.html#L420-L452) |
| D10 | Preset-based scoring flow | ❌ | Run console relies on manual toggles/local rules; no binding to preset snapshot values. [pages/run_console.html:L420-L452](../../pages/run_console.html#L420-L452) |
| D11 | Preset completeness validation | ❌ | No audit for missing preset fields beyond display summary. |
| D12 | Event discipline mapping | ❌ | No checks ensuring event discipline matches preset discipline. |
| D13 | Criteria matrix rendering | ❌ | Scoring weights read from `scoring_<cid>` purely for calculations; no criteria UI rendered. [pages/run_console.html:L590-L663](../../pages/run_console.html#L590-L663) |
| D14 | Heat template integrity | ❌ | No validation comparing heats to preset template (athlete/judge counts). |
| D15 | Officials & roles registry | ❌ | No references to `roles_<cid>` or official registry within audited files. |
| D16 | Athlete roster linkage | ❌ | Selector builds from athletes/slotted IDs but lacks duplicate/unassigned checks. [pages/run_console.html:L452-L520](../../pages/run_console.html#L452-L520) |
| D17 | Policies & publishing readiness | ❌ | No policies/tiebreak visibility in run console. |
| D18 | Preset storage audit | ❌ | No verification ensuring presets synced to `preset_snapshot_<cid>`. |
| D19 | Cross-phase consistency diagnostic | ❌ | No diagnostic routines across Setup → Event → Run Console detected. |
| D20 | Go-Live lock-in | ❌ | No locking mechanism preventing preset edits once validated. |

**Completion:** 2 / 20 ✅ (10%), 4 / 20 ⚠️ (20%), 14 / 20 ❌ (70%).
