🧾 Arena_UI_Standards.md
# 🎨 XGAMES ARENA — UI Standards Manual  
_Version 1.0 — SaaS-Grade Unified Visual Guide_

---

## 1️⃣ Core Design Principles
- **Unified SaaS Feel:** Clean, confident, minimal. Inspired by Stripe / Linear / Lark.  
- **No clutter.** Every element must have clear spacing and alignment.  
- **Brand-first:** Use the Arena gradient header as the visual anchor on every page.  
- **Functional simplicity:** Design must feel “ready for work”, not decorative.  
- **Consistency over creativity.** All sub-pages follow the same visual structure.

---

## 2️⃣ Global Color Palette

| Token | Hex | Usage |
|-------|------|--------|
| `--blue` | `#2563eb` | Primary action, gradient start |
| `--navy` | `#1e3a8a` | Gradient base, headings |
| `--orange` | `#F37021` | Accent / highlights |
| `--bg` | `#f9fafb` | Page background |
| `--card` | `#ffffff` | Surface background |
| `--ink` | `#0f172a` | Text / headings |
| `--muted` | `#64748b` | Secondary text |
| `--line` | `#e5e7eb` | Border lines |
| `--soft` | `#f1f5f9` | Button / tag background |

> 🔹 Never use black for backgrounds.  
> 🔹 For dark mode (future), invert gradient and use navy/soft base.

---

## 3️⃣ Page Layout Template

Each page follows **Arena Layout Grid:**


<header> → Blue gradient hero (full width) .wrap → Centered container (max-width: 960px) .header → White floating card header .grid → Main card grid (1–2 columns) <footer> → Minimal text footer ```
Example visual hierarchy:
🏁 Gradient Header (full-width)
⬜ Floating Header Card (page title, back button)
⬜⬜ Main Cards (grid layout)
--- Footer text ---

4️⃣ Typography
Element	Style
Body	system-ui, sans-serif
Page Title	2.0rem – 2.4rem, bold
Section Header	1.4rem – 1.6rem
Paragraph / Notes	1.0rem – 1.1rem, color: var(--muted)
Button Text	600 weight, uppercase optional
5️⃣ Components
🔸 Buttons
.btn {
  background: var(--blue);
  color: var(--btn-ink);
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s ease;
}
.btn:hover { background: #1d4ed8; }

.btn.secondary {
  background: var(--soft);
  color: #1e293b;
  border: 1px solid #cbd5e1;
}
.btn.secondary:hover { background: #e2e8f0; }

🔸 Cards

White background, 16px radius.

Subtle shadow: 0 4px 12px rgba(0,0,0,0.05)

Hover lift: translateY(-4px), glow border color var(--blue).

🔸 Tags / Pills
.tag, .pill {
  border-radius: 999px;
  font-size: 12px;
  padding: 4px 10px;
  font-weight: 600;
}
.tag {
  background: var(--soft);
  color: #1e293b;
}
.pill {
  background: #eef2ff;
  color: #3730a3;
}

6️⃣ Header (Hero Band)

Each page begins with a full-width gradient header:

header {
  width: 100%;
  background: linear-gradient(135deg, var(--navy), var(--blue));
  color: white;
  padding: 60px 20px 100px;
  text-align: center;
}


Page title (H1) centered

Subtitle optional

.wrap container overlaps with negative margin (margin: -60px auto 60px;)

7️⃣ Footer

Minimal, soft tone, center-aligned.

footer {
  margin-top: 60px;
  font-size: 14px;
  color: var(--muted);
  text-align: center;
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

8️⃣ Responsive Grid
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}
@media (min-width: 760px) {
  .grid { grid-template-columns: 1fr 1fr; }
}


Cards auto-stack vertically on mobile.

9️⃣ Component Behavior
Component	Desktop	Mobile
Hero band	Full width	100% width
Floating header	Max 960px centered	Full width
Grid cards	2 per row	1 per row
Buttons	Fixed padding	Full width (optional)
🔟 Link Rules

Always link back to platform home using:

<a href="/platform_index.html" class="btn secondary">← Back to Platform Home</a>


Never link back to /index.html (public website).

Always use relative paths (/modules/..., /pages/...) correctly.

🔁 Reuse Standard

Every new page must:

Include the header, .wrap, and footer structure.

Use the Arena palette and component CSS exactly.

Avoid inline color values except for special highlights.

Be self-contained and responsive.

✅ Sample Structure Template
<header>
  <h1>🏆 Page Title</h1>
  <p>Subtitle or helper line</p>
</header>

<div class="wrap">
  <div class="header">
    <div class="title">
      <div style="font-size:22px">🏠</div>
      <h2>Section Title</h2>
      <span class="tag">Home</span>
    </div>
    <a class="btn secondary" href="/platform_index.html">← Back to Platform Home</a>
  </div>

  <div class="grid">
    <!-- Page-specific cards go here -->
  </div>

  <footer>
    XGAMES ARENA — [Module Name] v1.0
  </footer>
</div>

💬 Tone & Personality

Professional but energetic.

Keep emoji headers when relevant (🏆, 🏃‍♂️, 🎯) — it adds warmth.

Use short, clear labels. Example:

“Open Setup” ✅

“Manage Competition” ✅

“Go” ❌ (too vague)

📁 File Placement Guide

All global CSS rules → /styles.css

No per-page inline <style> except experimental sections.

Shared scripts:

/shared/core.js

/shared/state.js

/shared/lang.js