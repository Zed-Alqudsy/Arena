module_registry.md
# Module Registry — XGAMES ARENA

> Scope: Verified from current codebase only (offline/localStorage architecture).

## 1) Athlete Module
**Files:**  
- modules/athlete/home.html  
- modules/athlete/register.html  
- modules/athlete/join.html

**Inputs (reads):**  
- athletes_master

**Outputs (writes):**  
- athletes_staging  
- nsid_cursor_<FID>  
- athletes_master_tick  
- entries_staging_<CID>  
- athletes_tick_<CID>

**Primary Flows:**  
- Register → staging → tick (federation reviews)  
- Join Competition → entries_staging_<CID> → tick

**Status:** ✅ Working (offline)

---

## 2) Federation Module
**Files:**  
- modules/federation/approve_athletes.html  
- modules/federation/approve_entries.html

**Inputs:**  
- athletes_staging, athletes_master  
- entries_staging_<CID>

**Outputs:**  
- athletes_master, athletes_rejected  
- athletes_master_tick  
- athletes_<CID>, athletes_aid_cursor_<CID>  
- athletes_tick_<CID>

**Primary Flows:**  
- Approve/Reject athletes  
- Approve entries → roster publish (AID assign)

**Status:** ✅ Working (offline) | ❌ Auth missing

---

## 3) Competition Module (Setup/Display)
**Files:**  
- modules/competition/setup.html  
- modules/competition/setup_new.html  
- modules/competition/display.html  
- modules/competition/leaderboard.html  
- modules/competition/control.html (ops hub shell)

**Inputs:**  
- arena_competitions_setup  
- leaderboard_<CID>_<EID> (for display pages)

**Outputs:**  
- arena_competitions_setup

**Primary Flows:**  
- Create/Edit competitions (draft list)  
- Display leaderboard (read‐only)

**Status:** ⚙️ Partial (validation/scoring composer future)

---

## 4) Pages — Navigation & Organizer
**Files:**  
- pages/competition_center.html, competition_list.html, competition_new.html, competition_home.html  
- pages/athlete_center.html, federation_center.html

**Inputs:**  
- competitions_active OR comps (legacy)  
- athletes_master, entries_staging_<CID>

**Outputs:**  
- comps (via new competition)

**Primary Flows:**  
- Create new competition, list/filter, navigate to admin tools

**Status:** ✅ Working

---

## 5) Run Module (Live Ops)
**Files:**  
- pages/event_admin.html  
- pages/heat_select.html  
- pages/run_console.html  
- pages/judge.html

**Inputs:**  
- events_<CID>, heats_<CID>_<EID>  
- athletes_<CID>, judges_<CID>, scoring_<CID>  
- judge_status (bus)

**Outputs:**  
- scores_<CID>_<EID>_<HEAT>  
- active_heat, reveal(+tick), leaderboard_<CID>_<EID>(+tick)  
- display_control_live1/2  
- heats_<CID>_<EID> (status)  
- eventlog_<CID>_<EID>_<HEAT>

**Primary Flows:**  
- Event → Heat → Judges submit → Reveal → Publish leaderboard → TV control

**Status:** ✅ Working (offline, local bus)

---

## 6) Broadcast Module
**Files:**  
- pages/tv_display.html (primary)  
- pages/tv_scoreboard.html (legacy/fallback)

**Inputs:**  
- display_control_live1/2  
- reveal(+tick), leaderboard_<CID>_<EID>(+tick)  
- athletes_<CID>, competitions_active

**Outputs:**  
- None (read-only view)

**Primary Flows:**  
- Display Intro / Scoreboard / Leaderboard via cross-tab storage events

**Status:** ✅ Production display (tv_display) | ⚠️ Legacy (tv_scoreboard)

---

## 7) Core/Shared
**Files:**  
- core.js, state.js, ui.js, lang.js, sync_local.js

**Capabilities:**  
- URL/guard, uid, JSON IO, pushUnique, ticks, computeAge  
- Toasts, Lang swap, localStorage bus (judge_status)

**Status:** ✅ Stable (offline architecture)


traceability_register.md
# Traceability Register — File → Feature → Data Keys → Functions

> Purpose: Make audits deterministic. Shows where each feature lives and which keys/functions it touches.

## Legend
- R = reads, W = writes

---

## Athlete
**modules/athlete/register.html**  
- Feature: Athlete registration form  
- Keys: athletes_staging (W), athletes_master (R), nsid_cursor_<FID> (R/W), athletes_master_tick (W)  
- Functions: State.setJSON / pushUnique, computeAge, Core.uid/Param, UI.toast

**modules/athlete/join.html**  
- Feature: Competition entry form  
- Keys: athletes_master (R), entries_staging_<CID> (W), athletes_tick_<CID> (W)  
- Functions: Core.getParam/requireParams, State.arr/pushUnique, UI.toast

---

## Federation
**modules/federation/approve_athletes.html**  
- Feature: Approve/Reject/Import athletes  
- Keys: athletes_staging (R/W), athletes_master (R/W), athletes_rejected (W), nsid_cursor_<FID> (R/W), athletes_master_tick (W)  
- Functions: parseCSV/import, dedupe, cursorIncrement

**modules/federation/approve_entries.html**  
- Feature: Approve entries → roster publish (AID)  
- Keys: entries_staging_<CID> (R/W), athletes_<CID> (W), athletes_aid_cursor_<CID> (R/W), athletes_tick_<CID> (W), athletes_master (R)  
- Functions: AID assign, rosterWrite, UI.toast

---

## Competition (Setup/Display)
**modules/competition/setup_new.html**  
- Feature: Create competition  
- Keys: arena_competitions_setup (R/W)  
- Functions: Core.uid('CID'), State.arr/setJSON

**modules/competition/setup.html**  
- Feature: Manage competition drafts  
- Keys: arena_competitions_setup (R)  
- Functions: filter/sort/render table

**modules/competition/leaderboard.html**  
- Feature: Read & render leaderboard  
- Keys: leaderboard_<CID>_<EID> (R)  
- Functions: render

**modules/competition/display.html**  
- Feature: Read & render display data  
- Keys: leaderboard_<CID>_<EID> (R)  
- Functions: render

---

## Pages — Navigation
**pages/competition_list.html**  
- Feature: List & filter competitions  
- Keys: competitions_active (R) OR comps (R)  
- Functions: search/filter, Core.buildUrl

**pages/competition_new.html**  
- Feature: New competition creator  
- Keys: comps (R/W)  
- Functions: Core.uid, State.arr/setJSON, UI.toast

**pages/federation_center.html**  
- Feature: Dashboard counts  
- Keys: athletes_master (R), entries_staging_<CID> (R), athletes_master_tick / athletes_tick_<CID> (R)  
- Functions: count badges

---

## Run Ops
**pages/event_admin.html**  
- Feature: Event level hub  
- Keys: events_<CID> (R)  
- Functions: Core.requireParams, Core.buildUrl

**pages/heat_select.html**  
- Feature: Choose heat  
- Keys: heats_<CID>_<EID> (R)  
- Functions: list heats, link to run_console

**pages/run_console.html**  
- Feature: Live console  
- Keys: scores_<CID>_<EID>_<HEAT> (R/W), reveal(+tick) (W), leaderboard_<CID>_<EID>(+tick) (W), display_control_live1/2 (W), active_heat (R/W), heats_<CID>_<EID> (R/W), rules (R/W), eventlog_<CID>_<EID>_<HEAT> (R/W), judge_status(+tick) (R), scoring_<CID> (R), athletes_<CID> (R), judges_<CID> (R)  
- Functions: publishReveal, publishLeaderboard, saveManualScores, setHeatStatus, refreshScoresTable, openTVDisplay, setDisplay, log

**pages/judge.html**  
- Feature: Judge scoring terminal  
- Keys: scoring_<CID> (R), athletes_<CID> (R), judge_status(+tick) (W)  
- Functions: computeTotal, lockUI, emitPacket

---

## Broadcast
**pages/tv_display.html**  
- Feature: Intro / Scoreboard / Leaderboard display  
- Keys: display_control_live1/2 (R), reveal(+tick) (R), leaderboard_<CID>_<EID>(+tick) (R), athletes_<CID> (R), competitions_active (R)  
- Functions: renderIntro, applyScoreboardFromReveal, renderLeaderboard, gate

**pages/tv_scoreboard.html**  
- Feature: Legacy scoreboard display  
- Keys: display_control_live1/2 (R), reveal(+tick) (R), athletes_<CID> (R)  
- Functions: applyReveal, gate


dependency_map.md
# Dependency Map

> Who depends on which shared utilities and which storage keys.

## Shared Utilities
- **core.js** → URL params (getParam, requireParams), uid (uid/prefix), buildUrl
- **state.js** → JSON IO (get/set), arrays (arr/push/pushUnique), ticks (bumpTick), computeAge
- **ui.js** → toast()
- **lang.js** → i18n swap
- **sync_local.js** → localStorage bus wrapper (judge_status write/read patterns)

## Page/Module → Shared
| File | core.js | state.js | ui.js | lang.js | sync_local.js |
|------|---------|----------|------|--------|----------------|
| athlete/register | ✅ | ✅ | ✅ | ✅ | — |
| athlete/join | ✅ | ✅ | ✅ | — | — |
| federation/approve_athletes | ✅ | ✅ | ✅ | — | — |
| federation/approve_entries | ✅ | ✅ | ✅ | — | — |
| competition/setup_new | ✅ | ✅ | ✅ | — | — |
| competition/setup | ✅ | ✅ | — | — | — |
| pages/competition_list | ✅ | ✅ | ✅ | — | — |
| pages/competition_new | ✅ | ✅ | ✅ | — | — |
| pages/event_admin | ✅ | ✅ | — | — | — |
| pages/heat_select | ✅ | ✅ | — | — | — |
| pages/run_console | ✅ | ✅ | ✅ | — | ✅ (ingest pattern) |
| pages/judge | ✅ | ✅ | ✅ | — | ✅ (emit pattern) |
| pages/tv_display | ✅ | ✅ | — | — | — |
| pages/tv_scoreboard | ✅ | ✅ | — | — | — |

## Storage Key Touchpoints (high level)
- **Creation/Setup:** arena_competitions_setup (setup_new W, setup R)
- **Athletes:** athletes_staging (reg W; approve_athletes R/W), athletes_master (approve_athletes W; many R)
- **Entries:** entries_staging_<CID> (join W; approve_entries R/W)
- **Rosters:** athletes_<CID> (approve_entries W; run/judge/tv R)
- **Heats/Scores:** heats_* (run_console R/W), scores_* (run_console R/W)
- **Bus/Ticks:** judge_status(+tick) (judge W → run_console R), leaderboard_tick / reveal_tick (run_console W → tv R)
- **Displays:** display_control_live1/2 (run_console W → tv R)


qa_playbooks.md
# QA Playbooks — Deterministic Local Tests

## Seed Helpers (run in DevTools Console)
```js
function seedScoring(cid='C1'){
  localStorage.setItem(`scoring_${cid}`, JSON.stringify({
    criteria:[{label:'Difficulty',weight:1},{label:'Execution',weight:1},{label:'Flow',weight:1}]
  }));
}
function seedAthletes(cid='C1'){
  localStorage.setItem(`athletes_${cid}`, JSON.stringify([
    {aid:'A1',name:'Ali',country:'MAS'},
    {aid:'A2',name:'Bala',country:'MAS'},
    {aid:'A3',name:'Chan',country:'MAS'}
  ]));
}
function seedHeats(cid='C1',eid='E1'){
  localStorage.setItem(`heats_${cid}_${eid}`, JSON.stringify({heats:[{status:'Pending'},{status:'Pending'}]}));
}

Playbook A — Athlete Registration & Federation Approval

Open modules/athlete/register.html → submit 1 athlete (FID=MSF).

Verify athletes_staging created; athletes_master_tick bumped.

Open modules/federation/approve_athletes.html → Approve 1 athlete.

Verify athletes_master contains the athlete and cursor nsid_cursor_MSF incremented.

Playbook B — Join & Approve Entry to Roster

Open modules/athlete/join.html?cid=C1 → submit NSID + category.

Verify entries_staging_C1 contains the entry.

Open modules/federation/approve_entries.html?cid=C1 → approve.

Verify athletes_C1 updated (AIDs assigned) and athletes_tick_C1 bumped.

Playbook C — Full Run (Manual Scores)

Run in console: seedScoring('C1'); seedAthletes('C1'); seedHeats('C1','E1');

Open pages/run_console.html?cid=C1&eid=E1&heat=1. Click Start.

Enter Manual Scores for A1 (J1..J5) → Save Manual Scores.

Toggle Drop extremes and check Final changes.

Reveal → confirm reveal & reveal_tick.

Publish Leaderboard → confirm leaderboard_C1_E1.rows sorted.

Playbook D — Judge → Run Console → TV (Bus)

In Tab 1: seedScoring('C1'); seedAthletes('C1'); seedHeats('C1','E1');

In Tab 1: open run_console.html?cid=C1&eid=E1&heat=1 and Start.

In Tab 2: open judge.html?cid=C1&eid=E1&heat=1&j=J1&aid=A1; enter scores; Lock & Submit.

Observe Tab 1 updates live (ingests judge_status).

In Tab 3: open tv_display.html?screen=live1&cid=C1&eid=E1&heat=1.

In Tab 1: Reveal → TV updates to current athlete.

Set display mode to Leaderboard → TV switches.

Playbook E — Recovery & Logs

With scores present, refresh run_console.html → event log restored.

active_heat retained if still running.

Clear storage items (reveal/leaderboard) → verify TVs fail gracefully (empty UI).


---

### `naming_conventions.md`

```markdown
# Naming Conventions

## IDs
- **CID** (Competition ID): `CID-xxxxxxxx` via Core.uid('CID') or compact prefix. Unique per competition.  
- **EID** (Event ID): free string (e.g., `E1`, `street`, `park`).  
- **AID** (Athlete Competition ID): `A001`, `A002`, ... per competition via `athletes_aid_cursor_<CID>`.  
- **NSID** (Federation Athlete ID): `NSID-<FID>-<YYYY>-<#####>` via `nsid_cursor_<FID>`.

## localStorage Keys (Patterns)
- Federation:  
  - `athletes_staging`, `athletes_master`, `athletes_rejected`, `athletes_master_tick`, `nsid_cursor_<FID>`
- Competition Setup:  
  - `arena_competitions_setup`, `competitions_active` (optional)
- Competition Details:  
  - `events_<CID>`, `judges_<CID>`, `scoring_<CID>`, `officials_<CID>`
- Entries & Roster:  
  - `entries_staging_<CID>`, `athletes_<CID>`, `athletes_aid_cursor_<CID>`, `athletes_tick_<CID>`
- Heats & Scores:  
  - `heats_<CID>_<EID>`, `scores_<CID>_<EID>_<HEAT>`
- Bus & Publish:  
  - `judge_status`, `judge_status_tick`  
  - `reveal`, `reveal_tick`, `leaderboard_<CID>_<EID>`, `leaderboard_tick`
- Displays:  
  - `display_control_live1`, `display_control_live2`

## Criteria Slugging
- Criteria labels → lowercase, spaces → `_` (e.g., **“Difficulty Level” → `difficulty_level`**).  
- Judge packets and compute logic rely on slug consistency.

## Ticks
- Suffix `_tick` indicates a timestamp string used to force UI refresh via storage events.

## Privacy Rule
- Public artifacts (`reveal`, `leaderboard_*`) must store **IDs only** (no PII like `national_id`).


changelog_seed.md
# Changelog (Seed)

> Start tracking changes from this baseline. Each entry must state *what file*, *what key/flow*, and *why*.

## [YYYY-MM-DD] INIT — Baseline
- Added ZAAP docs: filemap.json, data_contracts.json, routes.json, sync_matrix.md, schemas.md, module_registry.md, traceability_register.md, dependency_map.md, qa_playbooks.md, naming_conventions.md.
- Verified offline architecture: Athlete, Federation, Competition, Run, Broadcast, Core.

## [YYYY-MM-DD] Change Examples (Template)
- **run_console.html** — Compute: normalize legacy `scores_*` shape → `{results:[]}` support.  
- **judge.html** — Emit: enforce 0–100 clamp; add `time` field to packet.  
- **tv_display.html** — Display control: handle corrupted `display_control_liveX` by defaulting to `scoreboard`.  
- **approve_entries.html** — Roster: ensure no PII fields in `athletes_<CID>`; AID cursor increments atomically.  
- **register.html** — NSID generator: pad sequence to 5 digits; ensure `nsid_cursor_<FID>` writeback.

## Format


[YYYY-MM-DD] <scope> — <short title>

Files:

Keys changed:

Behavior:

Reason:

QA: