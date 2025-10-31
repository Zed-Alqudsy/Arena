♻️ REUSE MATRIX (Legacy ↔ New)
| Area             | Existing                | Reuse? | Why                                | New Target                                                 |
| ---------------- | ----------------------- | ------ | ---------------------------------- | ---------------------------------------------------------- |
| Run Console      | /pages/run_console.html | YES    | Already functional                 | modules/competition/control.html (links to legacy for now) |
| Heat Select      | /pages/heat_select.html | YES    | Works today                        | Later embed selector in new Control                        |
| Display Centre   | /display_centre.html    | YES    | Proven multi-display entry         | Keep, add selector button in new Control                   |
| Scoreboard       | /scoreboard.html        | YES    | Stable renderer                    | Keep                                                       |
| Leaderboard      | /leaderboard.html       | YES    | Stable renderer                    | Keep                                                       |
| Intro            | /intro.html             | YES    | Polished                           | Keep                                                       |
| Setup Wizard UI  | /pages/competition_*    | PART   | Use list + home now, rebuild later | modules/competition/setup.html (links now)                 |
| Athlete Portal   | N/A (new)               | NEW    | Needed for registration & join     | modules/athlete/*                                          |
| Federation Panel | N/A (new)               | NEW    | Approvals & gating                 | modules/federation/*                                       |
