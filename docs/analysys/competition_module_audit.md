# 🏁 XGAMES ARENA — Competition Module Audit

**Scope:** `modules/competition/` — `setup.html`, `setup_new.html`, `control.html`, `display.html`, `leaderboard.html`

---

## 🔷 Overview
This module covers the **competition lifecycle** from draft creation → validation → approval & activation → linking athletes → running events → broadcast surfaces.

**Key Local Stores (Data Contracts):**
- `arena_competitions_setup` (array) — staging records for competitions
- `competitions_active` (array) — approved/active competitions (index)
- `events_<CID>` (array) — events/categories for a competition
- `judges_<CID>` (obj) — panel definition `{ panelSize, roles[] }`
- `scoring_<CID>` (obj) — criteria `{ criteria:[{key,label,weight}] }`
- `display_<CID>` (obj) — public display config `{ publicTitle, slug, showStartList, showLive }`
- `officials_<CID>` (array) — officials assigned
- `athletes_<CID>` (array) — roster (AIDs)
- `athletes_aid_cursor_<CID>` (num) — AID counter for that competition
- `heats_<CID>_<EID>` (obj) — heat template shell `{ defaultSize, seeding, advancement, heats:[] }`
- `athletes_master` (array) — federation‑approved athletes (global)
- `active_fid` (string) — current federation scope
- `athletes_tick_<CID>` / `tickAthletesMaster` (string) — change ticks for UIs/listeners

---

## 1) `setup.html` — Competition Setup List
**Purpose:** Manage competitions in **staging** (draft/pending/approved) and navigate to create/edit/run.

### UI & Features
- Filters: by Status (All/Draft/Pending/Approved)
- Sorts: Updated, Date, Name (asc/desc)
- Search: by **Name/CID**
- Table Columns: Competition (name + CID), Date, Venue, Status, **Completion %**, Last Updated, Actions
- Actions:
  - **Edit** → `setup_new.html?cid=<CID>`
  - **Run** → `pages/run_console.html?cid=<CID>&eid=default&heat=1`

### Logic Summary
- Loads `arena_competitions_setup` → normalizes minimal fields per row
- Computes **Completion %** with required keys: `name, date, venue, tz, categories, judges, scoring`
- Applies filter/sort/search and renders table

**Status:** ✅ Stable list view; read‑only against staging store.

---

## 2) `setup_new.html` — Create/Edit Competition
**Purpose:** **Primary composer** for a competition record across identity, schedule, events, judging, heats, officials, athletes, and publishing.

### UI Sections
1. **Identity** — CID (auto), Name, Federation (+ hidden FID), Status
2. **Schedule & Venue** — Start/End, Timezone, Venue, City, Country
3. **Events / Categories** — name/class/gender + table
4. **Judging & Criteria** — panel size, criteria list (weights must total **100**)
5. **Heats Template** — default heat size, seeding, advancement
6. **Officials** — role, name, contact
7. **Athletes (Manual)** — name, nation/club, category (optional)
8. **Policies & Publishing** — tie‑break/safety/public title/slug/show start list/show live
9. **Validation Messages** & **Badges** — CID, % complete, status

**Primary Buttons:** 💾 Save Draft · ✅ Validate · 🚀 Approve & Activate

### Core Model
```js
model = {
  cid, name, federation, status: 'Draft',
  schedule: { startDate, endDate, timezone, venue, city, country },
  events: [{ eid, name, class, gender }],
  judging: { panelSize, roles:[], criteria:[{ key,label,weight }] },
  heatsTemplate: { heatSize, seeding, advancement },
  officials: [{ role,name,contact }],
  athletes: [{ aid?, nsid?, name, nation, club, category }],
  policies: { tiebreak, safety, notes },
  publishing: { publicTitle, slug, showStartList, showLive },
  meta: { createdAt, updatedAt, createdBy }
}
```

### Draft Save
- `upsertSetup(model)` → writes/updates the record in `arena_competitions_setup`

### Validate
- Checks required fields and **criteria weight sum == 100**
- Updates badges and message area

### Approve & Activate (Promotion)
On success:
1) Write **Active Index**: `competitions_active.push({ cid, name, startDate, endDate, venue, city, country, timezone, publicTitle, slug, status:'Active', approvedAt })`
2) Write **Events**: `events_<CID>` (array)
3) Write **Judges Panel**: `judges_<CID> = { panelSize, roles[] }`
4) Write **Scoring**: `scoring_<CID> = { criteria }`
5) Write **Display Config**: `display_<CID> = { publicTitle, slug, showStartList, showLive }`
6) Write **Officials**: `officials_<CID>`
7) **Roster Merge** (Manual → Roster):
   - Loads existing `athletes_<CID>` (if any)
   - Generates `AID` via `athletes_aid_cursor_<CID>` when needed
   - De‑dupes by **NSID** (preferred) or **name+club** fallback
   - Writes merged roster to `athletes_<CID>` and bumps `athletes_tick_<CID>`
8) **Heats Shells**: For each event, writes `heats_<CID>_<EID>` with `{ defaultSize, seeding, advancement, heats: [] }`
9) Updates staging record status → `Approved` and persists

### Federation Scope (FID)
- Hidden `#fid` linked to `Federation` field; **priority order**: `?fid` param → `active_fid` → acronym derived from federation name
- Populates **FID Selector** from `athletes_master` unique FIDs and syncs `active_fid`

### L9 Roster Linker (Approved → Roster)
- **Counts**: master vs roster
- **Search** (federation‑scoped) across `name/nsid/club`
- **Add/Remove** actions enabled (Step 4B)
- Exposes internals on `window.__L9_GETTERS` and `window.__L9_RENDER` for reuse
- Privacy rule: **no national_id** copied into roster

**Status:** ✅ Production‑grade local composer; promotion path prepares all stores used by Run/TV.

---

## 3) `control.html` — Competition Control (Skeleton)
**Purpose:** Lightweight router for existing run/display pages with **param passthrough**.

### Behavior
- Reads `cid/eid/heat` from URL → shows context in header
- Autowires all links (with `data-base`) to **append the same querystring** so downstream pages open in the same competition context
- Quick links:
  - Run: Heat Select, Run Console
  - Displays: Display Centre, Scoreboard, Leaderboard, Intro Screen

**Status:** ✅ Useful shell for on‑site control; relies on existing pages for full functionality.

---

## 4) `display.html` — Display Centre (Competition‑scoped)
**Purpose:** Placeholder public/live results hub (competition context). Loads shared libs, minimal scaffold.

**Status:** ⚙️ Placeholder; integrate with `display_<CID>`, `leaderboard_<CID>_<EID>`, and `reveal` to mirror the TV pages.

---

## 5) `leaderboard.html` — Competition Leaderboard (Competition‑scoped)
**Purpose:** Placeholder final ranking page (competition context). Loads shared libs, minimal scaffold.

**Status:** ⚙️ Placeholder; to be wired against `leaderboard_<CID>_<EID>` and `athletes_<CID>` for name mapping.

---

## 🔌 Cross‑Module Wiring
- **Run Console** consumes: `events_<CID>`, `judges_<CID>`, `scoring_<CID>`, `athletes_<CID>`, `heats_<CID>_<EID>`
- **Judge** reads `scoring_<CID>` and writes `judge_status` packets
- **TV Display/Scoreboard** read `display_control_*`, `reveal`, `leaderboard_<CID>_<EID>`
- **Control** page forwards `?cid&eid&heat` to all run/display endpoints

---

## ✅ Completeness & Risks
**What works now (Local‑first):**
- Draft→Validate→Approve pipeline; promotion writes all downstream stores
- Roster linking with federation scope and privacy guarantees
- Heats shell generation for each event
- Control shell preserving context across run/display

**Gaps to close:**
- Cloud sync (Firestore) & multi‑user auth/roles
- Public pages (`display.html`, `leaderboard.html`) need real data renders
- Stronger validation (date ranges, slug uniqueness), and audit logs

---

## 📌 Quick QA Checklist (Competition Module)
- [ ] Create competition, fill all required fields → **Validate = OK**
- [ ] Approve & Activate → all stores (`events_`, `scoring_`, `judges_`, `display_`, `officials_`, `athletes_`, `heats_`) exist
- [ ] Roster merge: manual athletes de‑duped and assigned AIDs; `athletes_tick_<CID>` bumped
- [ ] Control links keep `cid/eid/heat` across pages
- [ ] Run Console can start with newly approved competition
- [ ] TV pages reflect leaderboard/reveal once wired

