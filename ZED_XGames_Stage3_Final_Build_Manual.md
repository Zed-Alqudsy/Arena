# 🧩 ZED XGames Pilot — Final Build Manual (Stage 3)

> **Objective**  
> Build a *functioning but lean* pilot platform demonstrating the end-to-end flow from the Pre‑Build Manual: **NSID → Event Entry → Competition Setup → Run & Scoring → Displays.**  
> No unnecessary complexity; every module must run cleanly offline. This manual is **not code** — it defines *what* to build and *how* to validate.

---

## 1) Build Philosophy
- Prioritise **flow completion**, not feature depth.
- Keep logic **configurable** (no hard‑coded judge counts, criteria, heats).
- After **Activate Competition** → configuration is locked.
- All screens must load **offline**, syncing via `localStorage` + `SyncLocal` events.

---

## 2) Pilot Modules & Status (from Stage‑2 comparison)

| Platform | Module | Current Status | Required Action |
|---|---|---|---|
| A | NSID Registration | Missing | Build minimal NSID creator + approver |
| A | Event Registration | Missing | Build entry form linking NSID → Competition/Discipline |
| B | Competition Centre | OK (pilot) | No change |
| B | Setup Wizard | Partial | Add **Heats & Progression** step; import entries from A |
| B | Run Home / Run Lite | Missing | Build unified **Run Lite** panel (single heat control) |
| B | Judging Logic | Partial | Make **criteria & judge count** dynamic; centralise drop rules |
| B | Publish & Display | OK (pilot) | Keep; verify key sync (Display Centre ↔ TVs) |

---

## 3) Build Sequence (Execution Order)

### Step 1 — Platform A Bootstrap
**Goal:** Provide the upstream data for Platform B without over‑engineering.
1. **NSID Form:** create/edit athlete profile; store in `localStorage` → `xg_nsids_v1`.
2. **Approval List:** federation toggles status → *approved/pending*.
3. **Event Entry:** approved NSIDs choose **Competition ID (CID)** + **Discipline** → save to `xg_entries_v1`.
4. **QC Guard:** prevent duplicate entries per event/division.

### Step 2 — Competition Centre (Setup)
**Goal:** Convert entries and rules into a locked competition manifest.
1. Reuse existing Centre UI (Details, People, Events, Rounds, QC).
2. Add **Heats & Progression**:
   - **Heat size** (3–6 athletes).
   - **Rounds** (QF → SF → Final, or Heats → Final).
   - **Top‑N advancement** per round (note + simple rule).
3. **Auto‑import** entries from `xg_entries_v1` into the selected `CID`.
4. **Activate** locks: judging rules, criteria, judge count, and entries.

### Step 3 — Run Lite (Single Heat Control)
**Goal:** Operate one heat cleanly from staging to publish.
1. Panel shows current **Event / Round / Heat** and **athlete order**.
2. Controls: **Stage → Start → Stop → Close Heat → Publish**.
3. Judges open their **Judge Panel** (separate tab); **Lock & Submit** per athlete.
4. When all judges are locked → **aggregate** → emit `leaderboard:update` (local broadcast).

### Step 4 — Judging Logic (Shared Config)
**Goal:** One source of truth for criteria and judge count per discipline.
- Define per‑discipline config (examples for pilot — values adjustable during setup):

```json
{
  "inline_freestyle": { "criteria": ["technique", "variety", "cleanliness"], "judgeCount": 5, "drop": "high_low", "decimals": 2 },
  "skateboard_park": { "criteria": ["difficulty", "execution", "flow"], "judgeCount": 5, "drop": "high_low", "decimals": 2 },
  "skatecross": { "criteria": ["speed", "style", "control"], "judgeCount": 3, "drop": "none", "decimals": 2 }
}
```
- **UI derives** judge inputs and scoreboard tiles from this config.
- **Centralise** drop‑rule + average in one place (no duplicated snippets).

### Step 5 — Display Layer
**Goal:** Keep simple & safe for pilot broadcast.
- Keep existing pages: `display_centre`, `live`, `scoreboard`, `leaderboard`, `intro`.
- **Unify key naming** (e.g., one channel `display_control`) or consistently use L1/L2 across all pages.
- **Panic** always forces a safe default (Scoreboard).
- Leaderboard/Scoreboard should **auto‑refresh** from local broadcast/cache.

---

## 4) QC Checklist (Pilot Gate)

| Area | Must Pass Condition |
|---|---|
| Data Consistency | NSID, Entries, Competitions persist and reload without corruption |
| Flow Integrity | **NSID → Event Entry → Setup → Run Lite → Publish/Display** completes without manual injection |
| Offline Mode | All tabs communicate via `SyncLocal` (no network dependency) |
| Flexibility | Changing **judge count** and **criteria** does **not** break UI |
| Lock Mechanism | After **Activate**, setup fields become read‑only |
| Display Fail‑Safe | **Panic** reliably returns all displays to **Scoreboard** |

---

## 5) Pilot Deliverables
1. **Working Demo:** end‑to‑end local pilot (multi‑tab: Admin, Judge, Display).  
2. **QC Report (JSON):** pass/fail for each checklist item above.  
3. **Final Blueprint:** items to scale for production (post‑pilot).

---

### Notes
- This document follows the Stage‑1 Pre‑Build Manual strictly: no code, minimum scope, flow‑first.  
- All values (criteria, judge counts, advancement) remain **configurable** and **lockable** after activation.

