# 🧩 Athlete Module Audit (PSR)

## 1️⃣ Files Covered
- `/modules/athlete/home.html`
- `/modules/athlete/register.html`
- `/modules/athlete/join.html`

---

## 2️⃣ Purpose & Role
The **Athlete Module** is the athlete-facing entry point of the XGAMES platform.  
It enables individuals to:
1. Register themselves with a federation (`athletes_staging → athletes_master`).  
2. Join a competition once approved (`entries_staging_<CID>` → `athletes_tick_<CID>`).  
It forms the **user onboarding pipeline** feeding the federation’s master database and each competition’s roster.

---

## 3️⃣ Functional Breakdown
| Page | Function | Key UI Elements | Linked Flows |
|------|-----------|----------------|--------------|
| **home.html** | Landing for athletes | Two links → Register / Join | Navigation only |
| **register.html** | Athlete registration form | Inputs: NSID, Name, Nation, State, District, DOB, Sex, Club, Contact, FID, National ID | Writes to `athletes_staging`; auto-ID generation; age calculation |
| **join.html** | Competition entry form | Inputs: NSID, Category, Note | Writes to `entries_staging_<CID>` + tick update; requires `?cid=` |

---

## 4️⃣ Underlying Logic

### 🧠 register.html
- Reads/writes via `State.keys.athletesStaging` and `State.keys.athletesMaster`.  
- **Auto-ID generator** → `nsid_cursor_<FID>`; produces `NSID-<FID>-<YEAR>-<00001>`.  
- Deduplication via `State.pushUnique()` with lowercase NSID compare.  
- Computes age using `State.computeAge(dob)`; stores in record.  
- Tick update → `State.bumpTick(State.keys.tickAthletesMaster)` to refresh federation UI.  
- `national_id` stored privately; never propagated to public outputs.  

### 🏁 join.html
- Requires `?cid=` param; guarded by `Core.getParam('cid')`.  
- Key mapping:  
  - `entries_staging_<CID>` → competition entry requests  
  - `athletes_tick_<CID>` → refresh signal  
- Verifies NSID exists in `athletes_master`; prevents duplicates in `entries_staging_<CID>`.  
- Appends entry record { nsid, category, note, createdAt }.  

### ⚙️ shared/core & ui usage
- Uses `UI.toast()` for notifications.  
- Relies on State, Core, Lang from shared includes in `/shared`.  

---

## 5️⃣ Data Contracts Observed
| Purpose | Keys Used / Written |
|----------|--------------------|
| Federation registry | `athletes_staging`, `athletes_master`, `nsid_cursor_<FID>`, `tickAthletesMaster` / `athletes_master_tick` |
| Competition entries | `entries_staging_<CID>`, `athletes_tick_<CID>` |
| Private fields | `national_id` (federation-only) |
| Other | local counters (`nsid_cursor_<FID>`) for auto NSID sequence |

---

## 6️⃣ Execution Flow (Step-by-Step)

### Registration flow
1. User opens `register.html` → fills form.  
2. System checks duplicates in `athletes_staging` and `athletes_master`.  
3. If no NSID provided → auto-generate via `nsid_cursor_<FID>`.  
4. Record pushed to `athletes_staging`.  
5. Tick update `athletes_master_tick` fires → Federation approval UIs refresh.  
6. Toast: “Registration submitted. Pending federation approval.”

### Competition join flow
1. Athlete opens `join.html?cid=<CID>`.  
2. Form requires NSID & Category.  
3. Checks NSID exists in `athletes_master`; prevents duplicates in `entries_staging_<CID>`.  
4. Pushes record to `entries_staging_<CID>` and bumps `athletes_tick_<CID>`.  
5. Toast: “Entry submitted. Awaiting federation approval.”

---

## 7️⃣ Status
| Area | Status | Notes |
|------|---------|-------|
| Athlete Home | ✅ Working | Static navigation only |
| Registration Form | ✅ Working (Offline) | End-to-end localStorage pipeline OK |
| Auto NSID Generator | ✅ | Relies on localStorage cursor |
| Join Competition Form | ✅ | Validations + tick signal OK |
| Federation Sync | ⚙️ Partial | Approval workflow depends on federation module |
| Cloud Sync/Auth | ❌ | Not implemented (offline-only) |

---

## 8️⃣ Gaps / Risks
- 🔸 **Key name divergence:** `tickAthletesMaster` vs `athletes_master_tick` — ensure consistent usage.  
- 🔸 **No auth:** Anyone can register or join if they know the URL.  
- 🔸 **No validation of CID:** `join.html` assumes valid competition exists.  
- 🔸 **No federation approval UI feedback:** User cannot see pending/approved status.  
- 🔸 **Duplicate code:** Two register scripts merged in file (older version left intact).  
- 🔸 **No form persistence:** Refreshing clears unsaved data.  

---

## 9️⃣ QA Checklist (Local)
1. Clear localStorage → open `register.html` → register athlete.  
2. Confirm `athletes_staging` array created in localStorage.  
3. Reload → register same NSID → expect duplicate toast.  
4. Open `join.html?cid=TEST1` → submit with valid NSID → check `entries_staging_TEST1`.  
5. Submit same NSID again → expect duplicate toast.  
6. Change DOB → age auto-updates.  
7. Inspect localStorage → ensure `national_id` exists only in staging/master, not in entries.  

---

✅ **Conclusion:**  
Athlete module is fully functional offline with proper data contracts and auto-ID mechanism.  
Next step → audit **Federation Module** or **Competition Module** for approval and promotion flows.
