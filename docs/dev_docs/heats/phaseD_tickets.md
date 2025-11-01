# 🧭 Tower-Control : Phase D Implementation Tickets (Batch #1 – D1 to D10)

---

## 🎯 D1 — Heat Select Logic (Preset-Driven)
**Objective:**  
Ensure `heat_select.html` reads `runsPerAthlete`, `judges`, `dropHighLow`, `scoringFormat` from `preset_snapshot_<cid>` (not legacy rules).  
**Deliverable:**  
Audit and patch read-paths to pull data from preset.  
**Verification:**  
Inspect console for matching preset values.

---

## 🎯 D2 — Run Console Launch & Heat Slot Integrity
**Objective:**  
Confirm the “Open Run Console” link passes `cid,eid,heat` consistently and the target heat has valid `slots[]`.  
**Deliverable:**  
If empty, auto-seed from athlete IDs and preserve order.  
**Verification:**  
Each Run Console heat shows accurate athlete slots.

---

## 🎯 D3 — Manual Score Normalization
**Objective:**  
Unify manual score writes with judge submissions into `score_<cid>_<eid>_<heat>` using `jid/aid/timestamp`.  
**Deliverable:**  
Mirror judge submission structure for manual saves.  
**Verification:**  
Console shows identical “submitted” count (5/5 etc.).

---

## 🎯 D4 — Drop High/Low & Preset Rule Sync
**Objective:**  
Ensure Final Score computation respects `dropHighLow` and `scoringFormat` from preset.  
**Deliverable:**  
Refactor score averaging logic to use preset parameters.  
**Verification:**  
Run Console displays accurate Final Score.

---

## 🎯 D5 — Advancement Marker
**Objective:**  
Apply `snap.advancementTopN` to mark top N athletes and write `advancement_<cid>_<eid>_<round>` IDs.  
**Deliverable:**  
Add advancement function in Run Console or Leaderboard.  
**Verification:**  
Top N athletes receive ✓ marker in UI.

---

## 🎯 D6 — Leaderboard & Publish
**Objective:**  
Publish Leaderboard using ID-only rows and recompute scores from preset weights.  
**Deliverable:**  
Integrate `publishReveal()` and `publishLeaderboard()` with display listeners.  
**Verification:**  
Leaderboard refreshes automatically after reveal.

---

## 🎯 D7 — Judges → Heats Mapping
**Objective:**  
Copy judges list from `judges_<cid>` into each heat’s `judgesPanel`.  
**Deliverable:**  
Each heat object shows correct panel roles and count.  
**Verification:**  
Console lists the same judges for each heat.

---

## 🎯 D8 — Athlete Slot Seeding
**Objective:**  
Auto-populate `slots[]` for new heats from `athletes_<cid>`.  
**Deliverable:**  
Every new heat contains athlete IDs sorted by entry.  
**Verification:**  
Heat slot tables show athlete names in order.

---

## 🎯 D9 — Judges Mismatch Badge (Verified)
**Objective:**  
Show ⚠ badge if preset and store judges count differs.  
**Deliverable:**  
Retain non-blocking badge logic and persist state across reloads.  
**Verification:**  
Badge appears only when preset judges ≠ panel size.

---

## 🎯 D10 — Preset-Based Scoring Flow
**Objective:**  
Hydrate Run Console with `scoringFormat`, `runsPerAthlete`, `dropHighLow` values.  
**Deliverable:**  
Bind display controls and total calc to preset snapshot.  
**Verification:**  
Manual scoring and display match preset rules.

---

### 📋 Batch Summary

| Status | Count |
|:-------|:------:|
| Tickets | 10 |
| Verification | ✅  (Each ticket verified via console and UI audit) |

---

📌 **Notes:**  
This batch focuses on execution-layer reliability (preset-driven logic, scoring sync, advancement).  
Subsequent batches (D11–D20) will address discipline validation, criteria UI, and cross-phase locks.
