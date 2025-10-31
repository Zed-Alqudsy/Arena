# 🎛️ Run Console Audit (PSR) — pages/run_console.html

> Scope: Phase 1 (facts from code/UI only). No assumptions or rewrites.  
> Entry must be opened with: `?cid=<CID>&eid=<EID>&heat=<N>`

---

## 1) Files Covered
- `/pages/run_console.html`  ← **this doc is based solely on this file**

---

## 2) Purpose & Role
The **Run Console** is the **live operations cockpit** for a single heat within a competition event.  
It centralizes:
- Heat lifecycle control (Start / Lock / Reveal / Undo).  
- Judge link generation (for 5 judges J1–J5).  
- Live score ingestion (from judge tabs or manual entry).  
- Final score computation (weighted by `scoring_<cid>`, supports “drop extremes”).  
- Leaderboard publication (`leaderboard_<CID>_<EID>`) and Display Centre control (`display_control_live1/2`).  
- Dual-screen TV launcher for **Intro / Scoreboard / Leaderboard / Hide**.

---

## 3) Functional Breakdown (UI Zones)
| Zone (card) | Functionality | Notes |
|---|---|---|
| **Status** | Shows counts (Athletes/Judges) and Heat Status | Heat status persisted in `heats_<CID>_<EID>`; active heat debug shows `active_heat` object |
| **Judge Links** | Generates 5 judge URLs (J1–J5) for the **same** `cid/eid/heat` | URLs include optional `aid` (current selected athlete) |
| **Run Controls** | Start, Lock, Reveal, Undo; athlete selector; “drop extremes”; **Manual Scores (pilot)** | Manual input writes to `scores_<CID>_<EID>_<HEAT>` |
| **Display Centre** | Set screen mode: Intro / Scoreboard / Leaderboard / Hide; open TV Screen 1/2 | Per-screen state in `display_control_live1/2`; “Publish Leaderboard” button |
| **Scores Monitor** | Live table of judge submissions (JID, Athlete, Total, Time); final score display | Handles legacy shapes and weighted recompute |
| **Event Log** | Monospace log with timestamps; persisted per heat | Key: `eventlog_<CID>_<EID>_<HEAT>`; name-mapped AIDs → athlete names |

---

## 4) Underlying Logic

### 4.1 Required Params & Boot
- **Required:** `cid`, `eid`, `heat`; else redirect to `heat_select.html`.
- Seeds header tags, loads `athletes_<cid>`, `judges_<cid>`, `heats_<cid>_<eid>`.
- Athlete `<select>` options built from `athletes_<cid>` (supports several shapes).

### 4.2 Data Stores (per-heat + global)
- **Per heat, per event:**
  - `scores_<CID>_<EID>_<HEAT>` — judge results; supports two shapes:
    - Array of rows; or `{ results: [...] }` legacy
  - `eventlog_<CID>_<EID>_<HEAT>` — persisted log buffer (≤ 500 lines)
- **Per event:**
  - `leaderboard_<CID>_<EID>` — published leaderboard `{rows:[{rank,aid,final}]}` (IDs only)
  - `heats_<CID>_<EID>` — heat shells `{heats:[{status:...}]}`, heat status per index
  - `scoring_<CID>` — scoring config `{criteria:[{label,weight}]}` (optional)
  - `judges_<CID>` — judge roster (for counts / names)
  - `athletes_<CID>` — competition roster (for names)
- **Global / rules & displays:**
  - `rules` — `{dropExtremes: boolean}` (applies to compute)
  - `display_control_live1` / `display_control_live2` — TV screen modes (`intro|scoreboard|leaderboard|hide`)
  - `reveal` — last reveal packet `{cid,eid,heat,aid,judgeTotals[],final}`
  - `reveal_tick`, `leaderboard_tick` — nudge timestamps for listeners
  - `active_heat` — `{cid,eid,heat}`; set on Start

### 4.3 Judge Links (J1–J5)
- Built from current page’s `cid/eid/heat` (+ current `aid` if selected).  
- Target page: `/pages/judge.html?cid=…&eid=…&heat=…&j=J1..J5[&aid=…]`  
- Opened in new tabs (noopener).  
- Auto-rebuilt when athlete selection changes; last selection persisted in `ui_sel_ath_<CID>_<EID>_<HEAT>`.

### 4.4 Score Ingestion & Table Refresh
- **Primary path:** storage-based ingest from `judge_status` packets (written by judge tabs via `SyncLocal` elsewhere).  
  - Listener reads `localStorage['judge_status']` if `cid/eid/heat` match; then **merges** into `scores_<…>` (latest per `(aid,jid)` wins).  
  - Triggers table refresh and logs “JUDGE LOCK” or “UPDATE”.
- **Manual Scores (pilot):**  
  - Inputs `ms_J1..J5` → `Save Manual Scores` writes `{aid,jid,total,time}` rows into `scores_<…>` (replace or append).
- **Table compute:**
  - **Per row:** if `row.total` missing → recompute from `row.totals|row.scores` using `scoring_<CID>.criteria` weights; fallback = mean of numeric fields.  
  - **Final (current athlete):** collects judge totals for selected `aid` → applies `dropExtremes` if rule set → average → fixed to 2dp.

### 4.5 Run Controls
- **Start** → sets `active_heat={cid,eid,heat}` and `status="Running"` in `heats_<CID>_<EID>`.  
- **Lock** → sets `status="Completed"`; disables manual inputs (J1..J5).  
- **Reveal** → `publishReveal()`:
  - Builds **judgeTotals[]** for current `aid` (latest per judge); recomputes with scoring if needed; applies rules.  
  - Writes `reveal` packet (IDs only) + `reveal_tick=Date.now()`.  
  - Auto-calls `publishLeaderboard()` (if defined).  
- **Undo** → `localStorage.removeItem('reveal')`.

### 4.6 Leaderboard Publish (IDs only)
- Collates latest judge totals per athlete across all judges.  
- Recomputes totals if needed using `scoring_<CID>.criteria` (slugify labels to keys).  
- Applies drop-extremes if enabled; computes final average; **sort desc**; assigns rank.  
- Writes: `leaderboard_<CID>_<EID> = { rows:[{rank,aid,final}] }` and `leaderboard_tick = Date.now()`.

### 4.7 Display Centre & TV Launcher
- **Set Intro / Scoreboard / Leaderboard / Hide** per screen (1 or 2): writes `display_control_live1|2`.  
- Status mirrors current screen modes.  
- **Open Screen 1/2** → opens `/pages/tv_display.html?screen=liveX&cid=…&eid=…&heat=…` in new tabs.

### 4.8 Event Log (Humanized)
- `window.log()` prefixes timestamps, replaces `A1/A2…` with athlete names via a local ID→Name map from `athletes_<cid>`.  
- Appends to UI box and persists to `eventlog_<CID>_<EID>_<HEAT>` (keep last 500).  
- “Clear Log” empties UI and removes storage item.

### 4.9 Recovery & Live Updates
- On load:
  - Restores **Event Log** view from storage (humanized names).
  - If `active_heat` matches current `cid/eid/heat`, sets UI status to Running.
  - Initial `refreshScoresTable()` to render current state.
- On `storage` events:
  - If `scores_<…>` or `rules` change → refresh table.  
  - If `display_control_live1/2` change → update display statuses.  
  - If `judge_status` or `judge_status_tick` fires → ingest & refresh.

---

## 5) Data Contracts Observed (Verbatim Keys)
- **Heats:** `heats_<CID>_<EID>` (status per heat index), `active_heat`  
- **Scores:** `scores_<CID>_<EID>_<HEAT>` (array OR `{results:[]}`)  
- **Scoring rules:** `scoring_<CID>` → `{criteria:[{label,weight}]}`  
- **Rules (UI):** `rules` → `{dropExtremes:boolean}`  
- **Reveal:** `reveal`, `reveal_tick`  
- **Leaderboard:** `leaderboard_<CID>_<EID>`, `leaderboard_tick`  
- **Displays:** `display_control_live1`, `display_control_live2`  
- **Rosters:** `athletes_<CID>`, `judges_<CID>`  
- **Judge bus:** `judge_status` (+ `judge_status_tick`)  
- **Log:** `eventlog_<CID>_<EID>_<HEAT>`

> **Privacy check:** Run Console writes **ID-only** to `reveal` and `leaderboard_*` (no PII).

---

## 6) Execution Flow (Operator Walkthrough)
1. Open `run_console.html?cid=C1&eid=E1&heat=1`.  
2. **Start** heat → `active_heat` set; heat status = Running.  
3. Judges submit from their tabs (or operator enters **Manual Scores**) → `scores_<C1>_<E1>_1` fills.  
4. Table shows live **n/N submitted**; **Final** (for selected athlete) updates; drop-extremes toggle affects compute.  
5. **Reveal** current athlete → writes `reveal` packet; nudges TVs; **auto-publishes** leaderboard.  
6. **Publish Leaderboard** may also be clicked anytime to recompute & publish.  
7. Use **Display Centre** to control TV screen modes per screen.  
8. **Lock** heat when done; manual inputs disabled; status = Completed.  
9. Logs persist; “Clear Log” wipes UI + storage log for this heat.

---

## 7) Status
| Area | Status | Notes |
|---|---|---|
| Heat lifecycle (Start/Lock/Undo) | ✅ | Persists to `heats_*` and `active_heat` |
| Judge ingest (storage bus) | ✅ | Listens to `judge_status` + tick |
| Manual scores | ✅ | Writes to `scores_*` with replace semantics |
| Weighted compute | ✅ | Uses `scoring_<cid>.criteria` if present |
| Drop extremes | ✅ | Toggle persisted in `rules` |
| Reveal packet | ✅ | IDs only; includes `final` and `judgeTotals` |
| Leaderboard publish | ✅ | Sorted, ranked, IDs only; tick nudged |
| Display Centre | ✅ | Dual screen, per-screen mode persisted |
| Event log | ✅ | Humanized names; persisted; capped to 500 |
| Recovery (active heat) | ✅ | Restores “Running” state |
| Auth / RBAC | ❌ | No role enforcement in this page |

---

## 8) Gaps / Risks
- **Auth/Roles missing:** Any user can operate the console with the URL.  
- **Judge roster fallback:** If `judges_<cid>` absent, table assumes 5 judges; submitted counter may mismatch actual panel size.  
- **Criteria slugging:** Criteria labels are slugged (lowercase, `_`); mismatch with judge packet field names can yield `NaN` unless `total` provided.  
- **Store shape variance:** `scores_*` supports two shapes; legacy form requires normalization (implemented).  
- **No heat lock on reveal:** Reveal doesn’t force heat lock; accidental further edits are possible.  
- **Per-screen display state only:** No central “scene script” — operators must toggle manually.

---

## 9) QA Checklist (Local)
1. Seed `athletes_<C1>` with 3 athletes (A1..A3) + `judges_<C1>` with 5 judges; optional `scoring_<C1>` with criteria.  
2. Open `run_console.html?cid=C1&eid=E1&heat=1`.  
3. Click **Start** → status shows Running; `active_heat` saved.  
4. Enter **Manual Scores** for A1 (J1..J5) → **Save Manual Scores** → confirm table rows + `scores_C1_E1_1` updated.  
5. Toggle **Drop extremes** → final changes accordingly.  
6. **Reveal** A1 → confirm `reveal` packet + `reveal_tick` written.  
7. **Publish Leaderboard** → verify `leaderboard_C1_E1.rows` sorted with ranks.  
8. **Display Centre:** set Screen 1 to **Scoreboard**, Screen 2 to **Leaderboard** → statuses update; open both screens — URLs include `cid/eid/heat`.  
9. **Lock** → manual inputs disabled; status Completed.  
10. Refresh page → **Event Log** restored; `active_heat` recovery sets status if still active.  
11. In second tab, write a fake `judge_status` packet → confirm ingest + table refresh via `storage` event.

---

## 10) Traceability Register (Functions → Contracts)
| Function / Block | Purpose | Keys Touched |
|---|---|---|
| `setHeatStatus(status)` | Persist heat status per index | `heats_<CID>_<EID>` |
| `refreshScoresTable()` | Normalize, compute rows + final; update n/N | `scores_<...>`, `rules`, `scoring_<CID>` |
| `saveManualScores()` | Write/replace rows from manual inputs | `scores_<CID>_<EID>_<HEAT>` |
| `publishReveal()` | Compute & write reveal packet + tick; auto-publish leaderboard | `reveal`, `reveal_tick`, (calls `publishLeaderboard`) |
| `publishLeaderboard()` | Compute finals (drop extremes, weights), rank & store; tick | `leaderboard_<CID>_<EID>`, `leaderboard_tick` |
| `setDisplay(mode)` | Set per-screen mode | `display_control_live1/2` |
| `openTVDisplay(screen)` | Launch TV display URL | (read-only; opens `tv_display.html`) |
| Storage ingest IIFE | Ingest `judge_status` → write/merge scores | `judge_status`, `scores_<...>` |
| `window.log()` | Log with name mapping + persist | `eventlog_<CID>_<EID>_<HEAT>` |

---

## 11) Integration Notes
- **Inputs** (from other modules): `athletes_<cid>`, `judges_<cid>`, `scoring_<cid>`, `heats_<cid>_<eid>`, `judge_status`.  
- **Outputs**: `reveal`, `leaderboard_<cid>_<eid>`, `display_control_live1/2`, `eventlog_*`, updates to `scores_*`, `rules`, `active_heat`.

---

## 12) Production Considerations (Non-blocking facts)
- Add **role-based guard** (organizer only) + “are you sure?” confirmations on `Reveal` and `Publish Leaderboard`.  
- Consider forcing **Lock** on successful Reveal.  
- Sync judge panel size to `judges_<cid>.panelSize` if present to avoid counter mismatch.
