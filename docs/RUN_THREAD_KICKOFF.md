# 🧭 XGAMES RUN THREAD KICKOFF GUIDE

### Purpose
This document is used at the start of every new XGAMES thread to ensure no loss of context, consistent execution, and stable memory across threads.

---

## 🪜 1️⃣ THREAD INIT TEMPLATE

Copy and paste this block into your first message in each new thread:

```
[THREAD INIT]
Load both uploaded docs as system reference:
1) XGAMES_RUN_SYSTEM_MASTER_BLUEPRINT.md
2) XGAMES_COMPETITION_SETUP_DEEP_DIVE.md

Objective (today): <one specific step, e.g. "Build Run Home Page">

Constraints:
- Do NOT change storage key names (CID/EID/HEAT).
- Read-only pages must not modify arena_competitions_setup.
- If a new data key or contract is needed, propose it first and update the blueprints before coding.

Deliverables:
- What changed (summary)
- Where to paste (file + exact line)
- Keys read/written
- 3 test steps to verify in browser
[/THREAD INIT]
```

---

## ⚙️ 2️⃣ ONE-STEP PIPELINE

- Only one deliverable per session.  
- GPT provides: **exact paste**, **read/write keys**, **3 verification steps**.  
- Confirm working → move to next step.

---

## 🔒 3️⃣ DON'T BREAK LIST (Core Data Contracts)

| Type | Key / Example | Rule |
|------|----------------|------|
| Competition | `competitions_active` | Approved competitions only |
| Events | `events_<CID>` | Event metadata per competition |
| Heats | `heats_<CID>_<EID>` | Each event's heats |
| Judges | `judges_<CID>` | Panel setup |
| Athletes | `athletes_<CID>` | Registered participants |
| Scoring | `scoring_<CID>` | Criteria array (added on Approve) |
| Scores | `scores_<CID>_<EID>_<HEAT>` | Judge input results |
| Active Heat | `active_heat` | `{ cid, eid, heat }` currently running |
| Display | `display_<CID>` | Live display config |

🚫 Never modify `arena_competitions_setup` outside Setup.  
Only `setup_new.html` writes to it.

---

## ✅ 4️⃣ DEFINITION OF DONE (Per Task)

| Area | Must Prove |
|------|-------------|
| Data | Page shows correct values from correct keys |
| Safety | No new keys introduced silently |
| Testing | 3-step test passes (browser) |
| Docs | Changes logged in blueprint or changelog section |

---

## 🧩 5️⃣ CHANGE LOG FORMAT

Append this to the bottom of `XGAMES_RUN_SYSTEM_MASTER_BLUEPRINT.md` after each step.

```
[CHANGE LOG]
2025-10-18 — Added scoring_<CID> on Approve (criteria[] for Judge/Run).
2025-10-18 — Added Run button from setup.html → run_console.html with cid/eid/heat.
```
Add future updates as new dated lines.

---

## 🧠 6️⃣ SAFETY CHECKS (BEFORE/AFTER EACH TASK)

**Before**
1. Confirm which keys are being read/written.  
2. Confirm file and function name to edit.

**After**
1. Verify localStorage keys exist and updated correctly.  
2. Confirm page shows expected content.  
3. No redirect or crash on refresh.

---

## 🧭 7️⃣ THREAD FLOW SUMMARY

| Step | Description | Output |
|------|--------------|---------|
| INIT | Upload docs + paste init template | Confirmed context |
| BUILD | Execute 1 task | Working file changes |
| VERIFY | Run browser test | Pass/fail summary |
| LOG | Update blueprint + changelog | Updated doc |
| RESET | Start next thread cleanly | Stable state |

---

**Keep this file next to your 2 blueprints and upload all 3 for every new module or rebuild.**
