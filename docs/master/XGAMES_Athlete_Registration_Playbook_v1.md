# XGAMES — Athlete & Competition Registration **Playbook** (Log + Contracts + Code)

**Date:** 2025-10-21  
**Scope:** Malaysia Skate Federation (MSF) first; **multi-federation ready**.  
**Pair this with:** your “Ladder” doc (steps L0–L12).  
**Goal of this doc:** ZERO ambiguity. Every page/key/shape/helper defined here.

---

## 0) System Principles (non-negotiable)

- **Don’t break RUN/TV.** Consumer roster key stays `athletes_<CID>` (shape below).
- **Publish via approval.** Public keys get data only through staging → approval → publish flow.
- **Federation-ready.** Every athlete has a `fid` (e.g., `MSF`).
- **Public vs Private IDs.**  
  - Public = **NSID** (our federation athlete ID).  
  - Private = **`national_id`** (IC/Passport). Never published to per-CID keys.
- **Deterministic storage keys.** All keys are listed below; no hidden writes.
- **Normalize on approval.** Nation, casing, and NSID format are fixed when approving.

---

## 1) Glossary & IDs

- **CID** — Competition ID (string). All per-competition keys suffix with `<CID>`.
- **NSID** — Federation athlete ID (public).  
  **Format:** `NSID-<FID>-<YYYY>-<#####>` (e.g., `NSID-MSF-2025-00001`).
- **FID** — Federation code, uppercase 2–8 letters (e.g., `MSF`).
- **AID** — Competition-local athlete ID (`A1`, `A2`, …), assigned at **competition entry approval**.
- **national_id** — IC/Passport (private); stored only in federation stores.

---

## 2) Storage Keys (Canonical)

### Global (federation scope)

- `federations_master` → `[{ fid, name, country, contact }]`
- `athletes_staging` → pending registrations (self-reg + admin approvals read from here)
- `athletes_master` → federation-approved registry
- `athletes_rejected` → archive of rejected registrations
- `athletes_master_tick` → ms timestamp (UI refresh hint)

**NSID cursor (per federation)**  
- `nsid_cursor_<FID>` → integer sequence used to auto-generate NSIDs

### Per competition (CID)

- `entries_staging_<CID>` → pending competition entries `[{ nsid, category, note, createdAt }]`
- `athletes_aid_cursor_<CID>` → integer sequence for `A1`, `A2`, …
- `athletes_<CID>` → **published** competition roster (RUN/TV consumer; shape below)
- `athletes_tick_<CID>` → ms timestamp (UI refresh hint for per-CID lists)

> **Contract:** RUN/TV only **reads** `athletes_<CID>`. We must not change that shape without a migration.

---

## 3) Data Contracts (exact shapes)

### 3.1 `athletes_staging` (pending; written by registration)

```jsonc
[{
  "nsid": "NSID-MSF-2025-00001",   // may be blank on submit; fixed on approval
  "fid": "MSF",
  "name": "Ali Bin Ahmad",
  "nation": "Malaysia",            // normalized to "MAS" on approval
  "state": "Selangor",
  "district": "Petaling",
  "dob": "1975-08-10",
  "age": 50,                       // computed; may be recomputed on read
  "sex": "M",                      // "M" | "F"
  "club": "Selangor Skate",
  "contact": "+60...",
  "national_id": "900101-14-XXXX", // PRIVATE; never published to per-CID keys
  "createdAt": "2025-10-21T09:09:28.160Z"
}]
```

### 3.2 `athletes_master` (approved federation registry)

```jsonc
[{
  "nsid": "NSID-MSF-2025-00001",
  "fid": "MSF",
  "name": "Ali Bin Ahmad",
  "nation": "MAS",                 // normalized
  "state": "Selangor",
  "district": "Petaling",
  "dob": "1975-08-10",
  "age": 50,
  "sex": "M",
  "club": "Selangor Skate",
  "contact": "+60...",
  "national_id": "900101-14-XXXX", // PRIVATE
  "createdAt": "2025-10-21T09:09:28.160Z",
  "approvedAt": "2025-10-21T10:22:00.000Z",
  "approval_note": "Verified"
}]
```

### 3.3 `athletes_<CID>` (published competition roster; **RUN/TV consumer**)

```jsonc
[{
  "aid": "A1",                     // assigned on competition entry approval
  "nsid": "NSID-MSF-2025-00001",
  "name": "Ali Bin Ahmad",
  "nation": "MAS",
  "state": "Selangor",
  "district": "Petaling",
  "sex": "M",
  "club": "Selangor Skate",
  "category": "Street Open Men"
}]
```

---

## 4) Shared Helper API (`shared/state.js`) — **authoritative**

> **This is exactly what should be in `shared/state.js` (pure JS).**

```js
/* eslint-env browser */
window.State = (() => {
  // ---------- existing helpers (unchanged) ----------
  const getJSON = (k, d) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? d; }
    catch (e) { return d; }
  };
  const setJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const arr = (k) => {
    const v = getJSON(k, []);
    return Array.isArray(v) ? v : [];
  };
  const push = (k, obj) => {
    const a = arr(k);
    a.push(obj);
    setJSON(k, a);
    return a;
  };

  // ---------- NEW helpers (non-breaking) ----------
  // push only if uniqFn(existingItem, newItem) matches none
  const pushUnique = (k, obj, uniqFn) => {
    const a = arr(k);
    const exists = a.some((it) => uniqFn(it, obj));
    if (!exists) {
      a.push(obj);
      setJSON(k, a);
    }
    return a;
  };

  // millisecond tick for UI polling
  const bumpTick = (tickKey) => {
    const ts = Date.now();
    localStorage.setItem(tickKey, String(ts));
    return ts;
  };

  // "YYYY-MM-DD" → integer age
  const computeAge = (dobISO) => {
    const d = new Date(dobISO);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  };

  // ---------- keys (original + federation/entries additions) ----------
  const keys = {
    // existing
    comps: 'competitions',
    events: (cid) => `events_${cid}`,
    athletes: (cid) => `athletes_${cid}`,            // RUN/TV consumer
    judges: (cid) => `judges_${cid}`,
    heats: (cid, eid) => `heats_${cid}_${eid}`,
    rules: 'rules',
    reveal: 'reveal',
    leaderboard: 'leaderboard',
    eventLog: 'eventLog',

    // NEW: federation-ready pipeline
    federationsMaster: 'federations_master',
    athletesStaging: 'athletes_staging',
    athletesMaster: 'athletes_master',
    entriesStaging: (cid) => `entries_staging_${cid}`,
    athletesAidCursor: (cid) => `athletes_aid_cursor_${cid}`,

    // ticks
    tickAthletesMaster: 'athletes_master_tick',
    tickAthletesCID: (cid) => `athletes_tick_${cid}`,
  };

  return {
    getJSON, setJSON, arr, push, keys,
    pushUnique, bumpTick, computeAge,
  };
})();
```

**Read/Write boundaries:**
- Public pages (self-reg, self-join) **write to staging only**.
- Approval pages are the **only writers** to `athletes_master` and `athletes_<CID>`.

---

## 5) Registration Page (`modules/athlete/register.html`) — contract

### Behavior

- Collects athlete data (including **private** `national_id`).
- If **NSID blank** → auto-generate using per-federation cursor:  
  `NSID-<FID>-<YYYY>-<#####>`
- De-dup by NSID across `athletes_staging` + `athletes_master`.
- Writes **one** record to `athletes_staging`.
- Calls `bumpTick('athletes_master_tick')` (so approval UI can auto-refresh).

### Required NSID auto-generation snippet

```js
let nsid = $('nsid').value.trim();
const fid = $('fid').value.trim() || 'MSF';
if (!nsid) {
  const year = String(new Date().getFullYear());
  const CURSOR_KEY = `nsid_cursor_${fid}`;
  const cur = Number(localStorage.getItem(CURSOR_KEY) || '0') + 1;
  localStorage.setItem(CURSOR_KEY, String(cur));
  nsid = `NSID-${fid}-${year}-${String(cur).padStart(5,'0')}`;
  $('nsid').value = nsid;
}
```

---

## 6) Federation Approval (`modules/federation/approve_athletes.html`) — contract

### UI

- **Tabs** with counters: **Pending / Approved / Rejected**.
- **Pending**: table from `athletes_staging` + optional note + Approve/Reject buttons.
- **Approved**: read-only table from `athletes_master`.
- **Rejected**: read-only archive from `athletes_rejected`.

### Actions

**Approve** (staging → master):
- Normalize fields:
  - `fid = upper(fid || 'MSF')`
  - `nsid = ensureNSID(rec)` (auto if missing/invalid)
  - `nation = normalize('MAS')`
  - `state/district = Title Case`
  - `sex = 'M'|'F'`
  - `age = rec.age ?? computeAge(rec.dob)`
- Append to `athletes_master` **iff** NSID not present.
- Remove from `athletes_staging`.
- Set `approvedAt` + carry `approval_note` from inline note input.
- `bumpTick(athletes_master_tick)`.

**Reject** (staging → rejected):
- Move record to `athletes_rejected` with `rejectedAt` + `rejection_note`.
- Remove from `athletes_staging`.

### Inline helpers (authoritative)

```js
const nsidRegex = /^NSID-[A-Z]{2,8}-\d{4}-\d{5}$/;

const ensureNSID = (rec) => {
  let { nsid, fid } = rec;
  fid = (fid || 'MSF').toUpperCase();
  if (nsidRegex.test(nsid || '')) return nsid;
  const year = String(new Date().getFullYear());
  const CURSOR_KEY = `nsid_cursor_${fid}`;
  const cur = Number(localStorage.getItem(CURSOR_KEY) || '0') + 1;
  localStorage.setItem(CURSOR_KEY, String(cur));
  return `NSID-${fid}-${year}-${String(cur).padStart(5,'0')}`;
};

const normalizeNation = (nation) => {
  if (!nation) return 'MAS';
  const n = String(nation).trim();
  return ['malaysia', 'mas'].includes(n.toLowerCase()) ? 'MAS' : n.toUpperCase();
};

const titleCase = (s) => (s || '').replace(/\w\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase());
```

---

## 7) Competition Entry (L5–L7) — **contracts to keep consistent**

> Implement next; defined here to align all threads.

### 7.1 Self-service entry (`modules/athlete/join.html?cid=<CID>`)

- Require `nsid ∈ athletes_master` (block otherwise; link back to register page).
- Write to `entries_staging_<CID>` with:
  ```jsonc
  { "nsid": "...", "category": "…", "note": "…", "createdAt": "…" }
  ```
- De-dup by (`nsid`, `<CID>`) within `entries_staging_<CID>`.

### 7.2 Admin entry (`modules/federation/approve_entries.html?cid=<CID>`)

- Search/select from `athletes_master` (filter by name/nsid/fid/state/district/sex), or paste NSID.
- Writes to `entries_staging_<CID>` with de-dup.

### 7.3 Approve entries → publish `athletes_<CID>`

- Ensure `athletes_aid_cursor_<CID>` exists (init = `1`).
- Approving an entry:
  - Assign `aid = 'A' + cursor`; increment cursor.
  - Join master by `nsid`, then publish to `athletes_<CID>` (shape below):
    ```jsonc
    { "aid": "A1", "nsid": "…", "name": "…", "nation": "MAS",
      "state": "…", "district": "…", "sex": "M", "club": "…", "category": "…" }
    ```
  - Remove entry from `entries_staging_<CID>`.
  - `bumpTick('athletes_tick_<CID>')`.
- **Never include** `national_id` in `athletes_<CID>`.

---

## 8) Consistency Rules (zero ambiguity)

- **Uniqueness**
  - `nsid` is unique in `athletes_master`.
  - (`nsid`, `<CID>`) unique in `entries_staging_<CID>`.
  - `nsid` unique in `athletes_<CID>`.
- **ID assignment**
  - **NSID**: generated at registration if blank; enforced/normalized on approval.
  - **AID**: generated **only** on competition entry approval.
- **Normalization points**
  - Apply at federation approval (L4) and entry approval (L7) — not earlier.
- **Privacy**
  - `national_id` lives only in `athletes_staging` / `athletes_master` (and `athletes_rejected` archive).  
    It never appears in `entries_staging_<CID>` or `athletes_<CID>`.
- **Boundaries**
  - Public/self-service write → **staging**.
  - Admin approval writes → **master** / **published**.

---

## 9) Diagnostics (Console one-liners)

```js
// Global
JSON.parse(localStorage.getItem('athletes_staging'));
JSON.parse(localStorage.getItem('athletes_master'));
JSON.parse(localStorage.getItem('athletes_rejected'));
localStorage.getItem('nsid_cursor_MSF');

// Per-CID (replace CID)
JSON.parse(localStorage.getItem('entries_staging_CID_2025_MY'));
JSON.parse(localStorage.getItem('athletes_CID_2025_MY'));
localStorage.getItem('athletes_aid_cursor_CID_2025_MY');
```

---

## 10) Error Handling & Edge Cases

- **Duplicate NSID on approval:** drop staging item and toast “Already approved earlier.”
- **Invalid DOB:** `computeAge` returns `null` → block submit with clear message.
- **Case variants:** normalize `fid`, `nation`, `sex` to uppercase; Title Case for `state`/`district`.
- **Backfill age:** if missing, compute from `dob` at read/approval.
- **Missing/invalid NSID on staging:** approval auto-generates valid NSID using `fid` + year + cursor.

---

## 11) Minimal UI Expectations

- **Registration:** shows auto-age, allows blank NSID (auto-filled), requires IC (private).
- **Approval:** tabs with counts; Pending supports approve/reject + note; Approved/Rejected read-only.
- **No re-typing by federation.** All athlete details come from staging submission.

---

## 12) What we implemented in this thread (changelog)

- **L1 — Helpers:** Added `pushUnique`, `bumpTick`, `computeAge`; extended `State.keys` with federation + staging/publish keys.
- **L2 — Registration:** Built athlete self-reg page; collects IC privately; auto-generates NSID if blank; writes to `athletes_staging`.
- **L4 — Federation Approval:** Built **tab switcher** (Pending/Approved/Rejected), inline notes, **normalize on approve**, NSID assure, writes to `athletes_master` or `athletes_rejected`. Counts update live.  
  (We **removed** the earlier admin key-in idea — unnecessary.)

---

## Appendix A — Quick Paste Blocks

### A.1 NSID generation (registration)

```js
const year = String(new Date().getFullYear());
const CURSOR_KEY = `nsid_cursor_${fid}`;
const cur = Number(localStorage.getItem(CURSOR_KEY) || '0') + 1;
localStorage.setItem(CURSOR_KEY, String(cur));
const nsid = `NSID-${fid}-${year}-${String(cur).padStart(5,'0')}`;
```

### A.2 AID assignment (entry approval; per-CID)

```js
const C = State.keys.athletesAidCursor(cid);
const next = Number(localStorage.getItem(C) || '0') + 1;
localStorage.setItem(C, String(next));
const aid = `A${next}`; // write into athletes_<CID>
```

### A.3 Publish shape for `athletes_<CID>`

```jsonc
{ "aid": "A1", "nsid": "NSID-MSF-2025-00001", "name": "…", "nation": "MAS",
  "state": "…", "district": "…", "sex": "M", "club": "…", "category": "…" }
```

### A.4 Normalizers (approval time)

```js
const nsidRegex = /^NSID-[A-Z]{2,8}-\d{4}-\d{5}$/;

const normalizeNation = (n) =>
  !n ? 'MAS' :
  (['malaysia', 'mas'].includes(String(n).toLowerCase()) ? 'MAS' : String(n).toUpperCase());

const titleCase = (s) =>
  (s || '').replace(/\w\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase());
```

---

**This is the master playbook for Athlete Registration + Competition Entry.**  
Use it as the source of truth in every new thread so nothing is left to assumption.
