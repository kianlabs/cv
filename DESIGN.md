# DESIGN.md — Dark Minimalist (replikasi `renlenon.vercel.app`)

> Sumber: snapshot DOM + CSS dari `https://renlenon.vercel.app`. Semua token di bawah diekstrak langsung dari CSS referensi agar replikasi presisi.

## Color Tokens

```yaml
colors:
  # Dark (default) — diekstrak dari referensi
  ink: '#121212'              # --color-ink (bg-ink) → background utama dark
  surface-dark: '#0b0c0e'     # near-black (body dark)
  card-dark: '#141518'        # kartu di dark
  border-dark: '#22242a'      # border kartu (rgba(255,255,255,0.08) setara)
  hover-dark: '#1a1c20'       # hover surface

  # Light
  bg-light: '#ffffff'         # body light
  surface-light: '#fafafa'    # kartu light (gray-50)
  border-light: '#f3f4f6'     # gray-100
  border-light-2: '#e5e7eb'   # gray-200

  # Text
  text-primary-light: '#111827'   # gray-900
  text-secondary-light: '#6b7280' # gray-500
  text-primary-dark: '#ffffff'    # white
  text-secondary-dark: '#9ca3af'  # gray-400
  text-muted-dark: '#6b7280'      # gray-500

  # Accent
  verified: '#38bdf8'         # badge centang biru
  emerald: '#10b981'          # status dot (production ready / online)
  amber: '#f59e0b'            # badge in-progress
```

**Implementasi Tailwind** (lihat `tailwind.config.ts`):
```ts
colors: {
  ink: '#121212',          // bg-ink (persis referensi)
  'ink-card': '#141518',
  'ink-border': '#22242a',
  'ink-hover': '#1a1c20',
}
```
Body: `bg-white text-gray-900 dark:bg-ink dark:text-white` — **persis referensi**.

## Typography

**Font mengikuti referensi (BUKAN Geist):**
- `--font-sans`: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- `--font-mono`: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

**Skala (diekstrak dari DOM referensi):**

| Elemen | Class referensi |
|---|---|
| Hero headline | `text-[1.7rem] sm:text-[2.05rem] md:text-[2.15rem] font-normal tracking-tight leading-tight` |
| Section heading (h3) | `text-base sm:text-[17px] font-semibold leading-tight` |
| Section label kecil | `text-sm font-semibold` |
| Bio / body | `text-sm sm:text-base leading-relaxed text-gray-500 dark:text-gray-400 max-w-xl` |
| Role title | `text-base font-semibold leading-tight` |
| Mono (tanggal/label) | `font-mono text-[10px]/[11px]/[12px]` |

## Layout

- **Container**: `max-w-3xl` (768px) — persis referensi. `w-full mx-auto px-4 sm:px-6`.
- **Navbar**: `max-w-3xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4`
- **Main**: `mx-auto flex w-full max-w-3xl flex-col gap-14 sm:gap-16 px-4 sm:px-6 pb-10 sm:pb-16`
- **Section**: `w-full space-y-5` (atau `space-y-6` untuk beberapa).
- **Hero**: `flex flex-col justify-center pt-6 pb-8 sm:pt-16 sm:pb-8`.

## Elevation & Borders

- **Navbar**: `sticky top-0 z-40 bg-white/70 dark:bg-ink/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800`
- **Kartu (light)**: `border border-gray-100/200 rounded-xl bg-white`
- **Kartu (dark)**: `bg-[#141518] border border-white/[0.08] rounded-xl`
- **Featured Work (dark card)**: bg gelap + dot-grid pattern + `rounded-xl`, badge status emerald.
- **Hover**: border naik kontras + sedikit terang.

## Shapes

- Kartu & permukaan besar: `rounded-xl` (12px).
- Nested/inner frame: `rounded-lg` (8px).
- Badge/tag/pill: `rounded-full`.
- Tombol: `rounded-full` (CTA) atau `rounded-lg`.

## Components

### Navbar
- Sticky, backdrop-blur, border-bottom hairline.
- Kiri: logo inisial `RP` (bulat).
- Kanan: link nav (`Projects`, `Experience`, `Highlights`) + tombol **Download CV** + **toggle tema**.

### Buttons
- **Primary CTA** (View Resume / Download CV): pill, `bg-gray-900 dark:bg-white text-white dark:text-black`.
- **Secondary**: pill outline, border hairline, bg transparan.
- **Explore All Projects**: pill, `bg-gray-900 text-white` (dark: `bg-white/[0.06] text-gray-300 border`).

### Badges & Pills
- **Tech badge (hero inline)**: `rounded-md px-2 py-0.5 border border-gray-200 dark:border-white/[0.12] text-[11px] font-mono` + dot warna.
- **Tech pills (Technologies section)**: `rounded-full px-3 py-1 border` + dot warna + label.
- **Status badge (Production Ready)**: `rounded text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`.
- **Coming Soon / In Progress**: pill kecil, `text-[9px] font-mono uppercase`.

### Featured Work Card (dark treatment)
- `rounded-xl bg-[#121212] border border-zinc-800 p-6` + `bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]` (dot-grid).
- Judul putih, deskripsi `text-zinc-400`, tech tags `bg-zinc-800/50 border-zinc-700`.

### Projects Card
- Grid 3 kolom. Area preview atas (`bg-zinc-50 dark:bg-white/[0.03]`, min-h 75px) + body (judul, deskripsi, tech chips, badge status).
- `rounded-xl border overflow-hidden`.

### Chat Widget
- **Floating button**: `rounded-full bg-gray-900 dark:bg-white text-white dark:text-black px-3.5 py-1.5 shadow-md`, teks "Chat with Kyan".
- Panel: `rounded-2xl border shadow-xl`, header dark, message bubbles, quick-reply chips, input.

## Spacing Scale

```
section-gap:   gap-14 sm:gap-16   (antar section di main)
section-inner: space-y-5 / space-y-6
card-padding:  p-4 / p-6
grid-gap:      gap-3.5 / gap-4
navbar:        py-3 sm:py-4
```

## Toggle Tema

- Default `dark` (class di `<html>`), persis referensi.
- Tombol toggle moon/sun di navbar.
- Simpan ke `localStorage('theme')`, hormati `prefers-color-scheme` saat pertama kali.
- Anti-FOUC: script inline di `<head>` sebelum render.
