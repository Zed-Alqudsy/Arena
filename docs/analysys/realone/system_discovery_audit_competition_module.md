# 🏆 Competition Module Audit (PSR)

## 1️⃣ Files Covered
- `/modules/competition/setup.html`
- `/modules/competition/setup_new.html`
- `/modules/competition/control.html`
- `/modules/competition/leaderboard.html`
- `/modules/competition/display.html`

---

## 2️⃣ Purpose & Role
The **Competition Module** governs all event creation, configuration, and runtime management.  
It supports the full competition lifecycle:
1. **Setup & Configuration** — define competition metadata, venue, schedule, judges, and scoring.
2. **Control & Run** — active judging, heat tracking, and reveal.
3. **Display & Leaderboard** — render public-facing or event screen outputs.

This module bridges data between **Federation**, **Athletes**, and **Run Console** layers using standardized keys like:
- `events_<CID>`
- `athletes_<CID>`
- `entries_staging_<CID>`
- `heats_<CID>_<EID>`
- `leaderboard_<CID>_<EID>`

---

## 3️⃣ Functional Breakdown
| Page | Purpose | Data Role | Primary Keys Used |
|------|----------|-----------|-------------------|
| **setup.html** | List and manage created competitions | Admin view / organizer list | `arena_competitions_setup` |
| **setup_new.html** | Create or edit a competition | Writes base metadata and judging config | `arena_competitions_setup` |
| **control.html** | Central operations (Run Console) | Manages active events and heat control | `judge_status`, `display_control_live1/2`, `heats_<CID>_<EID>` |
| **display.html** | Public screen during event | Reads live state and judging data | `leaderboard_<CID>_<EID>` |
| **leaderboard.html** | Final ranking view | Aggregated event results | `leaderboard_<CID>_<EID>` |

---

## 4️⃣ Key Logic — `setup.html` (Competition Manager)
- Reads array from `localStorage['arena_competitions_setup']`.
- Normalizes each record → `{ cid, name, schedule, judging, status, owner }`.
- Calculates completion % based on required fields:  
  `['name', 'date', 'venue', 'tz', 'categories', 'judges', 'scoring']`.
- Filters via dropdown: `Draft | Pending | Approved`.
- Supports search by `name` or `CID`.
- Sorting options: updated date, event date, name.
- Rendered table with action buttons:
  - **Edit** → `setup_new.html?cid=<CID>`
  - **Run** → `/pages/run_console.html?cid=<CID>&eid=default&heat=1`
- Displays empty state if no records exist.

✅ **Result:** Organizer gets a clear pre-approval dashboard for competition drafts and progress.

---

## 5️⃣ Data Contracts & Relationships
| Data Type | Key Format | Description |
|------------|-------------|-------------|
| Competitions (drafts) | `arena_competitions_setup` | Array of event objects with schedule/judging metadata |
| Events | `events_<CID>` | Configured categories per competition |
| Entries | `entries_staging_<CID>` | Athlete registration pending approval |
| Heats | `heats_<CID>_<EID>` | Active heat definitions |
| Leaderboard | `leaderboard_<CID>_<EID>` | Ranked results for display |
| Cross-tab messages | `judge_status`, `display_control_live1/2` | LocalStorage-based real-time sync |

---

## 6️⃣ Control & Display Flow
1. **Organizer setup:** Create event → stored in `arena_competitions_setup`.
2. **Approval stage:** Federation can mark as Approved (field `status`).
3. **Control console:** `control.html` orchestrates heats and judges.
4. **Judges submit:** via SyncLocal bus (`judge_status`).
5. **Displays update:** `display.html` and `leaderboard.html` listen for data refresh ticks.
6. **Leaderboard published:** Generated into `leaderboard_<CID>_<EID>` for viewing/export.

---

## 7️⃣ Status
| Area | Status | Notes |
|------|---------|-------|
| Setup list (`setup.html`) | ✅ Stable | Sort, search, filter working |
| New setup form (`setup_new.html`) | ⚙️ Partial | Core scaffolding complete; advanced validation TBD |
| Run control (`control.html`) | ⚙️ Partial | Logic depends on judge_status events |
| Leaderboard (`leaderboard.html`) | ✅ Display ready | Pulls live data keys |
| Display (`display.html`) | ✅ Works for local event screens | Styling and data-binding OK |
| Multi-CID linking | ⚠️ | Requires consistent CID param passing |

---

## 8️⃣ Gaps / Risks
- 🔸 **Single-store contract:** All competitions share one key (`arena_competitions_setup`); scalability risk.
- 🔸 **Manual CID linking:** No global registry ensures unique CIDs.
- 🔸 **Limited sync:** Cross-tab sync limited to `judge_status`; display updates rely on manual tick or reload.
- 🔸 **Approval logic external:** Status changes not enforced automatically.
- 🔸 **Offline-only storage:** No backend persistence or multi-user sharing.
- 🔸 **Incomplete form logic:** `setup_new.html` missing full validation on venue/time/judges.

---

## 9️⃣ QA Checklist
1. Open `setup.html` → verify existing competitions render.  
2. Click **Create New Competition** → redirected to `setup_new.html`.  
3. Fill form and save → check `localStorage['arena_competitions_setup']`.  
4. Reopen `setup.html` → new record visible.  
5. Test filters: Draft / Approved.  
6. Enter `?cid=<CID>` → confirm record edit.  
7. Run test console link → ensure `run_console.html` receives `cid` param.  
8. On display and leaderboard → confirm proper `leaderboard_<CID>_<EID>` key read.

---

✅ **Conclusion:**  
Competition Module implements full pre-event management and runtime display structure.  
It is **production-ready for offline demo**, with minimal adjustments needed for CID registry, approval automation, and backend sync.
