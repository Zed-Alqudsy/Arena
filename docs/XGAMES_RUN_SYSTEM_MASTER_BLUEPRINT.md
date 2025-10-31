# 🏁 XGAMES RUN SYSTEM — MASTER BLUEPRINT (Pilot Version)

### 📘 Purpose
This document defines the full operational architecture for the **RUN module** of the XGAMES Platform — covering competition flow from setup → run → display → judges.  
It is designed for **Stage 4 Pilot** (3 days from now) and will guide development, wiring, and testing.

---

## 🧩 1️⃣ SYSTEM OVERVIEW

**Goal:** Execute and manage competitions in real-time, from qualifying rounds to finals, across multiple events within a single competition.

**Core Principle:**  
Everything flows from the **Competition Setup** data → stored locally (`competitions_active`, `events_`, `heats_`, etc.) → read dynamically by RUN and Display modules.

---

## 🧱 2️⃣ HIERARCHY FLOW DIAGRAM (Text-Based)

```
COMPETITION SETUP (Admin)
│
├── Competition A (CID_001)
│   ├── Event 1: Inline Freestyle
│   │   ├── Heat 1 – Qualifying
│   │   ├── Heat 2 – Semifinal
│   │   └── Heat 3 – Final
│   │
│   ├── Event 2: Skatecross
│   │   ├── Heat 1 – Qualifying
│   │   ├── Heat 2 – Final
│   │
│   └── Event 3: Slide Jam
│       └── Heat 1 – Final
│
└── Competition B (CID_002)
    └── Event 1: Skateboard Street
        ├── Heat 1 – Qualifying
        └── Heat 2 – Final
```

Each **Heat** → has athletes, judges, scoring rules, and status:
`Not Started / Running / Completed`.

---

## 🎯 3️⃣ USER FLOW MAP

| Stage | Page | Purpose | Source Data | Writes To |
|--------|------|----------|--------------|-----------|
| 1️⃣ | **Setup** (`setup.html`, `setup_new.html`) | Create + approve competition | Manual form | `competitions_active`, `events_`, `heats_`, `judges_`, `athletes_` |
| 2️⃣ | **Run Home (Competition Level)** | List all competitions & events with heat status | `competitions_active`, `heats_` | `heat_status_` |
| 3️⃣ | **Run Console (Heat Level)** | Run specific heat (start, timing, scoring) | `heats_`, `athletes_`, `judges_`, `scoring_` | `scores_`, `heat_status_` |
| 4️⃣ | **Judge Centre (Per Judge)** | Input scores for assigned heat | `active_heat`, `scoring_` | `scores_` |
| 5️⃣ | **Display Centre** | Broadcast results live | `scores_`, `active_heat`, `display_` | — |

---

## ⚙️ 4️⃣ DATA MODEL SUMMARY (Local Storage Keys)

| Key | Example | Description |
|------|----------|-------------|
| `competitions_active` | `[ { cid, name, date, venue, status } ]` | Master list of active competitions |
| `events_<CID>` | `[ { eid, name, rounds } ]` | All events for a competition |
| `heats_<CID>_<EID>` | `[ { heatId, round, athletes, status } ]` | Heat info for each event |
| `judges_<CID>` | `[ { jid, name, role } ]` | Judges assigned to competition |
| `athletes_<CID>` | `[ { aid, name, country } ]` | Registered athletes |
| `scoring_<CID>` | `{ criteria: [...] }` | Scoring rules (from Setup) |
| `scores_<CID>_<EID>_<HEAT>` | `{ results: [...] }` | Judges’ scores per heat |
| `display_<CID>` | `{ showStartList, showLive, slug }` | Display settings |
| `active_heat` | `{ cid, eid, heat }` | Currently running heat |

---

## 🧭 5️⃣ PAGE STRUCTURE OVERVIEW

| Page | Folder | Function |
|------|---------|-----------|
| `setup.html` | `/modules/competition` | Parent competition list |
| `setup_new.html` | `/modules/competition` | Create / edit competition |
| `competition_home.html` | `/pages` | Run Home (shows all heats per competition) |
| `run_console.html` | `/pages` | Heat-level control page |
| `display_centre.html` | `/` | Display management page |
| `judge_view.html` | `/pages` | Lightweight judge scoring view (later) |

---

## 🔄 6️⃣ INTERCONNECTION FLOW

```
Setup → (Approve) → LocalStorage populated
       ↓
Run Home → Reads all competitions & heats
       ↓
Click Heat → Opens Run Console (?cid & ?eid & ?heat)
       ↓
Run Console → Runs timing, collects scores
       ↓
Scores auto-write to localStorage
       ↓
Display Centre → Reads updated scores & renders visuals
```

---

## 🪜 7️⃣ LADDER STEPS TO COMPLETE THE RUN SYSTEM

| Step | Objective | Description | Files Involved |
|------|------------|--------------|----------------|
| **1** | ✅ Verify Setup Output | Ensure all localStorage keys populate correctly after Approve | `setup_new.html` |
| **2** | 🧱 Build Run Home | Create page that lists all competitions and heats; shows status | `competition_home.html` |
| **3** | 🎛️ Upgrade Run Console | Make it fully functional for heat execution: Start, Lock, Reveal | `run_console.html` |
| **4** | 👩‍⚖️ Build Judge View | Simple scoring page per judge (auto-linked via heat) | `judge_view.html` |
| **5** | 🖥️ Integrate Display Centre | Sync results + active heat to broadcast view | `display_centre.html` |
| **6** | 🔄 Add Status Logic | Update heat status (“Running”, “Done”), auto-next heat | shared/state.js |
| **7** | 🧮 Add Scoring Engine | Calculate totals & ranks using `scoring_<CID>` | `run_console.html` |
| **8** | 🏆 Add Leaderboard Sync | Auto-publish winners to Display Centre | `display_centre.html` |
| **9** | ⚙️ Add Admin Sync | Optional Firestore mirror for cloud use | (future) |
| **10** | 🧹 QA Pilot Version | Test full flow locally (create → run → score → display) | All pages |

---

## 🧩 8️⃣ DATA FLOW LOGIC PER ACTION

| Action | Trigger | Affects |
|--------|----------|---------|
| **Approve & Activate** | in Setup | populates base data keys |
| **Open Competition** | from Run Home | reads events + heats |
| **Start Heat** | in Run Console | sets `active_heat`, marks `Running` |
| **End Heat / Reveal** | in Run Console | saves scores, marks `Completed` |
| **Judge Submit** | in Judge View | updates `scores_` |
| **Display Update** | auto / manual | shows scores from latest `scores_` key |

---

## 🔐 9️⃣ RULES AND CONSTRAINTS

1. **No manual heat creation** outside Setup — structure fixed once Approved.  
2. **Status updates** must flow top-down (Setup → Run → Display).  
3. **Display reads only**, never writes.  
4. **Judge inputs isolated**, cannot modify event data.  
5. **Competition data must always be keyed by CID → EID → HEAT**.

---

## 🧭 10️⃣ FUTURE EXPANSION POINTS (Post Pilot)

| Area | Enhancement |
|------|--------------|
| Firestore sync | Sync all localStorage keys online for multi-device use |
| Judge authentication | Assign judge login / auto heat loading |
| Live scoring websocket | Real-time update broadcast |
| Auto advancement | Generate next rounds based on ranks |
| Multi-display zones | Assign each display to specific event or round |
| Analytics | Auto summary after each heat or event |

---

## 🗂️ 11️⃣ OUTPUT EXPECTATIONS FOR PILOT

| Deliverable | Description | Must Work |
|--------------|--------------|-----------|
| Setup → Run Connection | Create → Approve → View in Run | ✅ |
| Run Home | Lists heats, shows statuses | ✅ |
| Run Console | Runs a heat, displays athletes/judges | ✅ |
| Display Centre | Shows leaderboard live | ✅ |
| Judge View (Optional) | Submits score | 🟡 optional for pilot |

---

## ⚡ FINAL SUMMARY

- **Competition Setup** is the “blueprint stage.”  
- **Run Home** is the “control lobby.”  
- **Run Console** is the “engine room.”  
- **Display Centre** is the “public face.”  
- **Judge View** is the “operator interface.”

Everything else connects through structured localStorage keys (`cid → eid → heat`), ensuring no loose data flow.
