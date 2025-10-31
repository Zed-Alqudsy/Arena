# ⚖️ Judge Console Audit (PSR) — pages/judge.html

> Scope: Phase 1 — factual audit, no assumptions or rewrites.

---

## 1️⃣ Files Covered
- `/pages/judge.html`:contentReference[oaicite:0]{index=0}

---

## 2️⃣ Purpose & Role
The **Judge Console** is the scoring interface used by individual judges during a live competition heat.  
It allows a judge to:
- Input numeric scores for defined criteria (Difficulty, Execution, Flow, etc.).
- Auto-compute weighted totals.
- Submit (Lock & Submit) a final score for a single athlete in a single heat.
- Emit results into the localStorage broadcast channel (`judge_status` + `judge_status_tick`) for the **Run Console** to ingest in real time.

Each judge’s tab operates independently but communicates locally through browser storage events.

---

## 3️⃣ Functional Breakdown

| Zone | Function | Notes |
|------|-----------|-------|
| **Mast Header** | Sticky top bar showing Judge ID, Athlete ID/Name, timer | Keeps judge context visible during scoring |
| **Criteria Fields** | Auto-generated numeric inputs (0–100) for each criterion | Pulled from `scoring_<cid>`; defaults to Difficulty / Execution / Flow |
| **Total Badge** | Large live-updating total | Weighted average preview before submission |
| **Submit Button** | “Lock & Submit” — validates, confirms, writes `judge_status` packet | Disables UI after submit |
| **Status Message** | Shows timestamp and submission confirmation | Simple local log |
| **Unload Guard** | Warns if judge tries to close tab before submitting | Browser prompt |

---

## 4️⃣ Underlying Logic (Execution Flow)

### 4.1 Parameter Parsing
```js
const p = new URLSearchParams(location.search);
cid  = p.get('cid');
eid  = p.get('eid');
heat = p.get('heat');
jid  = p.get('j');
aid  = p.get('aid');
If any are missing, the page still loads but may show “—” placeholders.

4.2 Athlete Name Lookup
js
Copy code
athletes_<cid>  →  [{ aid, name }]
Resolves aid → aname for mast display:

yaml
Copy code
Judge: J1   |   Athlete: Ali ( A1 )
Fallback: displays aid if name not found.

4.3 Scoring Criteria
Reads scoring_<cid> from localStorage.
If missing, builds default:

json
Copy code
{
  "criteria":[
    {"label":"Difficulty","weight":1},
    {"label":"Execution","weight":1},
    {"label":"Flow","weight":1}
  ]
}
For each criterion → creates <label> + <input type=number> (0-100 range).
Validation clamps values and recomputes total live.

4.4 Computation
Weighted average:

js
Copy code
total = Σ(score_i × weight_i) / Σ(weight_i)
Displayed in .total-badge as Total: 99.50.

Live update via input listeners with 0–100 clamping.

4.5 Submission Workflow
When “Lock & Submit” clicked:

Validate all fields numeric and 0–100.

Compute final total.

Confirm prompt (confirm() browser).

Construct packet:

json
Copy code
{
  "type":"judge_status",
  "cid":"C1",
  "eid":"E1",
  "heat":"1",
  "judgeId":"J1",
  "athleteId":"A1",
  "scores":{"difficulty":92,"execution":88,"flow":90},
  "total":90.00,
  "status":"locked"
}
Write to:

js
Copy code
localStorage.setItem('judge_status', JSON.stringify(pkt));
localStorage.setItem('judge_status_tick', String(Date.now()));
Disable all fields + button (lockUI());
stop timer; show Submitted at HH:MM:SS.

4.6 Cross-Tab Integration
The Run Console (in another tab) listens for:

judge_status → ingest packet into scores_<CID>_<EID>_<HEAT>

judge_status_tick → refresh table / update log

No direct fetch or network calls; purely localStorage based real-time bus.

4.7 Timer
Starts on load → updates every 250 ms.
Simple stopwatch to indicate active scoring session.

4.8 Unload Guard
Before unload:

js
Copy code
if (!submitted) { e.preventDefault(); e.returnValue = ''; }
Prevents accidental tab closure before submit.

5️⃣ Data Contracts Observed
Key	Purpose	R/W	Source Module
athletes_<cid>	Roster for name lookup	Read	Federation / Competition Setup
scoring_<cid>	Criteria labels + weights	Read	Setup-New
judge_status	Judge packet broadcast	Write	Judge Console
judge_status_tick	Timestamp signal for Run Console	Write	Judge Console

6️⃣ Execution Flow (Summary)
Judge opens URL with cid/eid/heat/j/aid.

Page builds criteria inputs from scoring_<cid>.

Judge enters scores (0–100); Total badge updates live.

Click Lock & Submit → confirm → emit judge_status.

UI locks; timestamp displayed; Run Console detects and updates heat table.

Tab safe to close.

7️⃣ Status Checklist
Component	Status	Notes
Criteria auto-load	✅	Fully dynamic
Weighted compute	✅	Live preview
Submission emit	✅	LocalStorage packet
Timer display	✅	Real-time
Validation	✅	0–100 range check
Lock after submit	✅	UI disabled
Cross-tab signal	✅	Via judge_status_tick
Network sync	❌	None (local-only)
Error recovery	⚙️	Relies on browser storage
Auth guard	❌	Open URL access

8️⃣ Gaps / Risks
No authentication → anyone with URL can submit scores.

Single write channel → later judge overwrites same judge_status.

No confirmation back-channel → judge does not know if Run Console received packet.

No auto-retry on storage collision.

Criteria inconsistency possible if scoring_<cid> modified mid-heat.

9️⃣ QA Checklist (Local Test)
Set up in console:

js
Copy code
localStorage.setItem('scoring_C1', JSON.stringify({
  criteria:[{label:'Difficulty',weight:1},{label:'Execution',weight:1},{label:'Flow',weight:1}]
}));
localStorage.setItem('athletes_C1', JSON.stringify([{aid:'A1',name:'Ali'}]));
Open judge.html?cid=C1&eid=E1&heat=1&j=J1&aid=A1.

Enter scores 90/85/92 → Total = 89.00.

Click Lock & Submit → confirm.

Verify in console:

js
Copy code
JSON.parse(localStorage.getItem('judge_status'))
JSON.parse(localStorage.getItem('judge_status_tick'))
Run Console should ingest and display A1 score.

Reload judge tab → fields locked and timestamp shown.

🔟 Traceability Register
Function	Purpose	Keys Affected
computeTotal()	Weighted score calc	—
refreshTotal()	UI update	—
lockUI()	Disable inputs + timer stop	—
btn.onclick()	Validate + emit packet	judge_status, judge_status_tick
beforeunload handler	Safety prompt	—

✅ Conclusion
The Judge Console is a self-contained, offline-ready scoring terminal.
It reliably generates and transmits a normalized judge_status packet used by the Run Console.
While lightweight and responsive, it depends entirely on localStorage integrity and lacks access control — suitable for prototype or controlled LAN deployments.