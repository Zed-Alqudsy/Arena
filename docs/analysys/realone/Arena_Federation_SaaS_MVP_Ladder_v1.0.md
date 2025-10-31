# 🧩 Arena Federation SaaS — MVP Ladder Execution Plan (v1.0)

> 🎯 Objective: Deliver a fully functional **multi-federation SaaS demo** built on your existing XGAMES platform.  
> Each federation gets its **own branded site** (subdomain) with athlete registration, competition dashboard, and live display — all powered by Firestore.

---

## 🪜 Stage 1 — Core Base & Tenant Framework

### 🎯 Goal
Establish the **multi-tenant foundation** so the same app serves different federations via subdomain or config.

### ✅ Tasks
1. **Setup Wildcard Hosting**
   - Configure `*.arena.app` → single Vercel project.
   - Enable middleware to detect subdomain → set `fid`.
2. **Tenant Config Loader**
   - Create `/tenants/<FID>.json` or Firestore collection `/tenants/<fid>/config`.
   - Include:
     ```json
     {
       "fid": "MSF",
       "name": "Malaysia Skate Federation",
       "brand": { "primary": "#0ea5e9", "logo": "/assets/msf-logo.svg" },
       "features": { "fans": true, "analytics": true }
     }
     ```
3. **Bootstrap Script**
   - Auto-detect host → fetch config → apply colors, logos, titles, nav items.
   - Set global variable `FID_CURRENT`.

✅ **Deliverable:**  
App loads with MSF branding at `msf.arena.app`, ABF branding at `abf.arena.app`, all using same codebase.

---

## 🪜 Stage 2 — Firestore Integration (Core Sync)

### 🎯 Goal
Replace localStorage for core competition logic with Firestore.

### ✅ Tasks
1. **Setup Firestore Project**
   - Collections:
     - `athletes`
     - `competitions`
     - `events`
     - `heats`
     - `scores`
     - `leaderboards`
   - Each document includes `fid`.
2. **Adapter Layer**
   - Create `db.js`:
     ```js
     export async function dbGet(coll, query) { ... }
     export async function dbSet(coll, id, data) { ... }
     ```
   - Map old `State.setJSON()` / `getJSON()` → Firestore calls.
3. **Sync Flow**
   - Judges → write scores to Firestore.
   - Display → listen to Firestore snapshot for live update.
   - Leaderboard → compute + write to Firestore.

✅ **Deliverable:**  
End-to-end Firestore flow for judging, leaderboard, and display works live across devices.

---

## 🪜 Stage 3 — Federation Dashboard Shell

### 🎯 Goal
Create a clean admin portal for federation officials.

### ✅ Tasks
1. `/official/` page:
   - Tabs: `Athletes`, `Competitions`, `Results`, `Settings`.
   - Show key metrics:
     - Registered Athletes
     - Active Competitions
     - Events Running
   - Each section links to relevant pages (even if placeholders).
2. Use Firestore reads for real data counts.
3. Add minimal toolbar (logout placeholder, language toggle).

✅ **Deliverable:**  
Federation dashboard looks SaaS-grade, branded per tenant.

---

## 🪜 Stage 4 — Athlete & Fan Portals

### 🎯 Goal
Provide visible front-end entry for athletes and fans.

### ✅ Tasks
1. **Athlete Pages**
   - `/athlete/register.html` — form → writes to Firestore (`athletes_staging` or `athletes`).
   - `/athlete/join.html?cid=` — join competition (simple form).
   - Toast: “Registration received.”
2. **Fan Page (Shell)**
   - `/fans` → shows federation updates and leaderboard highlights.
   - Can use static placeholders or mock data.
3. **Brand Consistency**
   - All pages inherit colors + logo from tenant config.

✅ **Deliverable:**  
Athletes can register and join; fans see branded public page.

---

## 🪜 Stage 5 — Run Console & Displays (Live Demo Mode)

### 🎯 Goal
Enable real competition demo using Firestore.

### ✅ Tasks
1. **Run Console (`/run`)**
   - Existing logic → adapt to Firestore reads/writes.
   - Heats, events, scoring, reveal toggle.
2. **Judge UI**
   - Same as before, but posts to Firestore.
3. **TV Display**
   - `/tv?screen=live1` reads Firestore `leaderboard_<cid>_<eid>`.
   - Smooth updates via Firestore snapshots.

✅ **Deliverable:**  
Full live judging → leaderboard updates across devices.

---

## 🪜 Stage 6 — Landing Page & Analytics

### 🎯 Goal
Give professional SaaS-ready front-facing site for investors and federations.

### ✅ Tasks
1. Create `index.html` for each tenant:
   - Hero banner (federation logo + tagline)
   - “Join as Athlete” / “View Events” buttons
   - “Powered by XGAMES Arena” footer
2. Add simple analytics dashboard:
   - Cards: Total Athletes / Competitions / Active Events
   - Pull live counts from Firestore
   - Optional graph using Chart.js

✅ **Deliverable:**  
Looks and feels like a SaaS product site with real live data.

---

## 🪜 Stage 7 — Presentation Polish & Demo Prep

### 🎯 Goal
Make it visually impressive and investor-ready.

### ✅ Tasks
1. Responsive cleanup for mobile and TV screens.  
2. Add intro animations / fade-in cards.  
3. Prepare 3 demo tenants (e.g. MSF, ABF, TestFed).  
4. Add `demo.arena.app` (public summary) explaining multi-federation concept.  
5. Create 2-minute demo flow script for presentation.

✅ **Deliverable:**  
Demo-ready platform showing multiple federations, live event, and real Firestore sync.

---

## 🪜 Stage 8 — Optional (Post-Demo Enhancements)

| Feature | Description |
|----------|--------------|
| Auth & Roles | Google login per federation |
| Payment Gateway | Subscription / licensing |
| Cloud Functions | Auto leaderboard compute |
| Video Module | Integrate display router for real TV broadcast |

---

## ✅ Summary Execution Timeline

| Stage | Estimated Time | Output |
|--------|----------------|--------|
| Stage 1 – Tenant Framework | 0.5 day | Multi-federation base |
| Stage 2 – Firestore Integration | 1 day | Live sync system |
| Stage 3 – Federation Dashboard | 0.5 day | Branded admin UI |
| Stage 4 – Athlete/Fan Portals | 0.5 day | User-side UIs |
| Stage 5 – Run Console & Displays | 1 day | Live demo-ready |
| Stage 6 – Landing & Analytics | 0.5 day | SaaS front |
| Stage 7 – Polish & Prep | 0.5 day | Investor demo ready |

**⏱ Total:** ~4–5 days for one-man build (you).
