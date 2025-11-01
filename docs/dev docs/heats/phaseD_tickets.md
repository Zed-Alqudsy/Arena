# Tower-Control : Phase D Implementation Tickets (Batch #1 – D1 to D10)

This batch covers execution-layer priorities from the Phase D Ladder audit (D1–D10).  
Reference:  
- `phaseD_preflight_report.md`  
- `phaseD_diff_summary.md`  
- `phaseD_status_matrix.md`  
Branch: `phaseD_refactor_mainflow`  

---

## 🧩 D1 – Heat Select Listing (Preset-Aware)
**File:** `pages/heat_select.html`  `L20-L35`  
**Goal:** Add preset/round/status labels to each heat card.  
**Logic:** Read `preset_snapshot_<cid>` → show `discipline`, `round`, and `runsPerAthlete`.  
**QC:** All heats display preset labels and correct round numbering.

---

## 🧩 D2 – Run Iteration & Variable Runs
**File:** `pages/run_console.html`  `L200-L360`  
**Goal:** Introduce `runCounter` logic and support variable runs per athlete.  
**Logic:** Read `runsPerAthlete` from `preset_snapshot_<cid>`; auto-increment per athlete until limit.  
**QC:** UI cycles through all runs; counter resets per athlete.

---

## 🧩 D3 – Preset Scoring Model Hydration
**Files:** `pages/event_admin.html` `L179-L205`, `pages/run_console.html` `L420-L452`  
**Goal:** Pull `dropHighLow`, `judgingScale`, and `advancementTopN` directly from preset snapshot.  
**QC:** Values rendered in both Event Admin and Run Console match snapshot JSON.

---

## 🧩 D4 – Compute Scoring Aggregation
**File:** `pages/run_console.html`  `L562-L680`  
**Goal:** Implement best-of-runs and average logic using preset rules.  
**QC:** Calculated totals align with preset’s `scoringFormat`.

---

## 🧩 D5 – Advancement Workflow
**File:** `pages/run_console.html`  `L711-L820`  
**Goal:** Write top N athletes to `advancement_<cid>_<eid>_<round>` after reveal.  
**QC:** `advancement_*` key created with correct IDs and count = `advancementTopN`.

---

## 🧩 D6 – Leaderboard / Publish Integration
**Files:** `pages/run_console.html` `L711-L860`, `core/sync_local.js` `L1-L32`  
**Goal:** Ensure leaderboard auto-refresh and sync with display modules.  
**QC:** `leaderboard_<CID>_<EID>` updates trigger `SyncLocal` event; display reflects new data.

---

## 🧩 D7 – Attach Judges to Heats
**File:** `pages/event_admin.html`  `L217-L295`  
**Goal:** Copy judges list from `judges_<cid>` into each heat’s `judgesPanel`.  
**QC:** Each heat object shows correct panel roles and count = `presetSnapshot.judges`.

---

## 🧩 D8 – Athlete Slot Seeding
**File:** `pages/event_admin.html`  `L284-L295`  
**Goal:** Auto-populate `slots[]` from `athletes_<cid>` when creating heats.  
**QC:** Every new heat contains athlete IDs; no empty `slots` arrays.

---

## 🧩 D9 – Judges Mismatch Badge (Verified)
**File:** `pages/run_console.html`  `L420-L452`  
**Goal:** Retain existing non-blocking mismatch badge; verify persistence across reloads.  
**QC:** Badge appears only when preset judge ≠ panel count.

---

## 🧩 D10 – Preset-Based Scoring Flow
**File:** `pages/run_console.html`  `L420-L452`  
**Goal:** Bind scoring calculation and display to preset snapshot values.  
**QC:** Manual toggles disabled when preset field exists; computed totals reflect preset structure.

---

### ✅ Batch Summary
| Status | Count |
|:--|--:|
| New Implementation | 8 |
| Verification Only | 1 (D9) |
| Integration Refactor | 1 (D6) |

**Next Stage:** Run *Tower-Control : Phase D Implementation Loop #1*  
(Command triggers Codex build across D1–D10.)

---
