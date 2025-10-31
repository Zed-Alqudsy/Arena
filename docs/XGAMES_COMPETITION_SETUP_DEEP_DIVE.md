# XGAMES — Competition Setup Deep Dive (setup.html & setup_new.html)

**Scope:** This document maps **exactly** what your two working pages do today, how they wire to storage, and how they connect to the rest of the platform. It also captures the **current file map** so a new thread/dev can pick up instantly.

---

## 0) Current File Map (from your machine)
```
.
├── ZED_XGames_PreBuild_Manual.md
├── ZED_XGames_Stage3_Final_Build_Manual.md
├── ZED_XGames_Stage4_Implementation_Plan.md
├── core/
│   ├── core_repo.js
│   └── core_routes.js
├── docs/
│   ├── 00_INIT_README_FIRST.md
│   ├── 00_MASTER_INDEX.md
│   ├── 01_ARCH_MAP.md
│   ├── 02_WIRING_PLAN.md
│   ├── 03_DATA_CONTRACTS.md
│   ├── 04_STORAGE_KEYS.md
│   ├── 05_REUSE_MATRIX.md
│   ├── 10_ATHLETE_PLAYBOOK.md
│   ├── 11_FEDERATION_PLAYBOOK.md
│   ├── 12_COMPETITION_PLAYBOOK.md
│   ├── 13_JUDGE_PLAYBOOK.md
│   ├── 14_DISPLAYS_PLAYBOOK.md
│   ├── 90_RUNBOOK.md
│   └── docs.zip
├── index.html                 # (Run/Control dashboard candidate shell)
├── modules/
│   ├── athlete/
│   │   ├── home.html
│   │   ├── join.html
│   │   └── register.html
│   ├── competition/
│   │   ├── control.html
│   │   ├── display.html
│   │   ├── leaderboard.html
│   │   ├── setup.html        # ← Parent list (working)
│   │   └── setup_new.html    # ← Create/Edit (working)
│   ├── federation/
│   │   ├── approve_athletes.html
│   │   └── approve_entries.html
│   └── master/
│       ├── competition_legacy.html
│       └── home.html
├── pages/
│   ├── competition_home.html
│   ├── competition_list.html
│   ├── competition_new.html
│   ├── event_admin.html
│   ├── heat_select.html
│   └── run_console.html      # ← Heat-level shell (links from Setup)
├── shared/
│   ├── core.js
│   ├── lang.js
│   ├── state.js
│   └── ui.js
└── styles.css
```
> **Reality check:** Only **`modules/competition/setup.html`** and **`modules/competition/setup_new.html`** are fully functional today. `pages/run_console.html` is a shell that opens with `?cid=&eid=&heat=`.

---

## 1) Page Roles (today)

### A) `modules/competition/setup_new.html` — **Create / Edit Competition**
- Purpose: Collect identity, schedule/venue, events, judging rules, officials, athletes, policies/publishing; **Save Draft**, **Validate**, **Approve & Activate**.
- Key UI elements: header badges (CID, % complete, status), cards for **Identity**, **Schedule & Venue**, **Events**, **Judging**, **Officials**, **Athletes**, **Policies & Publishing**, plus status message area.
- Buttons (top bar):
  - **Back** → returns to parent list.
  - **💾 Save Draft** (`#btnSave`) → upserts the draft to staging list.
  - **✅ Validate** (`#btnValidate`) → checks required fields and criteria sum to 100.
  - **🚀 Approve & Activate** (`#btnApprove`) → promotes data for Run/Display modules.

### B) `modules/competition/setup.html` — **Parent List / Manager**
- Purpose: Read all staged competitions and **display normalized rows** with progress %, sorting & filtering, and **actions** (Edit / Run).
- Table columns: Name, Date, Venue, Status, Completion %, Updated, Actions.
- Actions:
  - **Edit** → opens `setup_new.html?cid=...` for that draft.
  - **Run** → opens `../../pages/run_console.html?cid=...&eid=default&heat=1` (so the shell won’t redirect).

---

## 2) Exact Storage & Data Contracts

### 2.1 Staging Store (drafts)
- **Key:** `arena_competitions_setup`  
- **Shape:** Array of full objects; nested structures used by the form:  
  - `model.schedule.startDate|endDate|timezone|venue|city|country`
  - `model.events[]` (with generated `eid` or `name` used as id)
  - `model.judging.panelSize|criteria[]|roles[]`
  - `model.officials[]`
  - `model.athletes[]`
  - `model.publishing.publicTitle|slug|showStartList|showLive`
  - `model.meta.updatedAt`
- **Writers/Readers:**
  - `loadSetupList()`, `saveSetupList()`, `upsertSetup(rec)`, `getSetup(cid)`

### 2.2 Active Index (approved competitions)
- **Key:** `competitions_active`
- **Entry:** `{ cid, name, startDate, endDate, venue, city, country, timezone, publicTitle, slug, status: 'Active', approvedAt }`

### 2.3 Per‑CID blobs (written on Approve)
- `events_<CID>` → array of events.
- `judges_<CID>` → `{ panelSize, roles[] }` (criteria are NOT copied here by default).
- `athletes_<CID>` → array of registered athletes.
- `heats_<CID>_<EID>` → **heat shell** per event: `{ defaultSize, seeding, advancement, heats: [] }`.

> **Note:** If needed for Judge/Run scoring, add `scoring_<CID> = { criteria: [...] }` during Approve (a simple one-liner right after `writeJudges`).

---

## 3) Button Behaviour (ground truth)

### 3.1 Save Draft (writes staging only)
- Click **💾 Save Draft** → reads the form into `model`, sets/updates `model.cid`, then `upsertSetup(model)` → writes to `arena_competitions_setup`.
- Parent list reads this on page load/refresh and shows the record.

### 3.2 Validate (no writes, just message)
- Ensures **Name**, **Dates**, **Timezone**, **Venue**, **≥1 Event**, **Panel Size > 0**, and **criteria weights sum = 100**.
- Shows red/green message and updates header badges.

### 3.3 Approve & Activate (promotion + finalize staging)
- Validates again; if OK, builds the active index entry and writes:  
  - `competitions_active` (append or replace)  
  - `events_<CID>`, `judges_<CID>`, `athletes_<CID>`, `heats_<CID>_<EID>` shells  
- Marks `model.status = 'Approved'`, stamps `meta.updatedAt`, **upserts back into staging** so the list shows “Approved”.

---

## 4) What the Parent List Normalizes

When `setup.html` loads the staging array, each record is **normalized** into a flat table row:

- `name` ← `model.name`  
- `date` ← `schedule.startDate → endDate` (or single start)  
- `venue` ← `schedule.venue`  
- `tz` ← `schedule.timezone`  
- `categories` ← `events[]` (count displayed)  
- `judges` ← **either** panel size placeholders or roles list  
- `scoring` ← present if there are criteria defined  
- `updatedAt` ← from `model.meta.updatedAt` (fallbacks supported)

Completion % is computed from these fields to display progress.

---

## 5) Proven Link to Run Console

- The **Run** button in `setup.html` opens:  
  `../../pages/run_console.html?cid=<CID>&eid=default&heat=1`  
  This satisfies Run Console’s current requirement to have all three params present so it **doesn’t redirect**.
- Run Console (today) simply displays the params and pulls counts:
  - `athletes.length` from `athletes_<CID>`
  - `judges.length` from `judges_<CID>`

---

## 6) Known Gaps (now)

1) **Scoring criteria not published** to a per‑CID key (needed for Judge/Run).  
   - Quick remedy for later: write `scoring_<CID>` on Approve.
2) **Display flags** (`showStartList`, `showLive`) aren’t copied to an active blob.  
   - Option: write `display_<CID>` with flags for Display Centre to read.
3) **Heats are shells** (no athlete assignment yet).  
   - Control Room will generate heats (size/seeding/advancement) and write back into each `heats_<CID>_<EID>.heats`.
4) **Athlete import** from Registration isn’t wired (manual add only).  
   - Later: copy from a registry key into `athletes_<CID>`.
5) **Run Console** is a shell; we still need Run Home (competition view) and real heat control.

---

## 7) How These Two Pages Anchor the Whole System

- **Setup New** is the **single source of truth** for the competition blueprint.  
- **Setup (list)** is the **ops dashboard for drafts**; it also provides the **entry into RUN**.  
- The **Approve** step is the **publish gate**, producing all per‑CID data the rest of the platform consumes.

---

## 8) Minimal Contracts for Next Pages (so we don’t break Setup)

- **Run Home** should only **read**: `competitions_active`, `events_<CID>`, `heats_<CID>_<EID>`  
- **Run Console** should read: `athletes_<CID>`, `judges_<CID>`, `heats_<CID>_<EID>`, and (if added) `scoring_<CID>`  
- **Display Centre** reads: `scores_<CID>_<EID>_<HEAT>` and `active_heat`  
- **Judge View** writes: `scores_<CID>_<EID>_<HEAT>`

> No page other than Setup should **modify** the staging array `arena_competitions_setup`.

---

## 9) Citations (key code lines)

- Top-bar buttons & purpose in **Setup New**: lines **112–116**. fileciteturn7file0L110-L116  
- Form sections (Identity, Schedule & Venue, etc.) exist and are wired with IDs (e.g., `f_name`, `f_start`, `f_tz`, `f_venue`). fileciteturn7file3L56-L83  
- Storage helpers and upsert logic. fileciteturn7file4L41-L62  
- Writers for active index, events, judges, athletes, heats templates. fileciteturn7file5L46-L72  
- Validation rules and completion %. fileciteturn7file8L20-L30 fileciteturn7file8L38-L50  
- Approve & Activate promotion (full block). fileciteturn7file9L12-L45  
- Parent list: normalization mapping & fields. fileciteturn7file10L62-L84  
- Completion % in parent list. fileciteturn7file11L35-L47

---

## 10) “What to Remember” (for new threads)
- **Only two working pages** today: `setup.html`, `setup_new.html` (both under `/modules/competition`).  
- **Approve** is the **only** action that publishes to the per‑CID keys used by RUN/DISPLAY.  
- Run Console is a shell — it **expects** `?cid=&eid=&heat=` and can already display basic counts.
- Next build item is **Run Home** (competition-level status page), but Setup will **not** change its data contract.

---

**End of document.**
