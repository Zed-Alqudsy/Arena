
# XGAMES Run System — Step 5 Manual (Judge, Run Console, Score Monitor & Event Log)
**Version:** 0.2 (2025‑10‑21)  
**Scope:** Judge View, Run Console, Score Monitor, Event Log, Storage Keys, Recompute rules, Name mapping, Refresh behavior, Minimal migrations.  
**Owner:** zedecho / arena

> This is the **single source of truth** for Step 5 wiring. Any thread that wants to change this layer **must** read and comply with this manual.

---

## 0) Terminology & IDs
- **CID**: Competition ID (e.g., `CID_1760864913946`)
- **EID**: Event ID (e.g., `E1`, or `default`)  
- **HEAT**: Heat number (string), usually `"1"`
- **Athlete ID**: Stable slug, e.g., `"A1"`, `"A2"`, ...  
- **Athlete Name**: Human name, e.g., `"One"`, `"Two"`
- **Judge ID**: `"J1" ... "J5"`

All localStorage buckets are **per origin** (`location.origin`), **per CID/EID/HEAT**. Switching port (e.g., 5173 → 8080) creates an empty storage view by design (browser security).

---

## 1) Storage Keys (Canonical)
**All keys are strings in `localStorage`.** Values are JSON.

| Key Pattern | Example | Shape | Notes |
|---|---|---|---|
| `athletes_<cid>` | `athletes_CID_1760864913946` | `[{ id:"A1", name:"One" }, ... ]` | Athlete registry (ID→name map source). |
| `judges_<cid>` | `judges_CID_1760864913946` | `[{ id:"J1", name:"Judge 1"}, ... ]` | Judge registry. |
| `events_<cid>` | `events_CID_1760864913946` | `[{ id:"E1", ... }, ...]` | Event list. |
| `scoring_<cid>` | `scoring_CID_1760864913946` | `{ criteria:[{label:"A", weight:20}, {label:"B", weight:40}, {label:"C", weight:40}] }` | Criteria weights (weights sum to 100). |
| `scores_<cid>_<eid>_<heat>` | `scores_CID_1760864913946_E1_1` | **array** of row objects (see below) | **Canonical** store for locked rows. |
| `eventlog_<cid>_<eid>_<heat>` | `eventlog_CID_1760864913946_E1_1` | **array** (max 500) of **strings** | We store strings; names are mapped **at display**. |
| `judge_status` | `judge_status` | object | Last packet emitted by Judge page (diagnostic). |

### 1.1 `scores_*` Row Schema (canonical, array)
```json
{
  "athleteId": "A1",          // stable ID (REQUIRED)
  "judgeId":   "J1",          // stable ID (REQUIRED)
  "totals":    { "a": 35, "b": 64, "c": 99 },  // OR "scores": { ... } legacy alias
  "total":     72.20,         // optional (stored by Judge); if absent, Run can recompute
  "ts":        1760954800309  // epoch ms
}
```
- **Keys inside `totals`** are **lowercase slugs** of criteria labels: `"a"`, `"b"`, `"c"`.  
- **Allowed legacy**: `scores` instead of `totals`. Run Console normalizes this.

### 1.2 Legacy Shape (to be migrated lazily when encountered)
```json
{ "results": [ /* same objects as above */ ] }
```
The Run Console must **not** wipe this. On read, if object-with-`results`, treat as array, then write back as array **only if** legacy array had items.

---

## 2) Judge Page → Submit Flow
1. Judge selects **Athlete** and enters per-criterion values for `A,B,C` (0–100 each).  
2. Judge computes/stores a raw **total** (0–100) and emits a row to the `scores_*` bucket for the **active (cid,eid,heat)**.  
3. Row keys use **athleteId** (e.g., `"A1"`) and **judgeId** (`"Jx"`).  
4. Judge also updates `judge_status` for diagnostics:
```json
{
  "type":"judge_status","cid":"<CID>","eid":"<EID>","heat":"1",
  "judgeId":"J1","athleteId":"A1",
  "scores":{"a":4,"b":4,"c":4},"total":4,"status":"locked"
}
```

> **Rule:** Judge never writes athlete **names** to the `scores_*` bucket. Names are derived at display time.

---

## 3) Run Console — Read/Render Flow
### 3.1 Bootstrap
- **Read** `scores_<cid>_<eid>_<heat>`.
- If value is **array** → OK.
- If value is **object-with-results** → **migrate in-memory** to array; if there are items, **write back** array. **Never reset to empty.**  
  ```js
  let arr = readJSON(keyScores(cid,eid,heat), []);
  if (!Array.isArray(arr)) {
    const legacy = arr && Array.isArray(arr.results) ? arr.results : [];
    arr = legacy.slice();
    if (legacy.length) localStorage.setItem(keyScores(cid,eid,heat), JSON.stringify(arr));
  }
  ```
- Populate `locked` set with composite key: `"<athleteId>::<judgeId>"`.

### 3.2 Score Monitor / Table
- **Select** current athlete (from UI state).
- **Filter** rows by `athleteId === currentAthleteId`.
- **For each judge** (J1..J5), prefer **stored total** if numeric; else **recompute** using `scoring_<cid>` criteria:
  ```js
  // pseudo
  const slugs   = criteria.map(x => slug(x.label));        // ["a","b","c"]
  const weights = criteria.map(x => Number(x.weight||0));  // [20,40,40]
  function recompute(bag) {
    const vals = slugs.map(s => Number(bag[s]));
    if (vals.some(v => !isFinite(v))) return NaN;
    const sumW = weights.reduce((a,b)=>a+b,0) || 100;
    const raw  = vals.reduce((acc,v,i)=>acc + v*weights[i], 0);
    return raw / (sumW/100);
  }
  // display rule per cell:
  const num = isFinite(storedTotal) ? storedTotal : recompute(bag);
  cellText  = isFinite(num) ? num.toFixed(2) : "—";
  ```

### 3.3 Final Score (current athlete)
- Compute from **available judge totals** only (ignore `NaN`), then apply event rules (e.g., average, drop-high-low if required, etc.). Present as `Final=<NN.NN>`.

---

## 4) Event Log — Persist & Display
- **Persisted format**: array of **strings**, max 500, newest last.  
  Examples:
  ```txt
  [09:35:21] REFRESH · 5/5 submitted (Final=26.64)
  [09:35:21] UPDATE · J1 → A1
  ```
- **On refresh**, `restoreEventLog()` now **maps** athlete IDs → names for display:
  ```js
  const athletes = JSON.parse(localStorage.getItem(`athletes_${cid}`) || '[]');
  const id2name  = Object.fromEntries(athletes.map(a => [String(a.id||a.aid), a.name || a.displayName || a.fullName || a.id]));
  const humanize = s => s.replace(/\b(A\d+)\b/g, m => id2name[m] || m);
  ta.textContent = arr.length ? arr.map(humanize).join("\n") + "\n" : "";
  ```
- **Live append** (`window.log`): UI uses same mapping; **storage remains strings** (IDs).

> **Design choice:** Keep storage atomic and stable (IDs). Map to names only at the display layer for resilience.

---

## 5) Name vs ID Policy
- **Canonical**: `scores_*` rows use **athleteId** and **judgeId**.  
- **Display**: UI shows **athleteName** by mapping `A# → name` using `athletes_<cid>`.  
- **Do not** write names into `scores_*` rows or `eventlog_*` storage.  
- This avoids mismatches when names change and guarantees joins are O(1) via map lookups.

---

## 6) Known Edge Cases & Fixes
1) **Port / origin change** → Looks empty.  
   - `location.origin` differs → different `localStorage` namespace by browser design.  
   - **Fix:** Re-open on the same origin/port used previously or copy keys manually.

2) **Legacy `scores_*` object** shape `{results:[...]}` present.  
   - Old bootstrap incorrectly **reset** to empty.  
   - **Fix:** Use migration snippet in §3.1 (no silent reset).

3) **Rows with `undefined` a/b/c and no `total`** (NaN on recompute).  
   - E.g., judge opened the page and locked with no inputs.  
   - **Fix:** Re-submit from Judge to write valid numbers; UI displays “—” until then.

4) **A1 vs One flip in Event Log after refresh.**  
   - Storage is strings with IDs; renderer showed raw lines.  
   - **Fix:** Name-map at display in `restoreEventLog()` + live UI append (see §4).

5) **EID mismatch** (`default` vs `E1`).  
   - Judge submits under `E1`, console reads `default` (or vice versa).  
   - **Fix:** Verify active EID (`({cid,eid,heat})`) and inspect both buckets. See commands in §10.

---

## 7) Minimal Migration Rules (Do/Don’t)
- ✅ **Do** migrate legacy `scores` → array **in-place** only when encountered; never wipe.  
- ✅ **Do** tolerate both `totals` and legacy `scores` fields.  
- ✅ **Do** prefer stored `total` if numeric; only recompute if missing/invalid.  
- ❌ **Don’t** persist athlete names into `scores_*` rows.  
- ❌ **Don’t** change key naming conventions without updating this manual.  
- ❌ **Don’t** reset non-array `scores_*` silently.

---

## 8) Rendering Contracts (Run Console)
- **Submitted counter** (`n/5 submitted`): count distinct `judgeId` rows for current athlete in the active bucket.  
- **Rows per judge**: at most one effective row; latest `ts` wins if duplicates exist.  
- **UI resilience**: Missing `scoring_<cid>` → recompute returns `NaN`; cell displays “—” until fixed.  
- **Recover on refresh**: Re-read active `cid,eid,heat` and rerender; event log shows latest 500 lines (name-mapped).

---

## 9) Test Procedure (1–2 mins)
1. **Sanity**: Open Run Console; confirm `({cid,eid,heat})` matches expectation.  
2. **Judge submit**: J1+J2 lock A1 with valid A/B/C; Run shows `2/5`.  
3. **Refresh**: Count, per-judge totals, and Final remain correct.  
4. **Event Log**: Lines show **names** (not A1/A2).  
5. **Cross-bucket**: If you use `default` and `E1`, verify both keys list rows.  
6. **NaN guard**: Try locking empty judge once → “—” for that judge; after proper submit → number appears.

---

## 10) Console Diagnostics (Copy‑Paste)
- **List all scores keys:**
```js
Object.keys(localStorage).filter(k=>k.startsWith("scores_"))
```
- **Dump both buckets:**
```js
JSON.parse(localStorage.getItem('scores_<CID>_E1_1')||'[]')
JSON.parse(localStorage.getItem('scores_<CID>_default_1')||'[]')
```
- **Per‑athlete judge coverage (active bucket):**
```js
(function(){const k=`scores_${cid}_${eid}_${heat}`;let a=[];try{a=JSON.parse(localStorage.getItem(k))||[]}catch{}if(!Array.isArray(a)&&a?.results)a=a.results;const m={};a.forEach(r=>{const A=String(r.athleteId||r.aid),J=String(r.judgeId||r.jid);(m[A]??=new Set()).add(J)});return Object.entries(m).map(([A,S])=>({athleteId:A,judges:[...S].sort(),count:S.size}))})()
```
- **Check criteria slugs and sample row keys:**
```js
(function(){const sc=JSON.parse(localStorage.getItem('scoring_'+cid)||'{}');const crit=sc.criteria||[];const sl=crit.map(c=>String(c.label).toLowerCase());return {slugs:sl,sample:(JSON.parse(localStorage.getItem(`scores_${cid}_${eid}_${heat}`)||'[]')||[]).slice(0,2)}})()
```

---

## 11) Implementation Snippets (Safe Drops‑In)
### 11.1 Bootstrap migration (replace any “reset” branch)
```js
let arr = readJSON(keyScores(cid,eid,heat), []);
if (!Array.isArray(arr)) {
  const legacy = arr && Array.isArray(arr.results) ? arr.results : [];
  arr = legacy.slice();
  if (legacy.length) localStorage.setItem(keyScores(cid,eid,heat), JSON.stringify(arr));
}
arr.forEach(r => locked.add(`${r.athleteId||r.aid||''}::${r.judgeId||r.jid||''}`));
```

### 11.2 Event Log restore (name-mapped view)
```js
(function restoreEventLog(){
  try{
    const key = `eventlog_${cid}_${eid}_${heat}`;
    const arr = JSON.parse(localStorage.getItem(key)||'[]');
    const athletes = JSON.parse(localStorage.getItem(`athletes_${cid}`)||'[]');
    const id2name  = Object.fromEntries(athletes.map(a=>[String(a.id||a.aid), a.name||a.displayName||a.fullName||a.id]));
    const humanize = s => s.replace(/\b(A\d+)\b/g, m => id2name[m] || m);
    const ta = el('eventLog');
    ta.textContent = arr.length ? arr.map(humanize).join("\n") + "\n" : "";
    ta.scrollTop = ta.scrollHeight;
  }catch{}
})();
```

### 11.3 Event Log live append (UI only)
```js
const ta = el('eventLog');
const athletes = JSON.parse(localStorage.getItem(`athletes_${cid}`)||'[]');
const id2name  = Object.fromEntries(athletes.map(a=>[String(a.id||a.aid), a.name||a.displayName||a.fullName||a.id]));
const displayLine = line.replace(/\b(A\d+)\b/g, m => id2name[m] || m);
ta.textContent += displayLine + "\n";
ta.scrollTop = ta.scrollHeight;
```

---

## 12) Guardrails (Do Not Break)
- Keep **array** as canonical `scores_*` shape; keep **strings** in `eventlog_*`.
- Never assume criteria labels — always slug them to lowercase letters for keys.
- Final score must **ignore NaN** judge totals and apply event rule consistently.
- Name mapping is **display-only**; storage remains ID‑centric.

---

## 13) Future (Step 5B – Display Centre & TV)
- TV pages must **read the same scores_* array** and tolerate legacy `results` object.
- Leaderboard derivation target: `leaderboard_<cid>_<eid>` (from array store).  
- Display layer should apply the **same name‑mapping** as Run Console.

---

## 14) Changelog
- **0.2 (2025‑10‑21):** Name‑mapped Event Log on restore + live append; clarified legacy migration and NaN handling; added diagnostics.  
- **0.1 (2025‑10‑20):** Initial Step 5 manual.

---

## 15) Quick Checklist (Before demo)
- [ ] Same origin/port as yesterday
- [ ] `({cid,eid,heat})` correct
- [ ] `scoring_<cid>.criteria` present
- [ ] `scores_*` keys exist and are arrays (legacy tolerated)
- [ ] Event Log shows **names**, not `A1`
- [ ] A1 has 5/5 totals, Final correct after refresh
