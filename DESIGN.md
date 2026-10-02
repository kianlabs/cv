---
name: Obsidian & Mint Engineering Portfolio
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Geist
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system establishes an ultra-refined, engineering-led aesthetic tailored for senior technical roles, engineering leaders, and high-impact individual contributors. It serves two distinct audiences: technical recruiters scanning for competencies within 6 seconds, and engineering directors conducting deep dives into technical architecture, code quality, and delivery track records.

The personality balances high-velocity precision with understated editorial craft:
- **Tone:** Authoritative, razor-sharp, calm, and meticulously crafted.
- **Design Movement:** Modern Technical Minimalism infused with structured micro-surfaces, balanced hairline borders, and targeted editorial contrast.
- **Visual Tension:** Pure crisp whites and warm off-white canvases juxtaposed against deep slate ink, punctuated by energetic emerald flashes denoting production uptime, active status, and high-impact outcomes. Deep obsidian cards anchor featured projects, imparting weight and focus.

## Colors
The color architecture delivers clinical clarity while allowing deep accentuation for key technical milestones:

- **Canvas & Surfaces:**
  - Base Ground: `#F8FAFC` (Slate-50) for canvas warmth.
  - Surface Primary: `#FFFFFF` for standard project cards, CV timeline items, and floating controls.
  - Surface Inverted (Featured Anchors): `#0F172A` (Slate-900) to `#020617` (Slate-950) for flagship project showcases and embedded terminal displays.
- **Typography & Ink:**
  - Primary Headings & Critical Data: `#0F172A` (Slate-900).
  - Body & Descriptive Text: `#334155` (Slate-700).
  - Secondary Context & Meta-details: `#64748B` (Slate-500).
  - Ghost & Timestamp Ink: `#94A3B8` (Slate-400).
- **Accents:**
  - **Indigo (`#4F46E5`):** The primary interaction anchor for primary actions, CV download triggers, interactive live demos, and focused link states.
  - **Emerald (`#10B981`):** The operational heartbeat. Reserved for "Available for hire" status indicators, production performance metrics, code coverage pills, and positive impact diffs.
- **Hairlines & Boundaries:**
  - Border Subdued: `#E2E8F0` (Slate-200) for standard card framing.
  - Border Contrast: `#CBD5E1` (Slate-300) for interactive hover boundaries.
  - Dark Surface Borders: `rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.16)`.

## Typography
Typographic discipline underpins the portfolio's developer-centric credibility:

- **Primary Typeface (Geist):** Handles all narrative framing, headings, and editorial copy. Designed specifically for developer interfaces, it brings neutral geometry and exceptional tabular clarity without visual artifacts.
- **Monospace Accent (JetBrains Mono):** Applied selectively to dates, code snippets, git hashes, architecture metrics, and technology tag labels. Its presence reinforces structural rigor.
- **Vertical Rhythm:** Headings enforce tight negative letter-spacing (`-0.015em` to `-0.03em`) to anchor the eye quickly. Body text is prioritized for prolonged readability with relaxed line heights (`1.6` to `1.65`).

## Layout & Spacing
The portfolio utilizes a centralized, fixed-constraint grid system with a standard maximum layout width of `1080px`, preventing visual drift and ensuring effortless vertical scanning.

- **Desktop (>= 1024px):** 12-column fixed grid bounded within `1080px`, flanked by dynamic outer margins (`min(2rem, 5vw)`). Section vertical padding defaults to `space-xl` (expanded to 5rem for section transitions).
- **Tablet (768px - 1023px):** 8-column layout with `1.5rem` gutters and `1.5rem` canvas margins. Project grids shift from 3 columns to 2 columns.
- **Mobile (< 768px):** 4-column flow with `1rem` gutters and `1rem` edge margins. CV milestones compress into a continuous single-rail timeline, with metadata stacked vertically above narrative bullets.

## Elevation & Depth
Depth is created through clean surface contrasts and calibrated hairline borders rather than muddy, sprawling dropshadows:

- **Level 0 (Flat/Subtle):** Standard CV entries and baseline structural modules sit directly on `#F8FAFC` with a hairline stroke of `1px solid #E2E8F0`.
- **Level 1 (Card Surface):** White surface cards (`#FFFFFF`) receive an ultra-crisp border (`1px solid #E2E8F0`) and an ambient, low-contrast contact shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Hover & Active States):** On card hover, surfaces elevate via a dynamic transition: border shifts to `#CBD5E1`, with shadow expanding to `0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.03)`.
- **Inverted Surfaces (Featured Work):** Dark cards utilize absolute darkness (`#0F172A`) paired with inner specular highlights: `inset 0 1px 0 0 rgba(255, 255, 255, 0.1)` and an outer stroke `1px solid rgba(255, 255, 255, 0.08)`. Hover introduces a subdued emerald or indigo outer ambient glow (`0 20px 40px -15px rgba(16, 185, 129, 0.12)`).

## Shapes
A unified curvature scale gives the portfolio its modern, high-craft look:

- **Cards and Major Surfaces:** `rounded-lg` (1rem / 16px) establishes clean, modern contours without being childish or aggressive.
- **Nested Inner Surfaces:** Nested preview frames, embedded code snippets, and inner metrics containers use standard base rounding (0.5rem / 8px).
- **Badges, Tags, and Pill Elements:** Complete pill curvature (`rounded-full` / 9999px) is strictly enforced for skill tags, architecture pills, and status tags to contrast against rectangular cards.
- **Buttons & Interactive Inputs:** Rounded standard (0.5rem / 8px) for buttons maintains utility and structural confidence.

## Components

### Buttons
- **Primary Action (e.g., "Download CV", "Contact"):** Solid `#4F46E5` fill with pure white typography (`#FFFFFF`, `body-sm`, font-medium). Subtle transition on hover to `#4338CA`, accompanied by a `transform: translateY(-1px)` lift.
- **Secondary Action (e.g., "View GitHub", "Live Demo"):** `#FFFFFF` fill with `1px solid #E2E8F0` border and `#0F172A` text. Hover shifts background to `#F8FAFC` and border to `#CBD5E1`.
- **Ghost/Tertiary (Inline Source links):** Zero fill, `#4F46E5` text with subtle underline transition and trailing mono-arrow icon (`->`).

### Tech Badges & Status Chips
- **Tech Stack Badges:** Pill-shaped (`rounded-full`), padded with `0.25rem 0.65rem`. Background `#F1F5F9` (Slate-100), border `1px solid #E2E8F0`, typography `label-sm` in `#334155`.
- **Dark Card Stack Badges:** Pill-shaped, background `rgba(255, 255, 255, 0.06)`, border `1px solid rgba(255, 255, 255, 0.1)`, text `#E2E8F0`.
- **Availability Status Indicator:** Pill-shaped with `#ECFDF5` fill, `#A7F3D0` border, and `#065F46` label font. Preceded by an emerald glowing dot (`#10B981`) featuring a subtle CSS pulse animation.

### Featured Project Cards (Dark Treatment)
- High-contrast flagship showcases framed in `#0F172A` with an inner specular ring (`inset 0 1px 0 rgba(255, 255, 255, 0.1)`).
- Title rendered in `#FFFFFF`, narrative in `#94A3B8`, and architecture details in monospace `#34D399` (Emerald-400).
- Subtle scale transition on interactive media embeds on hover.

### Standard CV / Experience Timeline
- Left-rail timeline with a `2px solid #E2E8F0` guide stroke.
- Rail nodes use a `10px` circular dot with a `2px` white border, filled with `#4F46E5` for current positions and `#94A3B8` for historical roles.
- Role heading in `headline-sm` (`#0F172A`), company and date rendered using `label-md` (`#64748B`), and metric achievements structured as bulleted high-density items with bolded outcome statistics.

### Metric Callout Cards
- Compact surfaces focusing on quantifiable engineering impact (e.g., "99.99% Uptime", "-42% Latency").
- Number rendered in `headline-lg` (`#0F172A`), metric label rendered in `label-sm` (`#64748B`, uppercase tracking).
- Top border features an optional 2px emerald gradient highlight bar.