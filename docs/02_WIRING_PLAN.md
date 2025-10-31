# 🔗 WIRING PLAN (Navigation & Routes)

## Hubs
- Master Hub → `/modules/master/home.html`
- Legacy Centre → `/modules/master/competition_legacy.html`

## Athlete Module
- Home → `/modules/athlete/home.html`
  - Register → `/modules/athlete/register.html`
  - Join → `/modules/athlete/join.html`

## Federation Module
- Approve Athletes → `/modules/federation/approve_athletes.html`
- Approve Entries → `/modules/federation/approve_entries.html`

## Competition Module (New)
- Setup (placeholder with links to legacy) → `/modules/competition/setup.html`
- Control (skeleton + links to legacy run & displays) → `/modules/competition/control.html`
- Display (skeleton) → `/modules/competition/display.html`
- Leaderboard (skeleton) → `/modules/competition/leaderboard.html`

## Legacy (Existing)
- New Competition → `/pages/competition_new.html`
- Competition List → `/pages/competition_list.html`
- Competition Home → `/pages/competition_home.html`
- Event Admin → `/pages/event_admin.html`
- Heat Select → `/pages/heat_select.html`
- Run Console → `/pages/run_console.html`
- Display Centre → `/display_centre.html`
- Scoreboard → `/scoreboard.html`
- Leaderboard → `/leaderboard.html`
- Intro → `/intro.html`

## URL Params (expected)
- `?cid=...` competition id
- `?eid=...` event id
- `?heat=...` heat name/id
- Judges panel: `?j=J1..Jn`