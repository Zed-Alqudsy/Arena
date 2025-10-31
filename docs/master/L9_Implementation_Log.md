# XGAMES ARENA — **L9 Roster Linking: Implementation Log (Full, Authenticated)**
_Last updated: 2025-10-22 10:20:25_


**Scope.** L9 connects **Approved Athletes** (federation-scoped) to a competition roster **from `setup_new.html`**, persisting to `athletes_<CID>` with immediate UI refresh (no page reload) and without copying private fields. This log is based on the uploaded sources:

- `setup_new.html` (contains L9 UI + logic, Approve/Activate flow)
- `shared/state.js` (keys, State helpers)
- `shared/core.js` (param helpers, etc.)
- `shared/ui.js` (toast, UI helpers)

The log is **verified against the uploaded files** and includes the **merge-on-Activate** patch instructions used to prevent roster overwrite.

---

## 1) Objectives & DoD (Definition of Done)

**Goal (L9):**  
From **`setup_new.html`**, allow adding/removing *approved* athletes into the **active competition roster**, then persist that roster to **`athletes_<CID>`** and reflect updates instantly in the page.

### DoD
- ✅ Add/remove from roster in-page (no reload)  
- ✅ Persist to **`athletes_<CID>`**  
- ✅ **No private fields** copied into roster (e.g., omit `national_id`)  
- ✅ **Tick** bumped on write (`athletes_tick_<CID>`) so dependent UIs can refresh  
- ✅ UI counters/tables update immediately  
- ⚠️ **Integration Risk (now resolved):** Legacy **Approve & Activate** flow wrote only manual list → could overwrite L9 roster. We’ve provided and applied a **safe merge** at activation so both sources persist.

**Result:** **L9 Complete** (meets DoD) + **Activation merge fixed**.

---

## 2) Files Touched / Verified

- **`setup_new.html`** — verified to contain:
  - L9 card/UI (dual tables, counters, search) with IDs: `#l9_master_tbody`, `#l9_roster_tbody`, `#l9_count_master`, `#l9_count_roster`, `#l9_search`
  - Hidden federation input: `#fid`
  - Federation selector for testing: `#f_fid_selector`
  - L9 logic blocks:
    - **FID init** and `l9-fid-ready` event
    - **Federation-scoped loaders** (`loadMasterApprovedByFID`, `loadRoster`)
    - **AID cursor** (`nextAid(cid)`) via `athletes_aid_cursor_<CID>`
    - **Writer with tick** (`writeRoster(cid, roster)`) → writes `athletes_<CID>`, bumps `athletes_tick_<CID>`, updates State cache
    - **De-dupe** (`inRoster`): by `nsid`, fallback `name|club`
    - **Mapper** (`mapToRosterItem`) — privacy-safe roster item
    - **Renderer** (`window.__L9_RENDER`) and **Getters** (`window.__L9_GETTERS`) exposed
    - **Actions** (add/remove) using `data-x="l9-add"` / `data-x="l9-rem"`
  - **Approve & Activate** handler (legacy call `writeAthletes(model.cid, model.athletes);` was present). We **replace this one line** with a **merge block** (see §5).

- **`shared/state.js`** — verified keys and helpers used by L9:
  - `keys.athletes(cid) → "athletes_<cid>"`
  - `keys.athletesMaster → "athletes_master"`
  - `keys.athletesAidCursor(cid) → "athletes_aid_cursor_<cid>"`
  - `keys.tickAthletesCID(cid) → "athletes_tick_<cid>"`
  - `State.arr`, `State.setJSON`, `State.bumpTick`

- **`shared/core.js`** — used for `Core.getParam('cid')`

- **`shared/ui.js`** — used for `UI.toast`

---

## 3) Data Contracts & Keys (Canonical)

### 3.1 Competition ID (**CID**)
- **CID** is page-derived (`f_cid`) and/or URL param `?cid=...` (via `Core.getParam('cid')`).  
- Example: `CID_1760864913946`

### 3.2 Stores (LocalStorage) used by L9
- **Master (Approved):** `athletes_master`  
  - Source of truth for approved athletes (federation-scoped).  
  - **No** status filter required if “approved” are already the only records present.
- **Roster (per competition):** `athletes_<CID>`  
  - What Run/TV consumes.
- **Roster tick:** `athletes_tick_<CID>`  
  - Millisecond timestamp; bumped on each roster write for UI refresh.
- **AID sequence (per CID):** `athletes_aid_cursor_<CID>`  
  - Monotonic increasing counter for `aid` issuance; **no renumbering** after deletions.
- **Active federation memory:** `active_fid` (helper; set by selector or derived from federation name)

### 3.3 Roster Item Shape (`athletes_<CID>`)
```json
{
  "aid": "A#",
  "nsid": "NSID-<FID>-YYYY-#####",
  "name": "…",
  "nation": "…",
  "state": "…",
  "district": "…",
  "sex": "…",
  "club": "…",
  "category": "…"   // optional, as provided
}
```
- **Intentionally excluded**: `national_id` or any private fields.

### 3.4 De‑duplication Rule
- **Primary:** same `nsid` (case/trim normalized)  
- **Fallback:** same `name|club` pair (lowercased)  
- Implemented via `inRoster(roster, m)`.

### 3.5 AID Issuance
- `nextAid(cid)` reads & increments `athletes_aid_cursor_<CID>`, returns `"A" + <n>`  
- Keeps AIDs unique per CID; **do not reuse** numbers after deletion.

---

## 4) L9 UI & Runtime Overview (in `setup_new.html`)

### 4.1 UI Elements
- **Counters:** `#l9_count_master`, `#l9_count_roster`  
- **Search:** `#l9_search` (filters master list)  
- **Tables:**  
  - Left (Master): `#l9_master_tbody` with **Add** buttons (`data-x="l9-add"` / `data-nsid="..."`)  
  - Right (Roster): `#l9_roster_tbody` with **Remove** buttons (`data-x="l9-rem"` / `data-aid="..."`)

### 4.2 Federation Scope
- Hidden: `#fid` is set by:
  1. URL `?fid=` → highest priority  
  2. `localStorage.active_fid`  
  3. Derived acronym from `#f_federation` (fallback)  
- Event: `l9-fid-ready` is dispatched after setting `#fid`.
- Optional tester: `#f_fid_selector` populates from unique `fid` values in `athletes_master` and updates `#fid`/`active_fid` on change.

### 4.3 Render Cycle
- **Render function:** `window.__L9_RENDER`  
  - Pulls `cid` via `Core.getParam('cid')`  
  - Loads master via `loadMasterApprovedByFID()` (fid-filtered)  
  - Loads roster via `loadRoster(cid)`  
  - Updates counters and both tables.
- **Actions:** Bound via document click delegation:
  - **Add:** by `nsid` → map to roster item (`mapToRosterItem`) → de‑dupe → `writeRoster` → `__L9_RENDER()`
  - **Remove:** by `aid` → filter → `writeRoster` → `__L9_RENDER()`
- **Search:** live filter on master; re-renders left table only.

### 4.4 Writer Behavior (`writeRoster`)
- Writes **only**:  
  - `athletes_<CID>` (array)
  - `athletes_tick_<CID>` (timestamp)
- Also syncs into `State` cache (`State.setJSON`) and bumps tick (`State.bumpTick`).  
- **Confirmed** it does **not** touch `athletes_master`.

---

## 5) Approve & Activate — **Merge to Prevent Overwrite**

**Where:** In the Approve & Activate handler inside `setup_new.html`, we found the legacy line:
```js
writeAthletes(model.cid, model.athletes);
```
This **overwrites** the competition roster with the **manual** list only (drops L9 picks).

**Fix (applied): Replace that one line** with a **merge block** that:
1. Reads **existing** `athletes_<CID>` (which already includes L9 picks).
2. Reads **manual** list from `model.athletes`.
3. De‑dupes (`nsid` primary, `name|club` fallback).
4. Issues `aid` if missing (using the same cursor rule).
5. Writes back via L9 `writeRoster` (or safe fallback).

**Patch used (drop‑in replacement for the single line):**
```js
// MERGE manual athletes with existing L9 roster (no overwrite)
(function () {
  const G = window.__L9_GETTERS || {};
  const cid = model.cid;

  function nextAidLocal(cid) {
    const k = `athletes_aid_cursor_${cid}`;
    const cur = Number(localStorage.getItem(k) || '0') + 1;
    localStorage.setItem(k, String(cur));
    return 'A' + cur;
  }

  const existing = (G.loadRoster ? G.loadRoster(cid) : (JSON.parse(localStorage.getItem('athletes_' + cid) || '[]') || []));
  const merged = Array.isArray(existing) ? existing.slice() : [];
  const manual = Array.isArray(model.athletes) ? model.athletes : [];

  const inRoster = G.inRoster || function (roster, m) {
    const nsid = (m?.nsid || '').trim();
    if (nsid) return roster.some(r => (r.nsid || '').trim() === nsid);
    const key = ((m?.name || '') + '|' + (m?.club || '')).toLowerCase();
    return roster.some(r => ((r.name || '') + '|' + (r.club || '')).toLowerCase() === key);
  };

  for (const a of manual) {
    if (!inRoster(merged, a)) {
      merged.push({
        aid: (a && a.aid && String(a.aid).trim()) ? String(a.aid).trim() : nextAidLocal(cid),
        nsid: a?.nsid || '',
        name: a?.name || '',
        nation: a?.nation || '',
        state: a?.state || '',
        district: a?.district || '',
        sex: a?.sex || '',
        club: a?.club || '',
        category: a?.category || ''
      });
    }
  }

  if (G.writeRoster) {
    G.writeRoster(cid, merged);
  } else {
    localStorage.setItem('athletes_' + cid, JSON.stringify(merged || []));
    localStorage.setItem('athletes_tick_' + cid, String(Date.now()));
  }
})();
```

This keeps **Ali/DanNy** (L9) and **One/Two/Three/Ali** (manual) together without duplicates.  
**Heats/template writing lines remain unchanged.**

---

## 6) Privacy & Mapping (Reconfirmed)

When adding from master (left table), L9 maps only non‑private fields into roster via `mapToRosterItem(m, cid)`.  
**Never** copy sensitive identifiers (e.g., `national_id`).

---

## 7) Console Recipes (Ops / Debug)

- **List athlete-related keys:**
```js
Object.keys(localStorage).filter(k => k.includes('athletes'))
```
- **Inspect master (approved):**
```js
State.arr(State.keys.athletesMaster)
```
- **Inspect roster for a CID:**
```js
const cid = 'CID_...';
State.arr(State.keys.athletes(cid))
```
- **Verify tick increments:**
```js
localStorage.getItem(State.keys.tickAthletesCID(cid))
```
- **Show roster names per CID key:**
```js
Object.keys(localStorage)
  .filter(k => k.startsWith('athletes_CID_') && !k.includes('tick') && !k.includes('aid'))
  .forEach(k => {
    const arr = JSON.parse(localStorage.getItem(k) || '[]');
    console.log(k, '=>', arr.map(a => a.name));
  });
```

---

## 8) Backlog / Next Steps

- **Cosmetic:** Separate L9 card visually from Events card; optional hide of legacy manual add block.
- **Federation Registry:** Replace tester selector with proper federation registry UX.
- **AID continuity:** Current behavior is monotonic increasing (OK). No renumbering is intended.
- **Global docs:** Include this L9 log in `/docs` (e.g., `L9_ROSTER_LINKING.md`) and cross‑link from Setup/Run manuals.

---

## 9) Status Summary

- **L9:** **COMPLETE** ✅  
- **Activation Merge:** **APPLIED** ✅ — prevents overwrites; preserves L9 + manual in one roster.
- **Ready for Weekend Testing:** Use both flows in the same CID; Run should reflect combined roster.

---

### Appendix: Quick Reference (IDs & Functions)

- **UI IDs:** `l9_master_tbody`, `l9_roster_tbody`, `l9_count_master`, `l9_count_roster`, `l9_search`, `fid`, `f_fid_selector`
- **Events:** `l9-fid-ready`, optional `l9-refresh`
- **Exports:** `window.__L9_RENDER`, `window.__L9_GETTERS`
- **Getters:** `getCID`, `loadMasterApprovedByFID`, `loadRoster`
- **Core functions:** `mapToRosterItem`, `inRoster`, `writeRoster`, `nextAid`
- **State keys (from `state.js`):**  
  - `athletesMaster`: `"athletes_master"`  
  - `athletes(cid)`: `"athletes_<cid>"`  
  - `athletesAidCursor(cid)`: `"athletes_aid_cursor_<cid>"`  
  - `tickAthletesCID(cid)`: `"athletes_tick_<cid>"`

---

_This document is intended to be **copy‑pasted** into your project docs (e.g., `/docs/L9_ROSTER_LINKING.md`) and treated as the canonical reference for the L9 roster linker._
