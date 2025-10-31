# ZAAP — Zero-Ambiguity Architecture Pack

This pack makes the Arena codebase unambiguous across threads, team members, and future audits.

## Contents
- `filemap.json` – definitive map of modules → files → roles.
- `data_contracts.json` – all localStorage keys with readers/writers.
- `routes.json` – every page’s required query params and its next links.
- `sync_matrix.md` – storage channels, event ticks, and subscribers.
- `schemas.md` – canonical JSON schemas: judge_status, reveal, leaderboard.
- (Plus registry, traceability, dependency map, QA, naming, changelog—if requested.)

## Ground Rules
- **Source of truth = code.** These docs reflect *only* what is implemented.
- **IDs only in public artifacts.** No PII in reveal/leaderboard (privacy).
- **Storage namespace:** localStorage with patterned keys like `events_<CID>`.

## Quick Start
1) Read `routes.json` to understand navigation and required params.
2) Scan `data_contracts.json` to see which files write/read each key.
3) Use `sync_matrix.md` to understand cross-tab updates (judge → run console → TV).
4) Run QA from `qa_playbooks.md` to validate end-to-end.

## Modules (high level)
- Athlete (register/join)
- Federation (approve athletes/entries)
- Competition (setup/control/display)
- Run (run_console + judge)
- Broadcast (tv_display + optional tv_scoreboard)
- Core/Shared (core.js, state.js, ui.js, lang.js, sync_local.js)

2) filemap.json
json
Copy code
{
  "core": [
    "core.js",
    "state.js",
    "ui.js",
    "lang.js",
    "sync_local.js"
  ],
  "modules": {
    "athlete": {
      "files": [
        "modules/athlete/home.html",
        "modules/athlete/register.html",
        "modules/athlete/join.html"
      ],
      "writes": [
        "athletes_staging",
        "nsid_cursor_<FID>",
        "entries_staging_<CID>",
        "athletes_master_tick",
        "athletes_tick_<CID>"
      ],
      "reads": [
        "athletes_master"
      ]
    },
    "federation": {
      "files": [
        "modules/federation/approve_athletes.html",
        "modules/federation/approve_entries.html"
      ],
      "writes": [
        "athletes_master",
        "athletes_rejected",
        "athletes_master_tick",
        "athletes_<CID>",
        "athletes_aid_cursor_<CID>",
        "entries_staging_<CID>",
        "athletes_tick_<CID>"
      ],
      "reads": [
        "athletes_staging",
        "athletes_master",
        "entries_staging_<CID>"
      ]
    },
    "competition": {
      "files": [
        "modules/competition/setup.html",
        "modules/competition/setup_new.html",
        "modules/competition/control.html",
        "modules/competition/display.html",
        "modules/competition/leaderboard.html"
      ],
      "writes": [
        "arena_competitions_setup"
      ],
      "reads": [
        "leaderboard_<CID>_<EID>"
      ]
    }
  },
  "pages": {
    "navigation": [
      "pages/athlete_center.html",
      "pages/federation_center.html",
      "pages/competition_center.html",
      "pages/competition_list.html",
      "pages/competition_new.html",
      "pages/competition_home.html"
    ],
    "run_flow": [
      "pages/event_admin.html",
      "pages/heat_select.html",
      "pages/run_console.html",
      "pages/judge.html"
    ],
    "broadcast": [
      "pages/tv_display.html",
      "pages/tv_scoreboard.html"
    ]
  }
}
3) data_contracts.json (keys → desc → writers → readers)
json
Copy code
{
  "athletes_staging": {
    "desc": "Pending athletes awaiting federation approval",
    "writers": ["modules/athlete/register.html", "modules/federation/approve_athletes.html (import)"],
    "readers": ["modules/federation/approve_athletes.html"]
  },
  "athletes_master": {
    "desc": "Approved athletes (global)",
    "writers": ["modules/federation/approve_athletes.html"],
    "readers": ["modules/athlete/join.html", "modules/federation/approve_entries.html", "pages/run_console.html", "pages/judge.html", "pages/tv_display.html"]
  },
  "athletes_rejected": {
    "desc": "Rejected athlete records with timestamps/notes",
    "writers": ["modules/federation/approve_athletes.html"],
    "readers": ["modules/federation/approve_athletes.html"]
  },
  "nsid_cursor_<FID>": {
    "desc": "Per-federation NSID sequence counter",
    "writers": ["modules/athlete/register.html", "modules/federation/approve_athletes.html (auto-gen)"],
    "readers": ["modules/athlete/register.html", "modules/federation/approve_athletes.html"]
  },
  "athletes_master_tick": {
    "desc": "Tick to refresh federation UIs",
    "writers": ["modules/athlete/register.html", "modules/federation/approve_athletes.html"],
    "readers": ["modules/federation/approve_athletes.html", "pages/federation_center.html"]
  },

  "entries_staging_<CID>": {
    "desc": "Pending competition entries (by CID)",
    "writers": ["modules/athlete/join.html", "modules/federation/approve_entries.html (removes on approve)"],
    "readers": ["modules/federation/approve_entries.html", "pages/federation_center.html"]
  },
  "athletes_<CID>": {
    "desc": "Competition roster (AIDs only, no PII)",
    "writers": ["modules/federation/approve_entries.html"],
    "readers": ["pages/run_console.html", "pages/tv_display.html", "pages/judge.html"]
  },
  "athletes_aid_cursor_<CID>": {
    "desc": "Per-competition AID sequence counter",
    "writers": ["modules/federation/approve_entries.html"],
    "readers": ["modules/federation/approve_entries.html"]
  },
  "athletes_tick_<CID>": {
    "desc": "Tick to refresh per-competition UIs",
    "writers": ["modules/athlete/join.html", "modules/federation/approve_entries.html"],
    "readers": ["pages/federation_center.html"]
  },

  "arena_competitions_setup": {
    "desc": "Draft/pending competitions (organizer list)",
    "writers": ["modules/competition/setup_new.html"],
    "readers": ["modules/competition/setup.html"]
  },
  "competitions_active": {
    "desc": "Approved/active competitions (optional list for pages)",
    "writers": ["(future promotion path)"],
    "readers": ["pages/competition_list.html", "pages/tv_display.html"]
  },
  "events_<CID>": {
    "desc": "Event/category definitions for competition",
    "writers": ["(future composer)"],
    "readers": ["pages/event_admin.html"]
  },
  "judges_<CID>": {
    "desc": "Judge panel config (optional)",
    "writers": ["(future composer)"],
    "readers": ["pages/run_console.html"]
  },
  "scoring_<CID>": {
    "desc": "Scoring criteria with weights",
    "writers": ["(future composer)"],
    "readers": ["pages/run_console.html", "pages/judge.html"]
  },
  "heats_<CID>_<EID>": {
    "desc": "Heat shells with status per heat index",
    "writers": ["pages/run_console.html (status updates)"],
    "readers": ["pages/heat_select.html", "pages/run_console.html"]
  },

  "scores_<CID>_<EID>_<HEAT>": {
    "desc": "Judge submissions per heat",
    "writers": ["pages/run_console.html (manual scores)", "pages/judge.html (via judge_status ingest in Run Console)"],
    "readers": ["pages/run_console.html"]
  },
  "judge_status": {
    "desc": "Broadcast packet for single judge submission",
    "writers": ["pages/judge.html"],
    "readers": ["pages/run_console.html (ingest)"]
  },
  "judge_status_tick": {
    "desc": "Signal tick for judge_status",
    "writers": ["pages/judge.html"],
    "readers": ["pages/run_console.html"]
  },

  "reveal": {
    "desc": "Last reveal packet (IDs only) for display",
    "writers": ["pages/run_console.html"],
    "readers": ["pages/tv_display.html", "pages/tv_scoreboard.html"]
  },
  "reveal_tick": {
    "desc": "Tick to push reveal updates",
    "writers": ["pages/run_console.html"],
    "readers": ["pages/tv_display.html", "pages/tv_scoreboard.html"]
  },
  "leaderboard_<CID>_<EID>": {
    "desc": "Leaderboard object {rows:[{rank,aid,final}]}",
    "writers": ["pages/run_console.html"],
    "readers": ["pages/tv_display.html", "modules/competition/leaderboard.html", "modules/competition/display.html"]
  },
  "leaderboard_tick": {
    "desc": "Tick to push leaderboard updates",
    "writers": ["pages/run_console.html"],
    "readers": ["pages/tv_display.html"]
  },

  "display_control_live1": {
    "desc": "Display mode for screen 1 (intro|scoreboard|leaderboard|hide)",
    "writers": ["pages/run_console.html"],
    "readers": ["pages/tv_display.html", "pages/tv_scoreboard.html"]
  },
  "display_control_live2": {
    "desc": "Display mode for screen 2 (intro|scoreboard|leaderboard|hide)",
    "writers": ["pages/run_console.html"],
    "readers": ["pages/tv_display.html", "pages/tv_scoreboard.html"]
  },

  "active_heat": {
    "desc": "Currently running heat context",
    "writers": ["pages/run_console.html (Start)"],
    "readers": ["pages/run_console.html (recovery)"]
  },
  "eventlog_<CID>_<EID>_<HEAT>": {
    "desc": "Humanized event log buffer for a heat",
    "writers": ["pages/run_console.html"],
    "readers": ["pages/run_console.html"]
  }
}
4) routes.json
json
Copy code
{
  "pages/athlete_center.html": {
    "requires": [],
    "links": [
      "modules/athlete/register.html",
      "modules/athlete/join.html"
    ]
  },
  "modules/athlete/register.html": {
    "requires": [],
    "links": []
  },
  "modules/athlete/join.html": {
    "requires": ["cid"],
    "links": []
  },

  "pages/federation_center.html": {
    "requires": [],
    "links": [
      "modules/federation/approve_athletes.html",
      "modules/federation/approve_entries.html",
      "pages/competition_center.html"
    ]
  },
  "modules/federation/approve_athletes.html": {
    "requires": [],
    "links": []
  },
  "modules/federation/approve_entries.html": {
    "requires": ["cid"],
    "links": []
  },

  "pages/competition_center.html": {
    "requires": [],
    "links": [
      "pages/competition_list.html",
      "pages/competition_new.html"
    ]
  },
  "pages/competition_list.html": {
    "requires": [],
    "links": ["pages/competition_home.html?cid=<CID>"]
  },
  "pages/competition_new.html": {
    "requires": [],
    "links": ["pages/competition_home.html?cid=<CID>"]
  },
  "pages/competition_home.html": {
    "requires": ["cid"],
    "links": ["pages/event_admin.html?cid=<CID>&eid=<EID>"]
  },

  "pages/event_admin.html": {
    "requires": ["cid", "eid"],
    "links": ["pages/heat_select.html?cid=<CID>&eid=<EID>"]
  },
  "pages/heat_select.html": {
    "requires": ["cid", "eid"],
    "links": ["pages/run_console.html?cid=<CID>&eid=<EID>&heat=<N>"]
  },
  "pages/run_console.html": {
    "requires": ["cid", "eid", "heat"],
    "links": [
      "pages/judge.html?cid=<CID>&eid=<EID>&heat=<N>&j=J1..J5[&aid=<AID>]",
      "pages/tv_display.html?screen=live1&cid=<CID>&eid=<EID>&heat=<N>",
      "pages/tv_display.html?screen=live2&cid=<CID>&eid=<EID>&heat=<N>"
    ]
  },
  "pages/judge.html": {
    "requires": ["cid", "eid", "heat", "j"],
    "links": []
  },
  "pages/tv_display.html": {
    "requires": ["screen", "cid", "eid"],
    "links": []
  },
  "pages/tv_scoreboard.html": {
    "requires": ["screen", "cid", "eid"],
    "links": []
  }
}
5) sync_matrix.md
markdown
Copy code
# Sync Matrix (Storage/Event Bus)

## Cross-tab Channels
| Key | Emitter | Listeners | Purpose |
|-----|---------|-----------|---------|
| `judge_status` | pages/judge.html | pages/run_console.html | Judge packet (single submission) |
| `judge_status_tick` | pages/judge.html | pages/run_console.html | Force ingest/refresh |

## Display Control + Publish
| Key | Emitter | Listeners | Purpose |
|-----|---------|-----------|---------|
| `reveal` | pages/run_console.html | pages/tv_display.html, tv_scoreboard.html | Current athlete reveal (IDs only) |
| `reveal_tick` | pages/run_console.html | pages/tv_display.html, tv_scoreboard.html | Force reveal update |
| `leaderboard_<CID>_<EID>` | pages/run_console.html | pages/tv_display.html, modules/competition/leaderboard.html | Leaderboard object |
| `leaderboard_tick` | pages/run_console.html | pages/tv_display.html | Force leaderboard refresh |
| `display_control_live1/2` | pages/run_console.html | pages/tv_display.html, tv_scoreboard.html | Switch Intro/Scoreboard/Leaderboard/Hide |

## Refresh Ticks
| Key | Emitter | Listeners | Purpose |
|-----|---------|-----------|---------|
| `athletes_master_tick` | modules/athlete.register, federation.approve_athletes | federation_center | Refresh federation views |
| `athletes_tick_<CID>` | athlete.join, federation.approve_entries | dashboards/displays | Refresh competition views |

6) schemas.md
markdown
Copy code
# Canonical Schemas

## judge_status (from pages/judge.html)
```json
{
  "type": "judge_status",
  "cid": "C1",
  "eid": "E1",
  "heat": "1",
  "judgeId": "J1",
  "athleteId": "A1",
  "scores": { "difficulty": 92, "execution": 88, "flow": 90 },
  "total": 90.00,
  "status": "locked",
  "time": 1730098765123
}
Notes
scores keys = slugged criteria labels (lowercase, underscores).

total provided by judge UI; Run Console can recompute if missing.

reveal (from pages/run_console.html)
json
Copy code
{
  "cid": "C1",
  "eid": "E1",
  "heat": 1,
  "aid": "A1",
  "judgeTotals": [89.50, 90.00, 91.00, 88.75, 90.25],
  "final": 90.10
}
IDs only — no PII.

final = average of judgeTotals (after optional drop-extremes and criteria weighting recompute).

leaderboard_<CID>_<EID> (from pages/run_console.html)
json
Copy code
{
  "rows": [
    { "rank": 1, "aid": "A3", "final": 92.35 },
    { "rank": 2, "aid": "A1", "final": 90.10 },
    { "rank": 3, "aid": "A2", "final": 88.90 }
  ]
}
Sorted DESC by final.

IDs only — display pages map names/flags using athletes_<CID>.

markdown
Copy code

---

# Next steps (pick one)

- **Option A — Generate the rest now:** I’ll output `module_registry.md`, `traceability_register.md`, `dependency_map.md`, `qa_playbooks.md`, `naming_conventions.md`, `changelog_seed.md` in the same copy-ready format.

- **Option B — Lock this core pack first:** You copy/save the six files above, then I proceed with the remaining documents.

Either way, you now have a **complete, unambiguous architecture backbone** that any thread can use without guessing file names, flows, or data contracts.





