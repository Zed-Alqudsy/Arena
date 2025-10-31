# 🧭 Competition Pages Module Audit (PSR)

## 1️⃣ Files Covered
- `/pages/competition_center.html`
- `/pages/competition_list.html`
- `/pages/competition_new.html`
- `/pages/competition_home.html`

---

## 2️⃣ Purpose & Role
This module serves as the **competition management frontend** for organizers and admins.  
It provides:
1. A **centralized hub** for competitions (view, create, navigate).  
2. **Competition listing and filtering** with direct links to event dashboards.  
3. **New competition creation form** with automatic CID generation.  
4. Bridges between setup modules (`modules/competition/`) and federation control.

These pages collectively act as the **organizer control center**, allowing users to view, create, and enter competitions stored in localStorage.

---

## 3️⃣ Functional Breakdown
| Page | Function | Key Data | Status |
|------|-----------|----------|--------|
| **competition_center.html** | Dashboard/hub linking to other competition management tools | Navigation only | ✅ Stable |
| **competition_list.html** | Lists all available competitions with filter/search | Reads `competitions_active` or fallback `State.keys.comps` | ✅ Working |
| **competition_new.html** | Creates new competition entries with auto CID and default Active status | Writes to `State.keys.comps` | ✅ Working |
| **competition_home.html** | Landing page for individual competitions | Displays event info + links to setup/control | ⚙️ Partial |

---

## 4️⃣ Core Logic — `competition_list.html`
- Fetches competition list from:
  - `localStorage['competitions_active']` (preferred)
  - fallback: `State.arr(State.keys.comps)` (legacy)
- Filters competitions by:
  - Name, CID, venue, or date (`q` input)
  - Status (Active / Approved / Draft)
- Renders cards showing:
  - Name, CID, venue, date range, and status
- Each card includes a **“Open”** button linking to:
/pages/competition_home.html?cid=<CID>

yaml
Copy code
- Uses `Core.buildUrl()` for parameter-safe navigation.
- Provides count summary and empty state.

✅ **Result:** Organizer can search and open any competition quickly.

:contentReference[oaicite:0]{index=0}

---

## 5️⃣ Core Logic — `competition_new.html`
- Simple UI form with inputs:
- **Name**
- **Date**
- **Venue**
- When “Create Competition” is clicked:
```js
const cid = Core.uid('CID');
const comps = State.arr(State.keys.comps);
comps.push({ cid, name, date, venue, status:'Active' });
State.setJSON(State.keys.comps, comps);
UI.toast('Competition created');
location.href = Core.buildUrl('competition_home.html', { cid });
CID generated via Core.uid('CID').

New record saved to localStorage.

Redirects to competition_home.html.

✅ Result: Organizer can instantly create new events without backend.

competition_new


6️⃣ Data Contracts Observed
Layer	Key	Role
Competition registry	State.keys.comps	Stores full list of competitions
Active competitions	competitions_active	Approved/active subset for list display
Competition objects	{ cid, name, date, venue, status }	Stored per event
Navigation	Core.buildUrl()	Encodes URL params like ?cid=
Toast system	UI.toast()	User confirmation feedback

7️⃣ Execution Flow
Competition Creation
User opens competition_new.html.

Inputs competition details.

Clicks Create Competition.

System generates CID → saves to State.keys.comps.

Toast: “Competition created”.

Redirects to competition_home.html?cid=<CID>.

Competition Listing
User opens competition_list.html.

Page loads competitions_active or fallback list.

Search and status filters applied.

Renders list with “Open” buttons.

Clicking opens competition_home.html.

8️⃣ Status
Area	Status	Notes
Competition Center	✅	Navigation and design stable
List Page	✅	Search + filter functioning
New Page	✅	Creation + redirect functioning
Home Page	⚙️ Partial	May need competition details and sublinks
Data Flow	✅	LocalStorage contracts correct
Backend Sync	❌	Offline-only
Auth / Roles	❌	No restrictions

9️⃣ Gaps / Risks
🔸 No backend sync — all data local to device.

🔸 No edit/delete functions for competitions.

🔸 No federation validation — any user can create competitions.

🔸 No status workflow — “Approved” and “Draft” are static text only.

🔸 Duplicate CID prevention not enforced.

🔸 competition_home.html incomplete (missing full competition summary).

🔍 10️⃣ QA Checklist
Open competition_new.html → fill form → create new event.

Inspect localStorage['comps'] → confirm record added.

Open competition_list.html → verify display.

Use search by name → confirm filtering.

Change status filter → confirm accurate results.

Click “Open” → ensure correct competition loads.

Clear storage → confirm empty-state UI appears.

✅ Conclusion:
Competition Pages act as the organizer control hub for creating and accessing competitions.
The flow from competition_new → competition_list → competition_home is smooth and functional for offline/local use.
To reach production-grade, backend sync, editing tools, and approval workflows should be added.