# 🏃‍♂️ XGAMES ARENA — Athlete Module Audit

## **Files Covered**
- `home.html`
- `register.html`
- `join.html`

---

## **1️⃣ Athlete Home**
- **Purpose:** Dashboard hub for athlete functions.
- **Structure:** Simple grid layout linking to Register, Join, and testing routes.
- **Navigation:**
  - `/modules/athlete/register.html`
  - `/modules/athlete/join.html`
  - (Optional) test routes to federation approval or legacy competition pages.
- **Logic:** None — static links only.
- **Status:** ✅ Fully functional launcher.

---

## **2️⃣ Athlete Registration**
- **Purpose:** Register athlete into staging registry pending federation approval.
- **Key Behaviors:**
  - Auto-calculates **Age** from DOB.
  - Defaults: **FID = MSF**, **Nation = MAS**.
  - Checks duplicate entries across `athletes_staging` and `athletes_master`.
  - **Auto-generates NSID** if missing → `NSID-<FID>-<YYYY>-<00001>`.
  - Writes record to `State.keys.athletesStaging`.
  - Triggers federation refresh with `State.keys.tickAthletesMaster`.
- **Data Privacy:** `national_id` retained only for federation records, excluded from public use.
- **Technical Note:** Contains two nearly identical submit scripts → unify to one canonical handler.
- **Status:** ✅ Ready for production in offline mode.

---

## **3️⃣ Join Competition**
- **Purpose:** Allow registered athletes to join competitions using their NSID.
- **Workflow:**
  - Requires `?cid=` parameter.
  - Validates: NSID exists in `athletes_master`.
  - Prevents duplicates within `entries_staging_<CID>`.
  - Saves `{nsid, category, note, createdAt}` to `entries_staging_<CID>`.
  - Increments `athletes_tick_<CID>` for federation review.
- **UI:** Simple form with dropdown category + notes field.
- **Status:** ✅ Functional and complete for offline entry.

---

## **🔗 Data Contracts**
| Key | Scope | Description |
|------|--------|-------------|
| `athletes_staging` | Global | Pending athletes awaiting federation approval |
| `athletes_master` | Global | Approved athlete registry |
| `nsid_cursor_<FID>` | Global | Sequential NSID cursor |
| `entries_staging_<CID>` | Per-competition | Pending athlete competition entries |
| `athletes_tick_<CID>` | Per-competition | UI/listener tick for athlete updates |
| `tickAthletesMaster` | Global | Refresh trigger for federation view |

---

## **📊 Process Flow (Athlete POV)**
1️⃣ **Register:**
   - Write → `athletes_staging`
   - Await federation approval → moves to `athletes_master`

2️⃣ **Join Competition:**
   - Write → `entries_staging_<CID>`
   - Await federation approval → added to event rosters

---

## **⚠️ Gaps & Enhancements**
- Authentication for athlete/federation roles → ❌ Missing.
- Profile media upload (photo, ID docs) → ❌ Not handled.
- Form logic redundancy → ⚙️ Should consolidate into a single submit handler.

---

### ✅ **Summary**
The **Athlete Module** implements a complete local-first registration and competition entry pipeline. It aligns perfectly with the federation approval flow and uses a consistent storage schema (`State.keys.*`). Only minor cleanup and authentication integration are needed before cloud synchronization.