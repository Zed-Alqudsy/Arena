# ⚙️ ZED XGames Pilot — Stage 4 Implementation Plan

> **Purpose:** Execute the Stage 3 Final Build Manual step-by-step to deliver a working end-to-end pilot with minimal complexity, fully offline-ready.

---

## 1️⃣ System Preparation

### Folder Layout
```
/core/             ← shared logic (bus, config, rules, sync)
/admin-home/       ← competition centre (existing)
/nsid/             ← new (Platform A - NSID registration)
/event-entry/      ← new (Platform A - event entries)
/run-lite/         ← new (Platform B - heat management)
/displays/         ← scoreboard, leaderboard, intro, live, display_centre
```

---

## 2️⃣ Platform A — NSID & Event Entry

### A. NSID Registration (new)
**Goal:** Build athlete identification & approval.
- **HTML:** `nsid_form.html` → form (name, gender, age, club, nationality).
- **JS:** `nsid.js`
  - Save each record in `localStorage` as `xg_nsids_v1`.
  - Default status = `"pending"`.
  - Federation view `nsid_list.html` can approve/reject (status toggle).
  - Include filter/search by name or status.

### B. Event Entry (new)
**Goal:** Link NSID to competition + discipline.
- **HTML:** `event_entry.html`
  - Dropdown of competitions (from `xg_competitions_v2`).
  - Dropdown of disciplines (Inline Freestyle / Park / Skatecross).
  - Pull approved NSIDs → selectable list.
- **JS:** `event_entry.js`
  - Store entries in `xg_entries_v1`.
  - Prevent duplicates: one NSID per competition+discipline.
  - Display confirmation summary before submit.

---

## 3️⃣ Platform B — Competition Setup & Run

### A. Competition Centre (existing)
- Keep all existing functions (`CompetitionsRepo` etc).
- Add “Heats & Progression” setup step:
  - Heat size input (default 4).
  - Round sequence (e.g., Heats → Final).
  - Top-N advancement field.
- Imported from `xg_entries_v1`.
- On “Activate”: lock configuration + mark `status: active`.

### B. Run Lite (new)
**Goal:** Operate one heat fully (offline).  
- **HTML:** `run.html`
  - Show Event / Round / Heat header.
  - List athlete cards with order.
  - Buttons: **Stage**, **Start**, **Stop**, **Close Heat**, **Publish**.
- **JS:** `run.js`
  - Use `SyncLocal.send()` + `bus.emit()` to share state.
  - Wait until all judges lock before publishing.
  - On publish: aggregate → update leaderboard.

---

## 4️⃣ Judging Logic (Shared)

### Dynamic Config
`config_discipline.json` (shared file):
```json
{
  "inline_freestyle": { "criteria": ["technique", "variety", "cleanliness"], "judgeCount": 5, "drop": "high_low" },
  "skateboard_park": { "criteria": ["difficulty", "execution", "flow"], "judgeCount": 5, "drop": "high_low" },
  "skatecross": { "criteria": ["speed", "style", "control"], "judgeCount": 3, "drop": "none" }
}
```
- Load config on startup → sets `criteria`, `judgeCount`, and `drop` globally.
- Judge Panel auto-renders N fields.
- Scoreboard auto-renders N tiles.
- Drop-high/low logic only in `rules.js` (no duplicates).

---

## 5️⃣ Display Layer

- Pages: `display_centre.html`, `live.html`, `scoreboard.html`, `leaderboard.html`, `intro.html`.
- **Unify channel key:** `display_control` (used by all).  
- **Display Centre:**  
  - Buttons → send commands via `SyncLocal.send('display_control', { action: 'show:scoreboard' })`.  
  - “Rebroadcast” = resend last command.  
  - “Panic Reset” = force scoreboard.  
- **Live Pages:** listen to same channel and update instantly.

---

## 6️⃣ QC Testing

| Test | Expected Result |
|------|------------------|
| NSID → Event → Setup | Flow completes with data visible in Competition Centre |
| Judge Panel | Layout adapts automatically to judge count |
| Run Lite | Aggregation triggers leaderboard update |
| Offline Mode | All tabs sync via localStorage only |
| Config Lock | “Activate” disables all setup edits |
| Panic Reset | Returns all displays to scoreboard instantly |

---

## 7️⃣ Deliverables

1. `/pilot` folder (HTML + JS ready to test).  
2. `qc_report.json` (pass/fail summary).  
3. `pilot_walkthrough.md` (demo steps for presentation).  

---

### Reminder
This plan implements **Stage 3 Final Build Manual** — no added scope, no design change. It is limited to:  
✔ Completing flow continuity.  
✔ Enabling configuration flexibility.  
✔ Ensuring offline + local broadcast reliability.

