# 🧭 XGAMES DEVELOPMENT LOG

### Purpose
Master live record of all build actions, code changes, and test results.

---
[2025-10-19] Step 1: Verify Setup Output
Files Edited:
- setup_new.html (via UI actions)

Changes Made:
- Successfully executed Approve & Activate
- Generated full localStorage key set (competitions_active, events_, heats_, judges_, athletes_, scoring_, display_, officials_)
- Confirmed CID_1760847441075 and others written

Keys Used:
- competitions_active (auto list)
- events_<CID>, heats_<CID>_<EID>, judges_<CID>, athletes_<CID>, scoring_<CID>, display_<CID>, officials_<CID>

Test Result:
- Validate and Approve succeeded with green confirmation
- Keys confirmed via console (16 total)
- System now ready for RUN module linkage

Next Action:
- Step 2: Build Run Home (competition_home.html) — list competitions and heats with status

[2025-10-19] Step 2: Build Run Home (competition_home.html) + Wire Competition Listing
Files Edited:
- /pages/competition_home.html
- /pages/competition_list.html

Changes Made:
- Added top toolbar under header:
  - [+ Create New Competition] → ../modules/competition/setup_new.html
  - [Choose Current Active Competition] → competition_list.html
- Moved “Events & Heats” card into .grid so it displays side-by-side with Overview & Event Admin.
- Rendered Events & Heats with per-heat “Run Heat” links (reads heats_<CID>_<EID> shells).
- Added status badges helper (Not Started / Running / Done).
- Set page header title to “<CID> — <Competition Name>”.
- Fixed data source to use approved list: competitions_active (replaces draft-only State.keys.comps).
- Added fallback button in Event Admin card: [Open Run Console (Heat 1)].
- Added click handler for the fallback button → run_console.html?cid=<CID>&eid=<firstEvent>&heat=1.
- Fixed competition_list.html to read from competitions_active (fallback: approved in ‘competitions’).
- Seeded a full demo competition (CID_DEMO_2025) for UI verification (events + heats with varied statuses).

Keys Used (read-only):
- competitions_active
- events_<CID>
- heats_<CID>_<EID>
- athletes_<CID>, judges_<CID> (for counts)
- scoring_<CID> (presence only)

Test Result:
- competition_list.html shows only Approved items from competitions_active.
- Clicking Open → competition_home.html?cid=<CID> renders:
  - Overview (name/venue/date/status)
  - Events & Heats with correct counts and colored status badges
  - “Run Heat” buttons linking to run_console.html with cid/eid/heat params
  - Fallback “Open Run Console (Heat 1)” works when shells have no heats
- Demo seed (CID_DEMO_2025) displays Running/Done/Not Started badges as expected.

Next Action:
- Step 3 (Run Console): implement minimal heat runner (Start → Running, Lock → freeze inputs, Reveal → publish) writing back to heats_<CID>_<EID>.heats[].status and emitting display packet for scoreboard/leaderboard.
Flow We Implemented (Competition Home as the parent)
Create New Competition (button) → modules/competition/setup_new.html

Approve & Activate writes competitions_active, events_<CID>, heats_<CID>_<EID>, etc.

Choose Current Active Competition (button) → pages/competition_list.html

Lists only Approved items from competitions_active.

Open a competition → pages/competition_home.html?cid=<CID>

Shows Overview, Events & Heats (reads events_<CID> + heats_<CID>_<EID>).

Status badges per heat.

Actions:

Run Heat → pages/run_console.html?cid=<CID>&eid=<EID>&heat=<#>

Open Event Admin → pages/event_admin.html?cid=<CID>&eid=<first>

Open Run Console (Heat 1) (fallback) → same as above with heat=1.

2025-10-19 — Step 3 (Run Console) — Pilot Usable

Scope: Complete the minimum viable Run Console to operate one event heat end-to-end without adding new pages. No resets; all prior architecture intact.

Files Touched

/pages/run_console.html

Replaced skeleton with operational MASTER RUN page (pilot).

Added stable layout (CSS grid) with named areas:
Row 1: Status | Judge Links
Row 2: Run Controls (full width)
Row 3: Scores Monitor | Event Log

No other files changed (no TV/Display pages added in this step).

UI Zones (final IDs)

Status: #lblHeatStatus, counts (#ath, #jud), debug #activeHeatDebug

Judge Links: container #judgeLinks (links are placeholders until Step 4)

Run Controls: #btnStart, #btnLock, #btnReveal, #btnUndo, athlete select #selAthlete, drop-extremes #chkDropExtremes

Manual Scores (pilot): inputs #ms_J1 … #ms_J5, action #btnSaveManual

Scores Monitor: #lblScoreStatus, #lblFinalScore, table #tblScores

Event Log: #eventLog, clear #btnClearLog

(Future display placeholders): screen select #selScreen, quick buttons #btnSetIntro, #btnSetScoreboard, #btnSetLeaderboard, #btnHide, and #btnPublishLeaderboard (write packets only)

Storage Contract (reads/writes)

Read on load

athletes_<CID> — athlete list

judges_<CID> — judge list

heats_<CID>_<EID> — heat objects (to show status)

rules — { dropExtremes: boolean }

active_heat — rehydrate if mid-run

scores_<CID>_<EID>_<HEAT> — populate Scores Monitor

Write on actions

Start: active_heat = { cid,eid,heat }; update heats_<CID>_<EID>.heats[heatIdx].status = "Running"

Manual Scores → Save: upsert to scores_<CID>_<EID>_<HEAT>.results[] rows
{ jid, aid, total:number, time:"HH:MM:SS" } (per judge & athlete)

Drop extremes (toggle): rules = { dropExtremes: true|false }

Lock: update heat status to "Completed" and disable manual inputs

Reveal: compute final (respecting rules) and write reveal = { cid,eid,heat,aid,judgeTotals:number[], final:number|null }

Undo: remove reveal

Publish Leaderboard (pilot): leaderboard = { list:[{aid,name,final:number}] }

Display control (placeholder only for Step 5): display_control_live1|live2 = "intro"|"scoreboard"|"leaderboard"|"hide" (no TVs added yet)

Behaviour & Flow (operator)

Start heat → status becomes Running; active_heat set.

Select athlete → enter Manual Scores for J1–J5 → Save Manual Scores (writes to scores_…).

(Optional) Toggle Drop extremes.

Lock heat → prevent further edits (pilot: disables manual inputs).

Reveal → writes reveal packet (final computed from saved scores).

(Optional) Publish Leaderboard → writes basic ranks (last score per athlete).

What We Did NOT Add (by design in this step)

No Judge View page yet (Step 4).

No Display/TV pages or live switching (Step 5).

No changes to Setup pages or arena_competitions_setup.

No network realtime; localStorage-only.

Tests Performed (manual)

Layout: Verified target layout on 1024–1440 px; stacks correctly <900 px.

Recovery: Page restores state from active_heat; monitor rehydrates from scores_….

Scoring: Manual entries persist; status counts update; final computes with/without drop extremes.

Reveal: reveal packet created; Undo removes it.

Leaderboard: Basic list generated and written.

Known Limits (accepted for pilot in Step 3)

One active heat at a time (no cross-heat concurrency).

Judges are not submitting via links yet (Manual Scores stands in).

Displays/TV switching not active yet (buttons just write control keys).

Next Ladder Steps

Step 4 — Judge View: add /pages/judge_view.html

Read active_heat, scoring_<CID> (if present); post entries to scores_<CID>_<EID>_<HEAT>.results[].

Update Judge Links to point to this page with ?cid=&eid=&heat=&jid=.

Step 5 — Displays/TV: add /pages/tv.html router; hook to display_control_live* to load intro.html / scoreboard.html / leaderboard.html.

Scoreboard should read reveal; Leaderboard reads leaderboard.

Display Centre (controller) can remain read-only or be added later.

Rollback

Replace /pages/run_console.html with previous skeleton if needed.

No other files changed; storage keys backward-compatible.∂




XGAMES RUN – Working Session Log
Context

Repo tree confirmed. pages/run_console.html exists and is the active Run page.

New competition created via modules/competition/setup_new.html and Activated:

CID: CID_1760864913946

Event: E1

Heat: 1

Changes we made (persisted in files)

Bus: core/sync_local.js

Implemented a simple localStorage bus with topic judge_status (window.SyncLocal = {send, on, TOPIC:'judge_status'}).

Included in Run Console <head>: <script src="/core/sync_local.js"></script>.

Judge page: pages/judge.html

Minimal panel with 3 inputs (Difficulty, Execution, Flow) + “Lock & Submit”.

On submit: calls SyncLocal.send('judge_status', {...}).

Run Console

Added Judge Links generator (J1–J5) using current cid/eid/heat (and current athlete where available).

Added Monitor renderer (renderRunMonitor) that:

Derives key from URL: scores_${cid}_${eid}_${heat}

Renders table #tblScores

Updates “x/5 submitted” line

Updates “Final (current athlete)” label (#lblFinalScore)

Added Judge packet ingestion listener that:

Listens to storage events for judge_status / judge_status_tick

Writes rows into scores_${cid}_${eid}_${heat}

Calls renderRunMonitor() and writes an Event Log line

What works (verified)

Competition setup → Run Console sees 3 athletes in the dropdown (data wiring OK).

Manual scoring:

Entered J1..J5 totals in Run Console → Event Log showed saves.

Final score updates when using manual inputs.

Judge page emits packet:

In Judge tab, localStorage.getItem('judge_status') shows the correct JSON packet after submit.

Run Console renderer:

renderRunMonitor() displays Scores Monitor table, submitted counter, and Final when scores_${cid}_${eid}_${heat} contains rows.

What doesn’t work (still)

Auto-ingest from judge tab to run tab (cross-tab) is not triggering reliably:

Judge page sends SyncLocal.send('judge_status', pkt).

In the Run Console:

The storage event handler didn’t fire consistently (no automatic Event Log, no automatic table update).

Manually pulling judge_status and calling an ingestion helper updated logs/table, which proves rendering is fine; the issue is event delivery or write shape.

Submitted counter initially showed 0/0 because we weren’t using judges_${cid} for total count; now renderer falls back to 5 if the judges list is absent.

Judge label on judge tabs still shows static “Judge 1” (cosmetic; doesn’t affect logic).

Observations / facts from your storage (Run Console)

Active keys observed:

scores_CID_1760864913946_E1_1 (array of rows {athleteId, judgeId, totals, ts}) ← where Run should read/write.

judge_status (latest packet from any judge tab).

judges_CID_1760864913946 (exists; length 26 chars → likely 5 judges; not yet read for exact count).

Event Log examples:

[18:35:35] RECOVER: active heat restored

[18:11:19] JUDGE LOCK · J1 → A1

Likely root cause (why auto-ingest didn’t show)

Storage event between tabs didn’t fire or wasn’t bound early enough. Two possibilities:

The storage listener script block loads after first packet was set (race); no backfill read.

Browser didn’t emit storage for same-origin/same window conditions on your setup. (We tried judge_status_tick nudges, but still didn’t see the event.)

What’s confirmed good

Data model: scores_${cid}_${eid}_${heat} array works with the renderer.

Manual ingestion via console updates Event Log + Table + Final correctly.

The judge packet format we’re sending is adequate for transformation.

What’s pending (to complete the loop)

Make auto-ingest deterministic:

Ensure Run Console binds the storage listeners before any judge packet (on DOMContentLoaded).

On page load and on Start, perform a backfill read of judge_status and ingest if present (covers missed events).

Confirm the judge page always calls SyncLocal.send('judge_status', pkt) (not just writing localStorage without send).

URLs used (for reference)

Run Console:
/pages/run_console.html?cid=CID_1760864913946&eid=E1&heat=1

Judge links (generated on Run):
/pages/judge.html?cid=CID_1760864913946&eid=E1&heat=1&j=J1 (… J2–J5)

Minimal reproducible steps (current state)

Open Run Console (URL above).

Open a Judge tab (J1 link).

Submit (Lock & Submit) → packet appears in judge tab storage.

In Run Console Console, run:

const pkt = JSON.parse(localStorage.getItem('judge_status')||'null');

ingestJudgePkt(pkt);
→ Event Log + Table + Final update.

Summary

Stage-3 Run Console is functional for manual scoring and display.

Judge page exists and emits judge_status packets.

Gap: cross-tab auto-ingest from judge → run isn’t firing (event binding/timing/environment), though manual ingest proves the data path is correct.


### 2025-10-19 — Run Console judge sync fix (stability + persistence)

**Symptoms fixed**
- Event Log didn’t reflect judge submits reliably, sometimes only Scores Monitor updated.
- Event Log cleared on refresh.
- Double “JUDGE LOCK …” lines (caused by dual listeners + tick replay).

**What we changed (micro-patches, no bloat)**
1) **Single-source rendering**  
   - `refreshScoresTable()` now normalizes both score shapes (`[{…}]` or `{results:[…]}`) and is the authoritative refresher.
   - All judge ingests call `refreshScoresTable()`.

2) **Event Log persistence**  
   - `window.log(...)` now appends to UI **and** saves to `localStorage:eventlog_<cid>_<eid>_<heat>`.  
   - On load, log is restored; **Clear Log** removes the saved copy.

3) **Duplicate source disabled**  
   - Short-circuited `SyncLocal.on(...)` judge handler (kept, but returns immediately) to avoid double processing and double logs.
   - Storage listener now handles only `judge_status` and **ignores** `judge_status_tick` (de-duped by payload).

4) **Smarter log semantics**  
   - First submit: `JUDGE LOCK · Jx → Ay`  
   - Re-submit for same judge/athlete: `UPDATE · Jx → Ay` (previously wrote a second LOCK line).

**Keys touched**
- `scores_<cid>_<eid>_<heat>` (read/write)
- `eventlog_<cid>_<eid>_<heat>` (read/write)
- `rules`, `active_heat` (read/write unchanged)

**Test protocol (DoD)**
- Open Run Console, open two Judge tabs (J1, J2).
- J1 submit → Event Log shows `JUDGE LOCK · J1 → A1`, Scores Monitor increments.
- J1 submit again with a new value → Event Log shows `UPDATE · J1 → A1`, table row updates, no double LOCK.
- Clear Log → refresh → log remains empty (persistence verified).
- Toggle “Drop extremes” → `REFRESH · n/N submitted (Final=…)` line appears once per refresh.

**Notes**
- This keeps Step 4 (Judge page) and Step 5 (Display Centre) unchanged.
- No new storage keys introduced; all changes are backward-compatible.

2025-10-20 — Step 4: Judge View (build + wiring + polish)
Summary

Delivered a production-ready Judge View that reads Setup-New scoring rules, collects scores, computes a weighted 0–100 total, and submits via localStorage to update Run Console live. Added small compatibility patches so Run Console shows the same weighted total.

Files touched

/pages/judge.html — new/overhauled (parts 4.1 → 4.4)

/pages/run_console.html — compatibility tweaks to display weighted totals sent by judges (kept minimal)

Storage keys used (no new global contracts)

Read (Judge): scoring_<cid> → { criteria: [{ label, weight }, ...] }

Write (Judge): judge_status (JSON packet), judge_status_tick (nudge integer)

Read/Write (Run Console existing): scores_<cid>_<eid>_<heat>

Packet format (Judge → Run Console)

On Lock & Submit, Judge writes:

{
  "type": "judge_status",
  "cid": "<cid>",
  "eid": "<eid>",
  "heat": "<heat>",
  "judgeId": "J1",
  "athleteId": "A1",
  "scores": { "<label_slug>": <0..100>, ... },
  "total": 72.00,
  "status": "locked"
}


label_slug is lowercased, spaces → underscores (e.g., "Flow Style" → "flow_style").

total is a weighted average normalized to 0–100 based on scoring_<cid>.criteria[].weight.

What we shipped (by sub-step)
4.1 — Base Judge page

New minimal UI: criteria inputs + Lock & Submit.

Parameterization via URL: ?cid=&eid=&heat=&j=&aid=.

4.2 — Wire Setup-New rules

Judge reads scoring_<cid> and builds inputs dynamically from criteria[] (label + weight).

Computes weighted total client-side (normalized to 100).

4.3 — Live total + validation

Live Total preview updates as the judge types.

Input validation: clamp and enforce 0–100.

Locks UI post-submit; prevents accidental resubmits.

4.4 — Olympic-grade UI polish (no logic change)

Sticky mast header: Judge / Athlete / Timer.

Large keypad-friendly number inputs with focus states.

Confirm dialog on submit; safe-unload warning before submit.

Clear, high-contrast visual style suitable for arena lighting.

Run Console compatibility patches (minimal)

Score renderer now accepts:

r.total (preferred), OR

Weighted recompute from r.scores using scoring_<cid> if r.total is missing.

Outcome: Run Console totals exactly match Judge totals.

DoD / Test protocol (passed)

In Setup-New: define criteria + weights → Approve & Activate.

Open Run Console for a heat; click a Judge link.

In Judge View:

See dynamic criteria matching Setup-New (weights shown).

Enter values (0–100) → Live Total changes.

Click Lock & Submit → confirmation → UI locks, timestamp shows.

In Run Console:

Event Log: JUDGE LOCK · Jx → Ay.

Scores Monitor: row appears with weighted total (matches Judge).

Re-submit from same judge (if unlocked for test) → UPDATE · Jx → Ay and table row updates (no duplicate LOCK).

Notes / boundaries

Judge/Run both rely on the activated competition data:

If not Approved & Activated, scoring_<cid> may not exist; Judge falls back to default {Difficulty, Execution, Flow} × 1.

No new keys introduced; all changes are backward-compatible.

Manual scores grid in Run Console remains for pilot; Step 7 (Scoring Engine) can remove it.


[2025-10-20] STEP 5 — DISPLAY CENTRE + TV SCREENS (WORK LOG)
Scope

Separate operator controls from display controls, add live status for Screen 1 & 2, provide launch links, and stand up TV display pages that listen to localStorage (no server).

Changes Made
5A — Run Console: Split Display Centre out (layout)

Edited pages/run_console.html

Grid areas: Added a new display row to grid-template-areas.

CSS: Added .card-display and .display-status classes.

Moved controls: Screen selector + Intro / Scoreboard / Leaderboard / Hide + Publish Leaderboard out of “Run Controls” into a new card: “🎬 Display Centre”.

Run Controls cleaned: Only Start / Lock / Reveal / Undo + Athlete select + Drop extremes + Manual scores remain.

DoD: Two cards visible (“Run Controls” and “🎬 Display Centre”).
Status: ✅ Achieved.

5A.1 — Display Centre: Live status for both screens

Edited pages/run_console.html (same card):

Replaced single status line with two status lines:

Screen 1 → <mode>

Screen 2 → <mode>

Script:

Added updateDisplayStatuses() helper (reads display_control_live1 and display_control_live2).

Updated setDisplay(mode) to call updateDisplayStatuses() after write.

Storage listener updated to refresh statuses when either display key changes.

DoD: Changing modes updates both status lines instantly.
Status: ✅ Achieved.

5A.2 — TV launch links (simplified → one URL per screen)

Edited pages/run_console.html:

Replaced the 6 “Open TV” buttons (Intro/Scoreboard/Leaderboard x 2) with 2 buttons:

Open Screen 1

Open Screen 2

New helper: openTVDisplay(screen) opens:

/pages/tv_display.html?screen=live1&cid=<cid>&eid=<eid>&heat=<heat>

/pages/tv_display.html?screen=live2&cid=<cid>&eid=<eid>&heat=<heat>

DoD: One stable URL per screen, reduces operator confusion.
Status: ✅ Achieved.

5B — TV Screens (Display pages)
5B.1 (initial): Scoreboard page (first pass)

Created pages/tv_scoreboard.html (first version based on sample).

Gating: Blackout unless display_control_liveX === 'scoreboard'.

Reveal listener: Listens to localStorage.reveal.

Issue: 404s (the sample imported /core/* modules not present in this repo).
Status: ⚠️ Replaced with ZEDOS-native pages below.

5B.2 (current): Unified TV display page

Created pages/tv_display.html (ZEDOS-native; no external module imports).

Modes: Intro / Scoreboard / Leaderboard placeholders (only Scoreboard is functional now).

Gating: Shows selected view based on display_control_live1|live2. Blackout on hide/unknown.

Scoreboard data: Reads:

localStorage.reveal → { cid, eid, heat, aid, judgeTotals[], final }

Fallback (if judgeTotals empty): reads scores_<cid>_<eid>_<heat> to compute per-judge totals.

DoD: One page per screen, auto-switches views via mode; updates on Reveal.
Status: 🟡 Partially achieved (see “Open Issues”).

Data Contracts Touched

Display mode per screen:

display_control_live1 → "intro" | "scoreboard" | "leaderboard" | "hide"

display_control_live2 → same

Reveal packet (Run Console → Displays):

Key: reveal

Current shape (confirmed): { cid, eid, heat, aid, judgeTotals:[], final:null|number }

Scores store (Judge/Run aggregation):

Key: scores_<cid>_<eid>_<heat>

Shapes encountered:

Array of rows or { results: [...] }

Rows may be { aid, total } or { athleteId, totals: { difficulty, execution, flow } }

Athletes store:

Key: athletes_<cid> (e.g., athletes_CID_1760864913946)

IDs can be id or aid. Name exists as name.

Tests Performed & Observations

Gating test (manual):

Set display_control_live1 = 'scoreboard' and live2 = 'scoreboard' in console → TV displays un-blackout.

Result: ✅ Works.

Status lines (Run Console):

Switching modes updates Screen 1 → … and Screen 2 → ….

Result: ✅ Works.

Open TV links:

Open Screen 1/2 open unified page with ?screen=liveX&cid=...&eid=...&heat=....

Result: ✅ Opens.

Reveal path:

After entering manual scores and clicking Reveal, reveal packet exists but often has:

judgeTotals: []

final: null

Result: ❌ Displays show athlete name (after fixes) but no scores.

UI layout:

The separation of cards is visible but spacing and wrapping still need polish.

Result: 🟡 Needs repair polish.

Open Issues (Current Status)

Both TV screens black (intermittent):

When display_control_liveX not set to "scoreboard", page blackouts by design.

Current state: You set both to "scoreboard"; blackout cleared. ✅

Scoreboard shows correct athlete name but not scores/final:

reveal packet frequently lacks judge totals and final (judgeTotals: [], final: null).

The fallback computation in tv_display.html depends on scores_<cid>_<eid>_<heat> having rows for the selected athlete; that may be missing or in an unexpected shape at the moment of reveal.

Status: ❌ Not resolved.

Run Console UI styling:

Card spacing / wrap still cramped; needs CSS polish.

Status: 🟡 Pending.

Root-Cause Hypotheses (Scores not appearing)

H1: publishReveal() uses a shape that doesn’t map rows reliably during a single reveal (e.g., reading from { results: [] } but actual is array; mixing aid vs athleteId; or rows not yet written when Reveal runs).

H2: Manual scores are saved but not normalized into scores_<cid>_<eid>_<heat> with per-judge rows at reveal time.

H3: Fallback compute path in tv_display.html can’t find rows for the current aid immediately after reveal (timing or shape mismatch).

Next Actions (Micro-steps — one at a time)
NA-1 (Confirm scores store shape at reveal moment)

Run exactly this in Run Console console after entering manual scores (before clicking Reveal), and paste result to log:

JSON.parse(localStorage.getItem(`scores_${cid}_${eid}_${heat}`))


Goal: verify shape and per-judge rows for the selected athlete.

NA-2 (Make Reveal packet self-sufficient)

Patch publishReveal() to guarantee judgeTotals & final are computed from the current UI (no dependency on external rows).

Read 5 manual totals (ms_J1..ms_J5) if present.

If not present, compute from the in-memory list the table already uses.

Write judgeTotals (array of numbers length 5 or fewer) and final (number).
Result: reveal always contains complete data → TV shows scores instantly.

(I will provide the exact paste block once NA-1 confirms data shape; keeping to your “one step at a time” rule.)

NA-3 (TV display polish)

Keep tv_display.html as the single page for both screens.

Later wire Intro and Leaderboard (using existing keys) once Scoreboard is stable.

NA-4 (Run Console UI polish)

Tidy margins & grid so two cards never collide/wrap awkwardly.

Rollback / Safety

The new Display Centre card is additive; you can revert to the previous single card by restoring the original card-controls block (backup recommended).

The unified tv_display.html coexists with tv_scoreboard.html. If needed, open the older page for testing while keeping the unified path in place.

Current Conclusion

Architecture simplification is done: one URL per screen; modes controlled centrally.

Major blocker: reveal payload lacks filled judgeTotals and final at the exact moment of Reveal.

Next required step: NA-1 (inspect scores_<cid>_<eid>_<heat> right before Reveal) so I can give you a precise, minimal publishReveal() patch that guarantees the scoreboard shows numbers immediately—no assumptions.



🧩 XGAMES RUN SYSTEM LOG — 2025-10-20

Context: Step 4 → Step 5 transition audit

✅ Step 4 — Judge View (Build + Wiring + Polish)

Dynamic criteria from scoring_<cid> loaded and weighted 0-100 totals computed.

Live total + input validation working; safe-lock on submit.

Packet format judge_status synced with Run Console.

Event Log shows JUDGE LOCK / UPDATE correctly.

Run Console reads the same weighted totals from storage.
Status: ✅ Stable and production-ready

dev_doc

.

✅ Step 5 — Run Console Enhancements (Display Centre + Event Log)

Display Centre: Split out into its own card with Screen 1 / 2 status lines and TV launch buttons.

Event Log: Refreshed to show accurate n/5 submitted (Final = …).

Scores Monitor: Reads judge_status writes instantly via storage listener.

Athlete Names: Now resolve to real names instead of IDs (A1/A2).

Refactor: All localStorage keys (scores_, eventlog_, display_control_liveX) validated.
Status: ✅ Functional and synced with Judge View

dev_doc

.

🟡 Step 5B — TV Screens (Display Pages)

Unified page tv_display.html created.

Modes: Intro / Scoreboard / Leaderboard (placeholders except Scoreboard).

Scoreboard listens to localStorage.reveal.

Pending: live leaderboard render + auto switch from Display Centre.
Status: ⚙️ Partial (Wiring framework complete; visuals next)

dev_doc

.

📊 Current System Status Summary
Module	Function	Status
Judge Page	Criteria input → score → submit	✅
Run Console	Score monitor + event log sync	✅
Display Centre	Screen status + launch controls	✅
TV Display / Scoreboard	Reads reveal data	🟡 Partial
Leaderboard / Publish	Placeholder only	⏳ Next


Step 5D status (DoD check)

5D-1 — Publish Leaderboard (Run Console)

publishLeaderboard() exists and computes finals (drop-extremes respected), sorts & ranks, and writes IDs-only:
leaderboard_<cid>_<eid> = { rows:[{rank, aid, final}] } and bumps leaderboard_tick. 

run_console

 

run_console

The “Publish Leaderboard” button is wired to this function. 

run_console

✅ We also added auto-publish after every Reveal (inside publishReveal()), so the leaderboard refreshes immediately when you reveal (you confirmed this now works).

5D-2 — Render Leaderboard (TV page)

TV reads leaderboard_<cid>_<eid> + athletes_<cid>, maps aid → name at render-time only, and paints a simple table (rank, name, final). 

tv_display

 

tv_display

TV listens for live updates and re-renders when the payload or tick changes (storage listeners cover both leaderboard_${cid}_${eid} and leaderboard_tick). (You added these two lines during debug.) 

tv_display

5D-3 — Intro View

Intro mode is present in tv_display.html; we added renderIntro() to show competition header and athlete (video with photo fallback), using only reveal + athletes_<cid> + competitions_active and resolving assets at render time (no writes). (You placed it right after show().)

The storage listener now re-renders Intro when reveal changes. (Small guard you added in the listener.)
(Design intent aligns with your master docs’ display rules.) 

XGAMES_RUN_SYSTEM_MASTER_BLUEPR…

5D-4 — QA (no blackout, reliable switching)

TV never blackouts anymore: unknown/empty/quoted modes fall back safely to scoreboard; we also strip accidental quotes like '"leaderboard"'. (Hardened gate().) 

tv_display

Mode switching from Display Centre toggles TVs without perma-black; scoreboard continues to render from reveal; leaderboard updates on publish/auto-publish.

No schema drift: we tolerate legacy scores_* shape {results:[]} at read time only, and keep IDs-only in storage (name mapping is DOM-only). This matches Step-5 manual “Guardrails.” 

XGAMES_RunSystem_Manual_Step5

 

XGAMES_RunSystem_Manual_Step5

Verdict: Step 5D is DONE and matches the DoD you set.

What we changed (surgical log)

TV — mode gate hardening

Normalize & de-quote mode; fallback to "scoreboard" on any bad/empty value; remove blackout; keep host visible.

Stop writing back to storage inside gate()/error paths.
Result: No permanent black; safe default always renders.

TV — Leaderboard renderer & listeners

renderLeaderboard() reads leaderboard_<cid>_<eid> and maps aid to names from athletes_<cid>. 

tv_display

Storage listeners now repaint on both:
leaderboard_${cid}_${eid} (payload write) and leaderboard_tick (nudge). (Prevents timing races.) 

tv_display

TV — Scoreboard stays instant from reveal

Reads reveal only; tolerates legacy scores shape; derives final if needed. 

tv_display

TV — Intro view (video/photo)

Added renderIntro() (ID-only mapping; no storage writes).

Listener refreshes Intro on reveal changes.

Run Console — Leaderboard publisher

publishLeaderboard(): recompute finals with drop-extremes, sort/rank, write {rows:[{rank,aid,final}]} and tick. 

run_console

 

run_console

Auto-publish: one safe call to publishLeaderboard() at the end of publishReveal() (guarded with typeof check).

Button wiring intact: “Publish Leaderboard” calls the same function. 

run_console

Run Console — Display Centre UX

You verified mismatched “hide” was a UI label issue; we didn’t change storage schema. The TVs ignore bad values by design now.

Misc polish

LIVE 1 / LIVE 2 watermark bottom-right so you can tell screens at a glance.

Cross-checks with your master docs

Page roles & wiring (Run Console ⇄ Display): consistent with Blueprint §5–6 and Ladder Step 8/Display sync expectations. 

XGAMES_RUN_SYSTEM_MASTER_BLUEPR…

Storage rules (IDs-only, array canonical for scores_*, tolerate legacy): per Step-5 Manual Guardrails & DoD. 

XGAMES_RunSystem_Manual_Step5

 

XGAMES_RunSystem_Manual_Step5

Key registry examples (competitions/athletes/reveal/leaderboard): match MPR ground truth. 

MPR_FULL_v0.1

 

MPR_FULL_v0.1