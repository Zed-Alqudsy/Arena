# 🪜 XGAMES HEATS SYSTEM — FIRESTORE-READY + PRESET-AWARE BUILD PLAN (v2)

**Objective:** Create a fully-ready Heats System where federations can set up events once, generate heats instantly, and run competitions using proper skateboarding standards (multi-runs, judging presets, advancement rules).  
**Starting Point:** Old Ladder Step 3 complete (Event Admin basic).  
**Status:** Transitioning into new preset-aware, Firestore-ready ladder.

---

## Phase A — Preset & Parameter Foundation
| Step | Task | Output |
|------|------|--------|
| A1 | Create `/shared/presets.js` registry (Olympic Street, Park, X Games, etc.) | JSON object with: discipline, rounds, runsPerRound, tricksPerRound, judges, judgingScale, dropHighLow, advancementTopN |
| A2 | Build lightweight Preset Adapter | Function: `Preset.get(id)` and `Preset.applyTo(event)` (read-only layer, no schema change) |
| A3 | Connect Preset Adapter to `setup_new.html` | Dropdown → auto-fill judging, run time, attempts, rounds (editable) |
| A4 | Save preset snapshot in event object | Store `{preset_id,preset_name,runsPerAthlete,attemptsPerAthlete,scoringFormat}` inside `State.events(cid)` |

---

## Phase B — Setup Layer (Competition & Event Definition)
| Step | Task | Output |
|------|------|--------|
| B1 | Verify competition & event save logic | Ensure correct localStorage keys: `competitions_active`, `events_<CID>` |
| B2 | Extend `setup_new.html` form | Add optional numeric fields: “Runs Per Athlete”, “Tricks Per Round”, “Advancement Rule” |
| B3 | Implement validation (min 3 runs support) | Enforce via UI or Preset (Olympic = 2, X Games = 3+) |
| B4 | Add preview block “Competition Summary” | Show discipline, rounds, judging model, advancement (from preset) |

---

## Phase C — Event Admin Layer (Heats Management)
| Step | Task | Output |
|------|------|--------|
| C1 | Integrate blue header + info cards (✅ done) | Uniform Arena visual identity |
| C2 | Extend with “Heats Overview” card (✅ done base) | Table showing existing heats, button “＋ Add Heat” |
| C3 | Link to `heats_<CID>_<EID>` storage | Create, persist, and reload heat data |
| C4 | Apply preset defaults when adding heat | Use preset’s heat size / seeding / advancement |
| C5 | Add optional “Re-compose Heats” | Re-generate heats using current event preset |
| C6 | Ensure “Choose Heat” button → `heat_select.html` works correctly | Test navigation + parameter passing |

✅ Add these to Phase C
Step	Task	Output
C2a	Show “Preset Summary” (read-only) in Event Admin	Visible preset snapshot (Discipline, Runs/Tricks, Judges, Scoring, Advancement) pulled from ev.preset or preset_snapshot_<CID>; confirms B→C data flow.
C3a	Judges readiness check (non-blocking)	Detect judges_<CID>; show “Judges Ready” tag if present, or a gentle warning if missing — so organizers don’t reach Run Console without a panel. (Planned next.)
Notes on existing steps (clarified)

C4 (apply preset defaults when adding heat) → the heat object should include preset-derived fields, not just name/athletes/status:
runsPerAthlete, tricksPerRound, advancementTopN, scoringFormat, discipline, judgesPanel: [], slots: []. This prepares Run Console to compute scoring later.

---

## Phase D — Heat Select & Run Console (Execution Layer)
| Step | Task | Output |
|------|------|--------|
| D1 | Ensure `heat_select.html` lists all heats properly | Show Heat #, round label, status |
| D2 | Extend `run_console.html` | Support variable runs per athlete; show run counter |
| D3 | Pull preset scoring model | Judges #, scale (0–100), dropHighLow bool |
| D4 | Compute scoring | Average of remaining judges per run, best-of rules |
| D5 | Implement advancement | Top-N athletes auto-tagged “Advance Next Round” |
| D6 | Verify leaderboard / publish flow | Works offline → sync Firestore cleanly |
| D7 | Add “Attach Judges to Heats” logic | Copy `roles[]` from `judges_<CID>` into each heat’s `judgesPanel`; ensure Run Console loads correct judge links |
| D8 | Add athlete slot seeding scaffold | Initialize `slots[]` for each heat using event athletes; prepare for live run tracking |
| D9 | Preset → Judges consistency check | Display non-blocking “⚠ Judges Mismatch – Click Prepare” notice if preset count ≠ stored panel |
| D10 | Validate preset-based scoring flow | Confirm Run Console reads all scoring parameters (runs, tricks, judges, dropHighLow, advancement) from preset snapshot |
| D11 | Validate preset completeness | Confirm all preset categories (Street, Park, etc.) include: runs/tricks, judging panel size, advancement, and scoring rules |
| D12 | Event category mapping | Ensure each event’s division and discipline match its preset discipline type; prevent cross-discipline mismatch |
| D13 | Judging criteria matrix | Verify that `preset.criteria[]` (difficulty, execution, flow, amplitude, etc.) is stored and rendered in Run Console |
| D14 | Heat template integrity | Cross-check each heat against preset template: correct number of athletes, runs, judges, advancementTopN |
| D15 | Officials & roles registry | Confirm that event officials (Head Judge, MC, Timekeeper, Scorer) are registered and linked to `roles_<CID>` |
| D16 | Athlete roster linkage | Verify all registered athletes under `athletes_<CID>` are mapped to heats; warn if unassigned or duplicated |
| D17 | Policies & publishing readiness | Ensure competition policies (retry, rerun, tiebreak) are loaded from preset and visible in Run Console’s info tab |
| D18 | Preset storage audit | Perform one-time verification that all active presets are stored in `preset_snapshot_<CID>` and synced with Firestore (or ready for upload) |
| D19 | Final cross-phase consistency check | Run diagnostic comparing Setup → Event → Run Console data for judges, scoring, athletes, advancement consistency |
| D20 | ✅ “Go-Live” lock-in | When all above validations pass, mark event as ready; lock preset parameters and disable editing to preserve integrity for Phase E (Results & Publishing) |


---

## Phase E — Firestore Readiness & Validation
| Step | Task | Output |
|------|------|--------|
| E1 | Create Firestore schema draft (`heats.md` → JSON spec) | Define collections: `competitions`, `events`, `heats`, `scores` |
| E2 | Map localStorage ↔ Firestore | Key translation chart for offline ↔ online sync |
| E3 | QA: Full Offline Flow | Create → Compose → Run → Publish (no internet) |
| E4 | QA: Firestore Flow | Repeat with Firestore adapter active |
| E5 | Sign-off v1.0 | Final audit + export “Heats System Preset-Ready” build |

---

## Current Position
- ✅ Old Step 3 (Event Admin Basic UI & Navigation) completed.  
- ⏸ Ready to start **Phase A (Preset & Parameter Foundation)**.  
- Firestore integration planned for final phase only.

---

## Phase F — Results, Analytics & Ranking Readiness
| Step | Task | Output |
|------|------|--------|
| F1 | Implement Result Writer | `resultWriter.save()` collects final scores per athlete after each run, storing `{cid,eid,aid,round,heat,run,score,rank}` to `results_master.json` and/or Firestore `results/` collection. |
| F2 | Enable Athlete-Linked Results | Each run record includes `aid` (NSID) to allow cross-event tracking for profiles and rankings. |
| F3 | Create Results Aggregator | Batch process to compile all event/heat/run results into one sortable table (`results_master.json`) for offline use and reporting. |
| F4 | Ranking & Analytics Prep | Define aggregation logic for average score, best run, top placement per athlete → ready for future dashboards. |
| F5 | Testing & Validation | Ensure result data is generated after each heat completion and persists across reloads / syncs to Firestore. |

---

### ✅ Summary
This phase ensures all scores and placements are automatically collected and linkable to athletes, enabling future modules like Athlete Profiles, Federation Rankings, and Performance Analytics.


🧱 Phase G — Setup Data Architecture Upgrade (CID-based Storage)

🧩 Step 4A — CID-Based Setup Storage Upgrade (Firestore-Ready)

Objective:
Refactor the setup save/load flow so every competition has its own localStorage entry (setup_<CID>) for easy sync to Firestore and safer multi-event handling.

Scope:

Applies to setup_new.html, setup.html, and any file using upsertSetup() or reading arena_competitions_setup.

Keeps backward compatibility with existing key.

Tasks:

Create new helper

function saveSetupByCID(model) {
  if (!model?.cid) return;
  localStorage.setItem('setup_' + model.cid, JSON.stringify(model));
  // legacy backup
  const all = JSON.parse(localStorage.getItem('arena_competitions_setup') || '[]');
  const idx = all.findIndex(c => c.cid === model.cid);
  if (idx >= 0) all[idx] = model; else all.push(model);
  localStorage.setItem('arena_competitions_setup', JSON.stringify(all));
}


Replace calls

upsertSetup(model) → saveSetupByCID(model) in Save, Validate, Approve blocks.

Add quick loader

function loadSetupByCID(cid) {
  try { return JSON.parse(localStorage.getItem('setup_' + cid) || 'null'); }
  catch { return null; }
}


Confirm write/read

Run in console after approve:

Object.keys(localStorage).filter(k => k.includes('setup_'))
JSON.parse(localStorage.getItem('setup_<yourCID>'))


Prepare Firestore-ready mapping

Mirror structure:
competitions/{cid}/setup → { ...model }

Future sync functions: uploadSetupToFirestore(cid) and downloadSetupFromFirestore(cid)

QC Checkpoints:
✅ setup_<CID> created after Save/Approve
✅ Legacy arena_competitions_setup still updates
✅ EventAdmin/Heats detect data from per-CID storage
✅ Firestore sync test (optional)

