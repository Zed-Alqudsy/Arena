# 🧭 ZED XGames Pilot Platform – Stage 1 : Pre-Build Manual  
*(For comparison with the current platform before actual building)*  

## 🔰 Purpose of This Document
This document defines the **intended structure, logic, and flow** for the pilot version of the XGames system.  
It is **not a coding manual** — it sets the direction before we compare it with the current working platform.  

After this, we will:  
1. **Compare** this pre-build plan against the existing system.  
2. Identify what already works, what is missing, and what needs simplifying.  
3. Produce the **Final Build Manual (Stage 3)** — only after alignment.

## 🎯 Pilot Objective
Create a **working but simple pilot system** that demonstrates the **complete flow** from:

> **Athlete Registration (NSID)** ➜ **Event Entry** ➜ **Competition Setup** ➜ **Competition Run and Scoring**

The pilot must:
- Function **correctly end-to-end** (data and flow).  
- Stay **lean and easy to manage** — no heavy fixes or complex features.  
- Be the **foundation** for future expansion and automation.

## 🧱 System Overview

### 1️⃣ Platform A – Athlete & Event Registration
Handles athlete identity (NSID) and event participation.

### 2️⃣ Platform B – Competition Setup & Run
Handles event structure, judging configuration, heat management, and scoring.

Both platforms are connected through a shared **data adapter** so that approved athletes automatically appear in event setup and competition stages.

## ⚙️ Platform A – Athlete & Event Registration

### ✳️ Purpose
To manage two related processes:
1. **NSID Registration:** athletes create or update their national-style ID profiles.  
2. **Event Registration:** approved athletes sign up for competitions already listed by the federation.

### 👥 Users
- **Athletes:** create profiles, apply for events, check statuses.  
- **Federation/Admin:** approve NSID applications, accept event entries, assign bibs.

### 🗺️ Functional Flow
1. Athlete visits the **Athlete Home** page.  
   - Can *register for NSID* or *register for event* (only after NSID approval).  
2. Federation reviews **Pending NSID** applications and approves or rejects them.  
3. Once approved, the athlete can see **Open Events** and register for one.  
4. Federation reviews **Event Entries**, accepts or wait-lists athletes, and assigns bib numbers.  
5. Accepted athletes are visible in the **Competition Setup** stage.

### 📋 Key Data Elements
- **Athlete Profile:** ID, NSID, name, team, category, status (draft/submitted/approved/rejected).  
- **Event:** name, date, venue, categories, status (open/closed/active).  
- **Entry:** athlete ID + event ID + category + bib + status (pending/accepted/waitlist).

### 🧩 Essential Functions
- Create, edit, and submit NSID applications.  
- Federation approval and rejection with remarks.  
- View open events; register with one click.  
- Federation event-entry approval and bib assignment.  
- Clear status indicators at each step.

## ⚙️ Platform B – Competition Setup & Run

### ✳️ Purpose
To establish and execute competitions using verified athletes and a flexible judging method.

### 👥 Users
- **Federation/Admin:** create competitions, configure judges, manage heats, run events.  
- **Judges/Officials:** input scores (basic pilot version, no login system).  

### 🗺️ Functional Flow
1. **Competition Home**
   - Create new or open existing competitions (Draft / Ready / Active / Completed).  
2. **Competition Setup Wizard**
   - Step 1: Basic Details (name, date, venue).  
   - Step 2: Judging Setup (number of judges, calculation method).  
   - Step 3: Structure (events, heats, progression rules – top N only for pilot).  
   - Step 4: Import Accepted Athletes from Event Registration.  
   - Step 5: Validation & Activation (locks configuration).  
3. **Competition Run Home**
   - Select active competition → choose event → view heat grid (Not Started / Staging / Live / Closed / Published).  
4. **Run Lite Page**
   - Manage single heat: stage athletes, start/stop, input scores, close, publish leaderboard.  
5. **Progression (Top N Rule)**
   - When a heat closes, top N athletes automatically populate the next round (e.g., Final).  
   - Admin can still manually adjust before locking staging.

### 🧮 Judging Logic (Non-coded)
- Configurable through a form, not hardcoded.  
- Options:  
  - Input Type: Overall or Criteria (up to 3 criteria with weights).  
  - Panel Calculation: Average or Drop High/Low Average.  
  - Attempts: 1 or 2 runs (Best-of or Sum).  
  - Penalties: simple point deductions.  
  - Tie-Breaks: best run → highest judge → share.  
- Once activated, judging configuration is **locked**.

### 🧩 Essential Functions
- Create and validate competitions.  
- Import athletes and auto-split into heats.  
- Simple heat status control (Start/Stop/Close/Publish).  
- Auto-rank and publish leaderboard.  
- Save progression data to next round.  

## 🔄 Data Relationship Summary
| From | To | What Moves |
|------|----|-------------|
| Athlete (NSID) | Event Registration | athlete ID and approval status |
| Event Registration | Competition Setup | accepted entries with bib numbers |
| Competition Setup | Run Home / Run Lite | heats and judging config |
| Run Lite | Result / Leaderboard | scores and rankings |

## 🧩 System Integrity and Philosophy
- **Flow-first design:** correctness of navigation and logic takes priority over UI polish.  
- **No over-engineering:** each module should do one thing well.  
- **Editable only when safe:** facts locked after activation; scores locked after publish.  
- **Quick to fix:** if something breaks, fix by clearing local data or resetting one page – never by rewriting everything.  
- **Pilot for growth:** structure must be reusable later for multi-sport or cloud integration.

## 📋 Stage 2 – Next Step After This Manual
1. **Compare** this document with the **current working platform** (existing files and logic).  
2. Identify gaps:  
   - Features already working.  
   - Elements missing or incomplete.  
   - Parts that are too complex for the pilot and should be simplified.  
3. Document findings in a “Gap Analysis Table.”  
4. Proceed to Stage 3 – Final Build Manual, which will describe exactly what to adjust, add, or remove.

## 🧠 Key Guiding Principles for the Pilot
- Keep it **functionally accurate**, not feature-heavy.  
- Prioritize **clarity and speed of testing** over perfection.  
- Use this pilot to **prove the end-to-end flow**, not to launch a public system.  
- Every future upgrade should build on this base without restarting architecture.  

✅ **End of Stage 1 – Pre-Build Manual**  
*(Next stage → Compare with current platform before final manual and execution.)*
