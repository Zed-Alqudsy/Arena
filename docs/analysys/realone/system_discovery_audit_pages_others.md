# 🌐 Pages Layer Audit (PSR)

## 1️⃣ Files Covered
- `/pages/athlete_center.html`
- `/pages/federation_center.html`
- `/pages/event_admin.html`
- `/pages/heat_select.html`

---

## 2️⃣ Purpose & Role
This batch represents **navigation and control pages** connecting users to their respective modules:
- **Athlete Center** → Entry point for athletes.
- **Federation Center** → Control hub for federation officials.
- **Event Admin & Heat Select** → Operational interface for competition execution.

They are **non-logic-heavy** pages — primarily UI portals with minimal script logic for navigation, parameter validation, and display control.

---

## 3️⃣ Functional Breakdown
| Page | Role | Primary Audience | Links To |
|------|------|------------------|-----------|
| **Athlete Center** | Athlete-facing home page with links to register and join competitions | Athletes | `/modules/athlete/register.html`, `/modules/athlete/join.html` |
| **Federation Center** | Federation dashboard to approve athletes and entries | Federation admins | `/modules/federation/approve_athletes.html`, `/modules/federation/approve_entries.html`, `/pages/competition_center.html` |
| **Event Admin** | Admin panel for managing events and accessing heat selection | Event organizers | `/pages/heat_select.html` |
| **Heat Select** | Displays list of heats for a selected event; links to run console | Judges / Organizers | `/pages/run_console.html` |

---

## 4️⃣ Core Logic

### 🏃 athlete_center.html
- Pure UI with cards and icons; no dynamic logic.
- Three options:
  - “Register as Athlete” → opens registration form.  
  - “Join a Competition” → opens join form.  
  - “My Entries” → placeholder (disabled).  
- Uses shared styles + simple responsive grid .

✅ **Role:** Athlete home and onboarding gateway.

---

### 🛂 federation_center.html
- Loads quick badge counts from:
  ```js
  const masterCount = State.arr(State.keys.athletesMaster).length;
  const stagingCount = State.arr(State.keys.entriesStaging(urlCID)).length;
Displays counts dynamically as badges (“in master”, “awaiting approval”).

Links:

Approve Athletes

Approve Competition Entries

Competition Center

Non-blocking try/catch ensures UI doesn’t break if data missing.

Reads optional ?cid= to display per-competition entry count
federation_center

.

✅ Role: Federation dashboard summarizing approval workload.

🧭 event_admin.html
Requires URL params cid and eid:

js
Copy code
Core.requireParams(['cid','eid'],'competition_home.html');
Loads event list:

js
Copy code
const events = State.arr(State.keys.events(cid));
const ev = events.find(e => e.eid === eid);
Displays event name and division.

"Choose Heat" button links to heat_select.html via Core.buildUrl()
event_admin

.

✅ Role: Mid-level control hub between event setup and heat runs.

🔥 heat_select.html
Requires params cid and eid:

js
Copy code
Core.requireParams(['cid','eid'],'competition_home.html');
Loads list of heats:

js
Copy code
const heats = State.arr(State.keys.heats(cid,eid));
If heats exist → lists all with “Open” buttons linking to run_console.html.

If empty → shows placeholder heats (Heat A / Heat B) for skeleton testing.

Uses shared UI and buildUrl for safe navigation
heat_select

.

✅ Role: Interactive step for selecting heats to run in live scoring.

5️⃣ Data Contracts Observed
Data Source	Keys Referenced	Purpose
Federation	athletesMaster, entriesStaging_<CID>	Count display on dashboard
Events	events_<CID>	Event Admin summary
Heats	heats_<CID>_<EID>	Heat Select listing
Navigation	cid, eid	Required parameters for context
Display Sync	run_console.html	Next-step linkage

6️⃣ Execution Flow
Athlete Center: User selects “Register” or “Join” → opens module page.

Federation Center: Federation reviews counts → clicks to open approval module.

Event Admin: Loads event data for current cid/eid → sends user to heat selection.

Heat Select: Displays heats → user chooses heat → opens run_console.html.

7️⃣ Status
Area	Status	Notes
Athlete Center	✅ Stable	Pure navigation
Federation Center	✅ Functional	Data-driven badges
Event Admin	✅ Working	Parameter validation and dynamic info
Heat Select	✅ Working	Placeholder logic + functional linking
Styling	✅ Consistent across pages	
Auth	❌ None implemented	

8️⃣ Gaps / Risks
🔸 No authentication: Anyone can access admin/federation pages directly via URL.

🔸 No multi-FID enforcement: Federation dashboard shows all data indiscriminately.

🔸 Hardcoded fallback pages: e.g. redirect to competition_home.html on param error.

🔸 Heat placeholders not connected to real heat data for testing.

🔸 Missing role-based routing (Athlete vs Federation vs Admin).

9️⃣ QA Checklist
Open athlete_center.html → test all links (Register, Join).

Open federation_center.html?cid=TEST1 → verify badge counts show correctly.

Open event_admin.html?cid=TEST1&eid=E1 → check event info loads.

Click “Choose Heat” → ensure navigation to heat_select.html.

In Heat Select → confirm correct CID/EID displayed and placeholder heats load.

Click “Open” on a heat → verify URL points to run_console.html.

✅ Conclusion:
This batch defines the top-level navigation & execution flow layer for XGAMES ARENA.
All pages are lightweight, fast-loading, and structured around shared logic (Core, State, UI).
For production, implement role-based access control, auth routing, and dynamic heat/event loading to finalize this layer.