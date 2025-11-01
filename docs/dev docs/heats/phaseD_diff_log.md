# Phase D Implementation Loop #1 — Diff Log

- `pages/heat_select.html`
  - Reads heat metadata from `heats_<cid>_<eid>` shell, shows round labels/status, and links by heat ID.
- `pages/event_admin.html`
  - Attaches prepared judge roles to each heat, seeds slots from the event roster, and stamps preset defaults (runs, attempts, advancement, drop-high/low, scale).
- `pages/run_console.html`
  - Adds run counter UI + navigation, preset-backed scoring config, per-run score storage, standings/advancement table, and preset-aware leaderboard publishing.
  - Stores heat progress/advancers back into heat snapshots and normalizes judge panels/links with the attached roles.
- Documentation: added `phaseD_loop1_report.md` and `phaseD_diff_log.md` capturing Loop #1 outcomes and change summary.
