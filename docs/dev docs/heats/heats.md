Ladder Steps — “Heats System (Firestore-ready)”

Confirm Routing (no breakage)

Flow: competition_list → competition_home → event_admin → heat_select → run_console. Ensure params cid,eid propagate. 

competition_list

 

event_admin

 

heat_select

 

run_console

Lock Setup Template Fields (source-of-truth)

Use existing Heats Template: Default Heat Size, Seeding Rule, Advancement Rule. Keep current write as shell to heats_<CID>_<EID>. 

setup_new

 

setup_new

Add “Heats Overview / Setup” page (between Event Admin → Heat Select)

New page lists stages (Qualifier/Semi/Final), derives heats from roster+template if empty, allows simple reorder, and writes populated heats_<CID>_<EID>.heats[]. (Heat Select then only lists what exists.) 

event_admin

 

heat_select

Composer Utility

composeHeats(cid,eid,{heatSize,seedRule}) → groups athletes_<CID> into heats and writes heats_<CID>_<EID>. Keep IDs only. 

setup_new

Run Console — Attempts Model (per heat)

Read heats_<CID>_<EID>; for selected heat index persist runs to scores_<CID>_<EID>_<HEAT>. Keep existing reveal/leaderboard/display behaviors. 

run_console

 

zaap

Publish (Stage Leaderboard)

On publish, compute best-of per athlete from scores_* and write leaderboard_<CID>_<EID> (+tick). TVs already listen. 

run_console

 

zaap

Advance to Next Stage

Apply Advancement Rule (e.g., top-N) to generate next stage’s heats (heats_<CID>_<EIDnext>). Redirect back to Heats Overview. (No change to judge/TV pages.) 

setup_new

Storage Adapter (Firestore-ready)

Introduce Storage.get/set used only by new composer/advance code; today maps to localStorage; later to Firestore (collections below). Keep existing State.* calls untouched elsewhere. 

zaap2

QA Playbook

Seed comp → derive heats → run one heat (3 attempts) → publish → verify TVs and leaderboard → advance to Semi → verify new heats exist. Uses current keys/ticks. 

zaap2

 

zaap

Working Manual — Heats Setup & Run (Zero-ambiguity)
A) Files & Routes (where things live)

Competition List: /pages/competition_list.html → opens competition home with cid. 

competition_list

Event Admin: /pages/event_admin.html?cid=&eid= → hub → “Choose Heat”. 

event_admin

Heat Select: /pages/heat_select.html?cid=&eid= → lists heats, links to Run Console. Reads heats_<CID>_<EID>. 

heat_select

Run Console: /pages/run_console.html?cid=&eid=&heat= → runs one heat. Reads/writes keys below. 

run_console

B) Data Keys (localStorage today; Firestore later)

Roster: athletes_<CID> — input to composer. (Produced by federation/entries approval/setup.) 

zaap2

 

setup_new

Heats: heats_<CID>_<EID> — { defaultSize, seeding, advancement, heats: [] } (template shell from setup); composer populates .heats[]. 

setup_new

Scores: scores_<CID>_<EID>_<HEAT> — per-heat judge submissions / manual scores. 

zaap

Run Bus: judge_status(+tick) → ingested by Run Console. 

zaap

Reveal/TV: reveal(+tick), display_control_live1/2. 

zaap

 

zaap

Leaderboard: leaderboard_<CID>_<EID>(+tick) — best-of per athlete (stage leaderboard). 

zaap

Heat Status / Active: active_heat, eventlog_<CID>_<EID>_<HEAT>. 

zaap

C) Source-of-Truth Inputs (from Setup)

In setup_new.html:

Heats Template: Default Heat Size, Seeding Rule, Advancement Rule. 

setup_new

Writes shell to heats_<CID>_<EID> for each event created. 

setup_new

D) Stage/Heats Model

Stages: Qualifier → Semi → Final (names can be stored in heats object).

Heat Record: heats_<CID>_<EID>.heats[] = [{ id, name, status, slots:[{lane,aid}], attemptsPerAthlete }] (IDs only).

Run Console reads heats_<CID>_<EID> and athletes_<CID>, indexes by heat param to show athletes and status. 

run_console

E) Attempts & Scoring

Attempts captured per athlete per heat to scores_<CID>_<EID>_<HEAT>; final per attempt computed with current computeFinal logic (supports drop-extremes). 

run_console

On Publish Leaderboard, reduce to best-of per athlete and write leaderboard_<CID>_<EID> (+tick). TVs pick it up. 

run_console

 

zaap

F) Advancement

Parse Advancement Rule (e.g., “top-12 advance”). Select top-N from stage leaderboard, generate next stage heats under the next eid (or same eid with stage tag) and write new heats_*. Return to Heats Overview. 

setup_new

G) Storage Adapter (for Firestore later)

Create Storage.get(key) / Storage.set(key,obj) used by composer/advance (keep legacy pages on State/LS).

Firestore mapping (later):

competitions/{cid}/events/{eid}/heats ⇄ heats_<CID>_<EID>

competitions/{cid}/events/{eid}/scores/{heat} ⇄ scores_<CID>_<EID>_<HEAT>

competitions/{cid}/events/{eid}/leaderboard ⇄ leaderboard_<CID>_<EID>

bus/{cid} document: reveal, reveal_tick, display_control_live1/2, leaderboard_tick, judge_status(_tick)
(Same semantics/ticks as local.) 

zaap2

 

zaap

H) Page Responsibilities (who reads/writes what)

event_admin: param validation, link to Heats. 

event_admin

heats_overview (new): derive, reorder, persist heats_<CID>_<EID>. (Bridges setup→run.)

heat_select: list existing heats and open Run Console (no writes). 

heat_select

run_console: conduct one heat; writes scores, reveal, leaderboard, status/logs. 

run_console

 

run_console

I) QA Checklist (deterministic)

Create/approve competition in setup; confirm shell heats_<CID>_<EID> created. 

setup_new

Open Heats Overview and click Derive Heats → verify .heats[] is populated.

Open Heat Select → list equals derived heats. 

heat_select

Run Heat 1 with 3 attempts → verify scores_* rows appear and Publish Leaderboard works. 

zaap

 

run_console

TVs: set display mode; verify reveal/leaderboard update by ticks. 

zaap

 

zaap

Click Advance → confirm next stage heats written; overview shows new stage.