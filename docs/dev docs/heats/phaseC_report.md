# Phase C – Event Admin Layer (Heats Management) Report

## ✅ Phase C Progress Summary

### **Completed Milestones**
| Step | Accomplishment | Notes |
|------|----------------|-------|
| C1 | Blue header + event info cards integrated | Visuals unified with Arena identity |
| C2 | Heats Overview card added + “＋ Add Heat” logic verified | Renders existing heats, supports dynamic creation |
| C3 | `heats_<CID>_<EID>` link confirmed | LocalStorage create/persist/reload cycle validated |
| C4 | Preset defaults applied | Heats inherit discipline, runs, tricks, advancement, scoring format |
| C5 | Judges seeding function added | “Prepare Judges” button now creates `judges_<CID>` from preset |
| C6 | Heats metadata visible | Displays discipline/runs/tricks/advancement/judges count badges |
| C7 | Preset snapshot read logic verified | `getPresetSnap()` and `State.getJSON('preset_snapshot_<CID>')` confirmed |
| C8 | Data flow B → C validated | Competition Setup → Event Admin → Heats structure fully functional |

---

## ⚠️ Outstanding / Pending for Phase C
| Area | Task | Intent |
|------|------|--------|
| Judges Attach (C5b) | Add “Attach Judges” button to copy `roles[]` into each heat’s `judgesPanel` | Complete judges–heats linkage for Run Console |
| Athlete Slot Seeding (C6) | Create safe placeholder logic for `slots[]` (athletes per heat) | Prepare for Phase D Run Console integration |
| UI Indicator | Add non-blocking “⚠ Judges Mismatch” notice if preset ≠ stored panel size | Avoid confusion until Setup refactor done |
| Documentation | Update Heats Manual → v3 with preset inheritance and judge logic | Keep developer reference aligned |

---

## 💬 Key Discussion Outcomes
1. **Single Source of Truth:** Preset must define judges, scoring, runs, tricks, advancement – legacy form will be retired.  
2. **Timing:** Don’t remove old form in Phase C (avoid breaking Run Console).  
3. **Action Deferred:** Full removal of legacy judges/scoring UI and code scheduled for **end of Phase D**, once Run Console reads directly from preset.  
4. **Interim Rule:** Preset overrides judges count only when “Prepare Judges” is clicked — safe shim until Phase D lock-in.

---

## 📅 Added Task for End of Phase D – Preset Unification Cleanup
| Step | Task | Description |
|------|------|-------------|
| D-Final | **Deprecate Legacy Judges and Scoring Forms in setup_new.html** | Remove manual fields for judge count, weights, and scoring type; auto-generate `judges_<CID>` and `scoring_<CID>` from preset. This creates a single, preset-driven parameter system for all phases. |

---

### 📘 Next Immediate Actions (when you resume)
1. Implement **Step 5B – Attach Judges to Heats**.  
2. Add Athlete slot placeholders for Phase D testing.  
3. Keep legacy Setup forms intact until Run Console reads preset parameters.
