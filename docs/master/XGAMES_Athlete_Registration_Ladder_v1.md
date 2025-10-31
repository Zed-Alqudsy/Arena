# XGAMES — Athlete & Competition Registration Ladder (Federation-Ready)

This document is the master reference for the NSID-style **Athlete Registration + Competition Entry** pipeline. It is designed to be pasted into any new thread so continuity is preserved.

---

## L0 — Ground Rules (no code yet)

### Keys & IDs
- **Federations (global):** `federations_master` → `[{ fid, name, country, contact }]`
- **Athletes (global staging/master):**
  - `athletes_staging` → `[{ nsid, fid, name, nation, state, district, dob, age, sex, club, contact, createdAt }]`
  - `athletes_master` → `[{ ...above, approvedAt }]` *(unique by `nsid`)*
- **Competition entry (per CID):**
  - `entries_staging_<CID>` → `[{ nsid, category, note, createdAt }]`
  - `athletes_<CID>` → `[{ aid, nsid, name, nation, state, district, sex, club, category }]` *(consumed by RUN/TV)*
  - `athletes_aid_cursor_<CID>` → `number` *(A1, A2, …)*
- **Ticks:** `athletes_master_tick`, `athletes_tick_<CID>`

### Rules
- **AID assignment:** at **competition approval** (not global registration).
- **De-dupe:**
  - `nsid` is unique in `athletes_master`
  - (`nsid`,`CID`) is unique in `entries_staging_<CID>`
  - `nsid` is unique in `athletes_<CID>`
- **Age:** store `dob` (ISO) and **compute** `age` on submit/read.
- **Sex enum:** `M` or `F`.
- **No changes** to existing RUN/TV keys; we only **add** layers.

### DoD (L0)
- Keys documented in `04_STORAGE_KEYS.md`
- Shapes documented in `03_DATA_CONTRACTS.md`

---

## L1 — Helpers (shared)

**Files:** `shared/state.js`, `shared/core.js`

Add:
- `getJSON(key, fallback = null)`
- `setJSON(key, value)`
- `pushUnique(key, item, uniqFn)` *(prevents duplicates)*
- `bumpTick(key)` → `localStorage[key] = Date.now()`
- `computeAge(dobISO)` → integer

**DoD:**
- Helpers callable from Console; no side effects.

---

## L2 — Athlete Self-Registration (public)

**File:** `modules/athlete/register.html`

**Fields:** `nsid`, `name`, `nation`, `state`, `district`, `dob` → auto `age`, `sex (M/F)`, `club`, `contact` (+ optional photo).

**On submit:**
- Validate requireds; `sex ∈ {M, F}`; `dob` ISO.
- Compute `age`.
- Reject if `nsid ∈ athletes_master ∪ athletes_staging`.
- Append to `athletes_staging`.
- `bumpTick('athletes_master_tick')`.

**DoD:**
1) Exactly one record appears in `athletes_staging`.
2) Refresh does not double-post.
3) Age computed; `sex` stored as `M`/`F`.

---

## L3 — Admin Key-In (same staging)

**File:** `modules/federation/approve_athletes.html`

- Add compact “Add Athlete” form (same fields as L2).
- On submit → write to `athletes_staging` with same guards.

**DoD:**
- Admin can add an athlete; appears in staging; no dupes by `nsid`.

---

## L4 — Federation Approval → Master

**File:** `modules/federation/approve_athletes.html`

- List `athletes_staging` (checkboxes).
- **Approve:** move selected to `athletes_master`; remove from staging; `bumpTick('athletes_master_tick')`.
- **Reject:** remove from staging (optional).
- Guard: if `nsid` already in master, skip.

**DoD:**
1) Approve moves items staging → master.
2) Re-approve blocked by `nsid`.
3) Tick updated.

---

## L5 — Competition Join (Self-Service Link)

**File:** `modules/athlete/join.html?cid=<CID>`

**Inputs:** `nsid`, `category`, `note (opt)`

**On submit:**
- Require `nsid ∈ athletes_master`.
- De-dupe (`nsid`,`CID`) in `entries_staging_<CID>`.
- Push `{ nsid, category, note, createdAt }` to `entries_staging_<CID>`.

**DoD:**
1) Valid NSID → one entry in `entries_staging_<CID>`.
2) Duplicate blocked.
3) Invalid NSID prompts to register.

---

## L6 — Competition Join (Admin Key-In)

**File:** `modules/federation/approve_entries.html?cid=<CID>`

**Modes:**
- **Search-select** from `athletes_master` (filter by name/nsid/fid/state/district/sex).
- **Paste NSID** (validated against master).

**On add:** write to `entries_staging_<CID>` with de-dupe.

**DoD:**
1) Admin can add via select or NSID; appears in staging.
2) Duplicate blocked.

---

## L7 — Approve Entries → Publish to `athletes_<CID>`

**File:** `modules/federation/approve_entries.html?cid=<CID>`

**Approve selected:**
- Ensure `athletes_aid_cursor_<CID>` exists (init = 1 if missing).
- Assign `aid = 'A' + cursor`; increment cursor.
- Join from `athletes_master` by `nsid`; write:
  `{ aid, nsid, name, nation, state, district, sex, club, category }`
  into `athletes_<CID>`.
- Remove from `entries_staging_<CID>`.
- `bumpTick('athletes_tick_<CID>')`.

**Guards:**
- If `nsid` already present in `athletes_<CID>`, skip.

**DoD:**
1) Entry disappears from staging and appears in `athletes_<CID>`.
2) AIDs increment A1, A2, … without gaps (except skipped approvals).
3) RUN/TV immediately reflect (no code change needed).

---

## L8 — Federation Layer (multi-federation)

**Files:** `modules/federation/*`, `modules/athlete/register.html`

- Add **FID** selection/assignment at registration.
- Store `fid` in staging/master.
- Optional: Federation Admin page to manage `federations_master`.
- Filter lists by `fid` where relevant.

**DoD:**
- Lists filter by federation; storage contracts unchanged elsewhere.

---

## L9 — Lists, Search, BM/EN Labels

**Files:** `shared/ui.js`, relevant pages

- Athlete lists: quick search by name/nsid; chips for state/district/sex.
- BM/EN labels for state/district/sex; keep canonical values in storage.

**DoD:**
- Searches return expected rows; label switching does not mutate data.

---

## L10 — Integrity & QA Suite

**Checks (Console or admin page):**
- No duplicate `nsid` in `athletes_master`.
- No duplicate (`nsid`,`CID`) in `entries_staging_<CID>`.
- No duplicate `nsid` in `athletes_<CID>`.
- All entries in `entries_staging_<CID>` have `nsid ∈ athletes_master`.

**Round-trip smoke:**
1) L2 self-register → L4 approve.
2) L5 join → L7 approve → visible in Run Console.

**DoD:** All checks pass; RUN/TV unaffected.

---

## L11 — Logging & Ticks

- On each write to `athletes_master` / `entries_staging_<CID>` / `athletes_<CID>`, call `bumpTick`.
- Optional: append to `activity_log` with `{ ts, actor, action, key, details }`.

**DoD:** Polling UIs refresh; logs show actions.

---

## L12 — Export/Backup

- Export buttons for:
  - `athletes_master` (CSV/JSON)
  - `athletes_<CID>` (CSV/JSON)

**DoD:** Downloads match shapes above.

---

## Deliverables per Step (upload list)

- Always include latest: `shared/state.js`, `shared/core.js`, `shared/ui.js`
- L2: `modules/athlete/register.html`
- L3–L4: `modules/federation/approve_athletes.html`
- L5: `modules/athlete/join.html`
- L6–L7: `modules/federation/approve_entries.html`
- L8 (optional): `modules/federation/index.html`
- Docs to update each time: `03_DATA_CONTRACTS.md`, `04_STORAGE_KEYS.md`, master log

---

## Execution Order (fastest path)

1) **L1 → L2 → L4** (helpers, self-reg, approve to master)  
2) **L5 → L6 → L7** (join + admin add + approve/publish)  
3) **L8 → L9 → L10** (federation filter, UX, QA)  
4) **L11–L12** (ticks, export)

---

## Guardrails (won’t break RUN/TV)

- **Never change** RUN/TV key shapes.
- **Only add** staging/master/approval layers that ultimately publish to `athletes_<CID>`.
