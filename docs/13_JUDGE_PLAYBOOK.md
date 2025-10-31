⚖️ JUDGE PLAYBOOK
Identity

Panel URL param: ?j=J1..Jn

Judge list lives in judges_{cid}

Actions

Input criteria (difficulty, execution, flow) per athlete.

Lock → send via SyncLocal.send('judge_status', { judgeId, status:'locked', scores }).

Admin Expectations

Admin receives statuses, calculates totals (rules.js), and reveals to displays.

Undo / re-reveal updates displays.