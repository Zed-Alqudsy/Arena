# 📚 MASTER INDEX — ZED XGAMES DOC SET

**Project Goal (1 para):** Build a modular competition platform where **Athletes register**, **Federations approve**, **Competitions run**, **Judges score**, and **Displays show live results**. For speed, we **reuse working legacy pages** for Run & Displays while building a clean skeleton for Athlete / Federation / Competition modules.

## Always Read First
- 00_INIT_README_FIRST.md

## Architecture & Contracts
- 01_ARCH_MAP.md
- 02_WIRING_PLAN.md
- 03_DATA_CONTRACTS.md
- 04_STORAGE_KEYS.md
- 05_REUSE_MATRIX.md

## Module Playbooks
- 10_ATHLETE_PLAYBOOK.md
- 11_FEDERATION_PLAYBOOK.md
- 12_COMPETITION_PLAYBOOK.md
- 13_JUDGE_PLAYBOOK.md
- 14_DISPLAYS_PLAYBOOK.md

## Execution
- 90_RUNBOOK.md

## Current Status (update each session)
- Status: Skeleton pages created; wired via Master Hub; legacy pages listed.
- Next 3 Actions:
  1) Wire Athlete → Federation approval lists (pending → master).
  2) Wire Athlete Join → `competition_entries_{cid}` + approval to `athletes_{cid}`.
  3) Add Display selector in new control pointing to existing display pages.

## Quick Links (local)
- Master Hub: `/modules/master/home.html`
- Legacy Centre: `/modules/master/competition_legacy.html`
