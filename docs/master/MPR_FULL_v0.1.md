# XGAMES Arena — Master Parameter Registry (MPR) v0.1

This document defines **all identifiers, data contracts, and key mappings** that power the Arena (XGAMES) system.  
Ground truth extracted directly from the latest repository and dev docs.

---

## 1️⃣ Identifiers & Formats

| Type | Format / Example | Description |
|------|------------------|-------------|
| **CID** | `CID_1760864913946`, `CID_KL_OPEN_2025` | Competition unique ID |
| **EID** | `default`, `slalom`, `park_run` | Event unique ID |
| **HEAT** | `"1"`, `"2"`, ... | Heat number (string) |
| **AID** | `"A1"`, `"A2"` | Athlete unique ID |
| **JID** | `"J1"`, `"J2"` | Judge unique ID |
| **SCREEN** | `"live1"`, `"live2"` | TV Display screen selector |

### URL Parameters (used by pages)
| Param | Used By | Notes |
|--------|----------|-------|
| `cid` | All run/display pages | Required |
| `eid` | Run Console / TVs | Optional if single event |
| `heat` | Run Console / TVs | Required for scoring |
| `screen` | tv_display.html | `live1` / `live2` |

### Enumerations
- **Display Mode** → `intro`, `scoreboard`, `leaderboard`, `hide`
- **Reveal Packet Fields** → `{ cid, eid, heat, aid, judgeTotals[], final }`

---

## 2️⃣ Data Contracts Map (localStorage Keys → Schema + Owner)

### Index & Staging

#### `arena_competitions_setup`
- **Write:** `modules/competition/setup_new.html`
- **Read:** `modules/competition/setup.html`
```json
[
  {
    "cid": "CID_1760864913946",
    "name": "KL Open 2025",
    "venue": "Bukit Jalil",
    "date": "2025-10-25",
    "events": [{ "eid": "default", "name": "Open Event" }],
    "judges": [{ "jid": "J1", "name": "Judge 1" }],
    "athletes": [{ "aid": "A1", "name": "One", "nation": "MAS", "club": "OPEN" }]
  }
]
```

#### `competitions_active`
- **Write:** Approve in `setup_new.html`
- **Read:** `competition_home.html`, `competition_list.html`, `run_console.html`
```json
[
  { "cid": "CID_1760864913946", "name": "KL Open 2025", "date": "2025-10-25", "venue": "Bukit Jalil" }
]
```

---

### Per-Competition Data Stores

#### `events_<CID>`
```json
{ "cid": "CID_1760864913946", "events": [{ "eid": "default", "name": "Open Event", "heats": ["1","2"] }] }
```

#### `judges_<CID>`
```json
{ "cid": "CID_1760864913946", "judges": [{ "jid": "J1", "name": "Judge 1" }] }
```

#### `athletes_<CID>`
```json
{ "cid": "CID_1760864913946", "athletes": [{ "aid": "A1", "name": "One", "nation": "MAS", "club": "OPEN" }] }
```

#### `heats_<CID>_<EID>`
```json
{ "eid": "default", "heats": [{ "heat": "1", "athletes": ["A1","A2","A3"] }] }
```

---

### Scoring & Runtime

#### `scores_<CID>_<EID>_<HEAT>`
Two shapes currently supported:
```json
[
  { "aid": "A1", "judgeTotals": [66.0, 64.0, 72.2], "final": 67.4 }
]
```
_or_
```json
{ "results": [
  { "aid": "A1", "judgeTotals": [66.0, 64.0, 72.2], "final": 67.4 }
] }
```
✅ **Preferred:** array form (simpler, faster read).

#### `scoring_<CID>`
```json
{ "criteria": [{ "id": "A", "weight": 20 }, { "id": "B", "weight": 40 }, { "id": "C", "weight": 40 }] }
```

#### `reveal`
```json
{ "cid": "CID_1760864913946", "eid": "default", "heat": "1", "aid": "A1", "judgeTotals": [66,64,72], "final": 67.4 }
```

#### `active_heat`
```json
{ "cid": "CID_1760864913946", "eid": "default", "heat": "1", "aid": "A1" }
```

#### `display_control_live1` / `display_control_live2`
```json
{ "mode": "scoreboard", "cid": "CID_1760864913946", "eid": "default", "heat": "1" }
```

#### `leaderboard_<CID>_<EID>`
```json
{ "rows": [{ "rank": 1, "aid": "A1", "name": "One", "final": 72.20 }] }
```

---

## 3️⃣ Code Inventory (Page/Module Key Access)

| File | Reads | Writes | Notes |
|------|--------|---------|-------|
| **pages/run_console.html** | competitions_active, events_*, heats_*, athletes_*, scores_* | reveal, active_heat, display_control_* | lock/reveal, launch TVs |
| **pages/tv_display.html** | display_control_*, reveal, scores_*, athletes_* | — | Live card per screen |
| **pages/tv_scoreboard.html** | leaderboard_*, scores_*, athletes_* | — | Leaderboard |
| **pages/competition_home.html** | competitions_active, events_* | — | Entry dashboard |
| **pages/judge.html** | judge_status*, scores_* | judge_status* | Shell only |
| **modules/competition/setup_new.html** | arena_competitions_setup | competitions_active, events_*, judges_*, athletes_*, heats_* | Main setup |
| **modules/competition/setup.html** | arena_competitions_setup | — | Staging list |
| **shared/state.js** | defines keys | — | Legacy: competitions (deprecated) |

---

## 4️⃣ Risk Areas

| Area | Risk | Fix Plan |
|-------|------|-----------|
| Legacy `State.keys.comps` | Wrong key (`competitions`) | Add `activeComps`, comment legacy |
| Display module duplication | Two versions (`modules/display.html`, `pages/tv_display.html`) | Deprecate module version |
| Dual score shapes | `[ ]` vs `{results:[]}` | Lock to array |
| Missing reveal data | Sometimes `final` missing | Derive before write |

---

## 5️⃣ Verification Flow (DoD)

**Step 1:** Seed data via Setup → Approve → confirm keys exist.  
**Step 2:** Open Run Console with `?cid=&eid=&heat=1`.  
**Step 3:** Lock & Reveal → check `reveal` key created.  
**Step 4:** Open TV Screens (`tv_display.html?screen=live1` & `tv_display.html?screen=live2`) → athlete name + totals appear instantly.  
**Step 5:** Switch display modes → confirm scoreboard & leaderboard load.

---

## 6️⃣ Housekeeping Patch Policy

1. Add `State.keys.activeComps = 'competitions_active'`.  
2. Comment legacy: `// DEPRECATED: State.keys.comps = 'competitions'`.  
3. Banner in `modules/competition/display.html`: “Deprecated — use /pages version.”  
4. Adopt array form for all `scores_*` keys.  
5. Add safety check in Run Console before writing reveal.

---

**Maintained by:** ZED Dev System (Arena)  
**Version:** v0.1 — Ground Truth Registry  
**Date:** 2025‑10‑20  
