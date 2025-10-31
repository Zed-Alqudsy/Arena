# FID–Federation Issue (Current Situation Summary)

## 🎯 Overview
The current ZED Arena system operates functionally under a **single federation (MSF)** context, but federation data is **not globally enforced or centralized**. The logic for federation handling exists, but it’s fragmented and semi-implicit.

---

## ⚙️ Current Federation Behavior (As of setup_new.html and L9)

### 1. Federation Input in Competition Setup
- The competition setup page (`setup_new.html`) includes:
  - A free-text federation name field (`#f_federation`).
  - A hidden federation ID field (`#fid`).
  - A temporary federation selector (`#f_fid_selector`) populated from existing FIDs in `athletes_master`.

### 2. FID Resolution Logic
The code determines federation ID (`fid`) using this priority order:
1. **URL parameter** `?fid=XYZ`
2. **localStorage.active_fid** (if set manually or by switcher)
3. **Derived acronym** from `#f_federation` (auto-generated)

This means federation identity can change dynamically, depending on how the page loads — it is **not fixed or locked**.

### 3. Effect on L9 Roster
- L9 roster filtering works **by fid** — if correctly set, it filters athletes belonging to that federation.
- If `fid` is missing or inconsistent, all athletes may appear in the Approved list or mix across federations.

### 4. Athlete Data
- `athletes_master` currently holds all athletes (no federation isolation).
- Most athlete entries implicitly belong to **MSF** because data was seeded that way.
- Athlete registration pages likely don’t explicitly write `fid` (not confirmed yet).

### 5. Competition Records
- When a competition is approved and activated, its data is written to `competitions_active`.
- Currently, competitions do **not** store a federation ID field (`fid`).
- Adding `"fid": "MSF"` would future-proof data and make federation-specific queries possible later.

---

## 🔎 Current Reality
| Area | Current Behavior | Controlled by Federation? |
|-------|------------------|---------------------------|
| Athlete registration | Likely assumes MSF only | ❌ Implicit only |
| L9 Roster | Filters by fid if available | ✅ Partial |
| Competition Setup | Federation input editable | ❌ Not locked |
| Run / Judge Modules | Use competition data only | ⚪ Neutral |
| Overall system | Operates as “MSF only” | ✅ Works fine for single federation |

---

## 🧩 What This Means
Right now:
- The system **behaves as single-federation (MSF)** because that’s the only data present.
- Federation context is **optional and local**, not globally enforced.
- There’s **no risk** in continuing this way while you’re working with MSF only.

---

## 🚀 Future Direction (When Multi-Federation Starts)
When other federations join, the following improvements will make it clean and scalable:

1. **Add a Federation Switcher (entry point)**  
   - Sets `localStorage.active_fid` once per session.  
   - All pages read that FID and filter accordingly.

2. **Lock Federation Context per Page**  
   - Setup and Athlete pages stop allowing manual FID edits.  
   - They simply read the active federation context.

3. **Stamp FID into All Records**  
   - Competitions, Athletes, and Judges all include `"fid": "XYZ"` in saved objects.

4. **Enable Multi-View Roles**  
   - Federation Admins: full access.  
   - Athletes: restricted to their NSID/AID.  
   - Public View: open access for rankings, etc.

---

## 🧠 Recommended Next Step (for MSF phase)
- ✅ Continue current setup (MSF-only).  
- 🔹 Optional: Add `fid` field when saving competitions (invisible now, useful later).  
- 🕓 Later: Introduce the proper **Federation Switcher** + role-based access once multiple federations or public viewers are added.

---

## ✅ Summary
| Phase | Description | Status |
|--------|--------------|--------|
| Single Federation (MSF) | Works fine as-is | ✅ Stable |
| Federation Context Globalization | Optional now | ⏸️ Later |
| Federation Lock + Switcher | Needed for SaaS scaling | 🕓 Future |
| Athlete FID Tracking | Missing, assumed MSF | ⚠️ To add later |

---

**In short:**  
> The system currently *acts like MSF-only* but has partial hooks for federation logic.  
> Nothing is broken — you can safely continue as-is until you expand to multi-federation mode.
