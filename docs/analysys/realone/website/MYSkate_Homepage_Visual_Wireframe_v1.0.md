
# 🧱 MYSkate Homepage — Visual Wireframe v1.0 (No Code)

**Base style:** SkateboardGB layout (modular boxes)  
**Polish cues:** FIFA (rankings/authority)  
**Palette:** Black `#000000` · Orange `#f26b21` · White `#ffffff`  
**Fonts:** Montserrat (H1–H3) · Inter (body)  

---

## 0) Global Layout Rules
- **Max width:** 1280px container (centered).  
- **Section rhythm:** 96px top / 72px bottom spacing (desktop), 56/40 on mobile.  
- **Cards:** 16px inner padding · 12px corner radius · soft shadow on hover.  
- **Images:** `object-fit: cover` · centered focal.  
- **Auto-consistency:** Use **blurred duplicate** of the same image as background in action cards (6–10px blur + dark gradient) so mixed photos look uniform.

---

## 1) Top Navbar (Fixed)
- Left: **MYSkate logo** (white mark on black bar).  
- Center: `Home | Competitions | Rankings | Shop | News | Contact`  
- Right: **[Login ▾]** (Federation → real link; Athlete/Coach/Club/Fan → placeholder).  
- **Height:** 72px desktop / 60px mobile.  
- **Sticky** with subtle shadow when scrolling.

---

## 2) HERO (Full-bleed, immediate impact)
**Purpose:** Authority + national energy.

- **Background:** Either (A) muted skate video loop, or (B) action photo.  
- **Overlay:** black gradient 40–80% from bottom to ensure legibility.  
- **Copy:**  
  - Eyebrow: `MALAYSIA SKATE FEDERATION` (all caps, white, letter-spaced)  
  - H1: `One Federation. One Nation. One Platform.` (white)  
- **CTAs:** `[Join Federation]` (orange)  `[Login Portal ▾]` (ghost/white)  
- **Optional line:** `Recognised by World Skate Asia & OCM` (small, white 70%).  
- **Aspect:** 16:9 desktop (min 680px tall) · 4:5 crop focal on mobile.

**Asset spec:** hero image 1920×1080 (≤ 500 KB) OR video ≤ 12 MB (MP4/WebM).

---

## 3) Upcoming Competitions (Poster-friendly grid)
**Why:** Your posters must look great *as-is*.

- **Title:** `Upcoming Competitions` (H2, orange underline 48px).  
- **Grid (desktop):** 3 columns · equal height tiles.  
- **Each tile:**  
  - **Poster area:** 3:4 frame (works for portrait posters).  
  - **Meta bar (below poster):** date · city · **status chip** (Open / Closing Soon / Full).  
  - **Buttons:** `Details` (ghost) · `Register` (orange) — show one or both.  
- **Mobile:** 1 column (snap carousel optional).

**Asset spec:** posters 900×1200 (JPG/PNG ≤ 350 KB).

---

## 4) Rankings Snapshot (FIFA-style authority)
**Title:** `National Rankings — Top 5`  
- **Tabs:** `Street | Park | Inline` and `M | F` (toggle).  
- **Card/table hybrid:**  
  - Left column: **#1** large row with small action photo (16:9) + name + points.  
  - Right: **#2–#5** compact rows (name, state flag, points).  
- **CTA:** `View Full Rankings →` (links to future page).

**Asset spec:** small action photos 480×270 (optional; if missing, show state flag).

---

## 5) Video Highlights (3 tiles)
**Title:** `Moments That Move Us`  
- **Grid:** 3 columns desktop / 1 column mobile.  
- **Tile:** 16:9 thumbnail, **play icon** center, title bottom-left on black gradient.  
- **Click:** open modal OR external YouTube/Vimeo link.  
- **Hover:** subtle zoom-in + orange border glow.

**Asset spec:** thumbnails 1280×720 (≤ 250 KB).

---

## 6) Athlete Spotlight (Action-photo cards)
**Title:** `Athlete Spotlight`  
- **Layout:** 2 feature cards side-by-side (desktop), stacked on mobile.  
- **Each card:**  
  - **Background:** blurred duplicate of the same photo (6–10px).  
  - **Foreground content block:** bottom-left; includes **Name**, **Discipline**, **Quick stat** (e.g., current rank or last medal).  
  - **Optional button:** `Profile →` (future).  
- **Reason:** Works even when photos are not standardized.

**Asset spec:** any action photo ≥ 1200px wide (JPG ≤ 400 KB).

---

## 7) Get Involved (3 role cards)
**Title:** `Be Part of the Movement`  
- **Cards:**  
  1) **Join Fan Club** — mini form (Name, Email, Join).  
  2) **Register Your Club** — short text + `Register →`.  
  3) **Coach Pathway** — short text + `Learn More →`.  
- **Background:** light grey or white for contrast.  
- **Form behaviour:** non-functional (collects nothing) for MVP unless you decide to wire to Google Form.

---

## 8) Federation Identity (Credibility block)
- **Title:** `Our Mission` + one-paragraph statement.  
- **Logo row:** World Skate Asia · OCM · (partners/sponsors).  
- **Stats line:** `14 States · 3 Disciplines · 100+ Clubs · 1000+ Athletes`.  
- **Background:** black; text in white; orange accents for separators.

---

## 9) Footer
- Links: `About · Events · Rankings · Clubs · Contact · Shop`  
- Social icons: FB · IG · YouTube (white; orange on hover).  
- Line: `© 2025 Malaysia Skate Federation · Powered by ZED Systems`

---

## Desktop vs Mobile Layout Summary

### Desktop
- Container 1280px; 24px gutters; 32px grid gap.  
- Sections use 3‑col grids where possible (Competitions, Videos).  
- Sticky navbar; hero 16:9.

### Mobile (≤ 640px)
- Single column; 16px padding; 20px gaps.  
- Hero crops center-top focal; buttons stack.  
- Grids become **snap carousels** for quicker browsing.

---

## Asset Delivery Checklist (Fast & Practical)
- **Hero:** 1 image 1920×1080 *or* 1 short loop video.  
- **Posters:** 6–9 files (PNG/JPG) — we’ll show top 3, keep rest ready.  
- **Videos:** 3 highlight links (YouTube/Vimeo) *or* 3 MP4s.  
- **Athlete photos:** 4–6 action shots; any ratio (we handle blur/crop).  
- **Logos:** World Skate Asia, OCM, and 3–6 partner marks (PNG with transparency).  
- **Copy:** 1 mission paragraph (max 300 chars), event meta (date/location).

---

## Microcopy & Limits (so it always looks clean)
- Card titles: **max 48 chars**; subtitles: **max 70 chars**.  
- Buttons: 1–2 words (`Register`, `Details`, `Join`).  
- Rankings names: **First Last** + **State code** (e.g., *Aisyah Z. — SEL*).

---

## What We Are NOT Building Now
- No real login or forms (except optional Fan Club email capture via external link).  
- No shop cart/checkout (link only).  
- No full rankings/athlete database pages (links only).

---

## Approval
If this wireframe matches your vision, we’ll proceed to **Mockup Stage** next using your assets and brand palette.
