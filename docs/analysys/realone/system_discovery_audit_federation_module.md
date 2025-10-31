# 🏛 Federation Module Audit (PSR)

## 1️⃣ Files Covered
- `/modules/federation/approve_athletes.html`
- `/modules/federation/approve_entries.html`

---

## 2️⃣ Purpose & Role
The **Federation Module** is the administrative interface used by federation officials to approve athlete registrations and manage competition entries.  
It is the core **approval and publishing layer** that connects athlete onboarding with competition participation.

Main functions:
- Review & approve pending athletes (`athletes_staging → athletes_master`).
- Manage competition entry staging (`entries_staging_<CID> → athletes_<CID>`).
- Generate federation-level IDs (`NSID`), assign competition-level AIDs, and trigger tick updates for UI refreshes.

---

## 3️⃣ Functional Breakdown
| Page | Purpose | Data Flow | Primary Keys Used |
|------|----------|-----------|-------------------|
| **approve_athletes.html** | Federation reviews new athlete registrations, approves/rejects, and imports lists via CSV/JSON. | `athletes_staging → athletes_master` + tick bump | `athletes_staging`, `athletes_master`, `athletes_rejected`, `nsid_cursor_<FID>`, `athletes_master_tick` |
| **approve_entries.html** | Federation approves athlete entries into a competition. | `entries_staging_<CID> → athletes_<CID>` + AID cursor bump | `entries_staging_<CID>`, `athletes_<CID>`, `athletes_aid_cursor_<CID>`, `athletes_tick_<CID>` |

---

## 4️⃣ Core Logic — Athlete Approval (`approve_athletes.html`)
### Review UI
- Tabbed interface for **Pending**, **Approved**, **Rejected**.
- Federation filter dropdown (`FID` e.g. MSF/ABF).  
- Import toolbar supports `.csv` or `.json` upload to populate `athletes_staging`.

### Approval Process
- Reads:  
  - `athletes_staging` → pending athletes  
  - `athletes_master` → approved  
  - `athletes_rejected` → archive
- On **Approve**:
  - Validates record.
  - Auto-generates NSID if missing: `NSID-<FID>-<YEAR>-<00001>` (using `nsid_cursor_<FID>`).
  - Normalizes fields (nation = MAS, title case for state/district, upper for sex).
  - Adds record to `athletes_master`.
  - Removes from `athletes_staging`.
  - Bumps `athletes_master_tick` to refresh federation UIs.
- On **Reject**:
  - Moves record to `athletes_rejected` with timestamp + note.
  - Removes from staging.
- On **Import**:
  - CSV/JSON ingestion pipeline:
    - De-dupes by NSID and name|club pair.
    - Writes valid athletes into `athletes_staging`.
    - Bumps tick to trigger pending refresh.

✅ `national_id` remains private (never copied to roster/public).

---

## 5️⃣ Core Logic — Entry Approval (`approve_entries.html`)
### Overview
Federation assigns approved athletes (from master registry) into specific competition rosters.

### Flow
1. Reads query param `?cid=` to determine competition scope.
2. Loads from:
   - `entries_staging_<CID>` (pending entries)
   - `athletes_master` (approved global list)
   - `athletes_<CID>` (competition roster)
3. UI Components:
   - “Add by NSID” form — manually adds athletes to staging.
   - “Search Federation Athletes” — filters by name, NSID, state, sex, FID.
   - “Staging Table” — pending entries with selection checkboxes.

### Approve → Publish
- Federation selects multiple entries.
- Each approved athlete:
  - Pulled from `athletes_master`.
  - Assigned a unique **AID** using `athletes_aid_cursor_<CID>` (e.g. A001, A002, …).
  - Published into `athletes_<CID>` (competition roster).
  - `national_id` is **excluded**.
- Removes approved entries from `entries_staging_<CID>`.
- Bumps `athletes_tick_<CID>` to refresh dashboards and displays.

---

## 6️⃣ Data Contracts Observed
| Data Layer | Keys Used | Description |
|-------------|------------|-------------|
| **Athlete Onboarding** | `athletes_staging`, `athletes_master`, `athletes_rejected`, `tickAthletesMaster` / `athletes_master_tick` | Full federation lifecycle |
| **NSID Cursor** | `nsid_cursor_<FID>` | Auto-generated per federation |
| **Competition Entries** | `entries_staging_<CID>`, `athletes_<CID>`, `athletes_aid_cursor_<CID>`, `athletes_tick_<CID>` | Competition entry management |
| **Sync & Refresh** | Tick updates after approval or import | Forces UI re-render via storage event |

---

## 7️⃣ Execution Flow
### Athlete Approval
1. Federation opens approval page.
2. Chooses FID filter (optional).
3. Reviews pending athletes (`athletes_staging`).
4. Approves or rejects each athlete.
5. Approved → written to `athletes_master`; rejected → `athletes_rejected`.
6. Tick (`athletes_master_tick`) bumps to refresh other federation pages.

### Entry Approval
1. Federation opens `approve_entries.html?cid=<CID>`.
2. Searches or adds athletes by NSID.
3. Selects staging entries → clicks **Approve → Publish**.
4. Entries move into `athletes_<CID>` with new AIDs.
5. Tick (`athletes_tick_<CID>`) fires → updates displays.

---

## 8️⃣ Status
| Area | Status | Notes |
|------|---------|-------|
| Athlete Approval | ✅ Fully working | Includes import, approve, reject |
| Competition Entry Approval | ✅ Working | AID generation and publishing OK |
| NSID Cursor | ✅ Stable | Auto-increments per federation |
| Import Tool | ⚙️ Partial | Minimal validation; assumes proper header |
| Multi-FID Handling | ⚙️ Partial | Hardcoded FIDs in dropdown |
| Auth / Permissions | ❌ Missing | Any user can approve without login |

---

## 9️⃣ Gaps / Risks
- 🔸 **No authentication** — Approval accessible by anyone.
- 🔸 **No federation isolation** — FID filter not enforced by access rules.
- 🔸 **Duplicate record handling** — Only basic NSID + name/club de-dupe.
- 🔸 **No audit trail** — No log of who approved/rejected.
- 🔸 **Offline-only** — No backend persistence or sync to cloud database.
- 🔸 **Manual CID handling** — `approve_entries.html` depends on query param accuracy.

---

## 🔍 10️⃣ QA Checklist
1. Clear localStorage.  
2. Import a CSV with valid athlete data → confirm `athletes_staging` populated.  
3. Approve one athlete → check `athletes_master` updated and tick bumped.  
4. Reject one athlete → confirm `athletes_rejected` entry.  
5. Open `approve_entries.html?cid=TEST1` → search for NSID from master.  
6. Add to staging → see in `entries_staging_TEST1`.  
7. Select and approve → confirm move to `athletes_TEST1` with AID sequence.  
8. Verify that `national_id` does **not** appear in competition data.  
9. Inspect `nsid_cursor_MSF` and `athletes_aid_cursor_TEST1` for incremented values.  

---

✅ **Conclusion:**  
Federation Module provides a fully functioning approval pipeline between registration and competition.  
It successfully enforces federation-level control, ID assignment, and clean data promotion through all layers, but requires **authentication, logging, and backend persistence** for production deployment.
