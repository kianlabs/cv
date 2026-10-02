# DESIGN.md — Dark Minimalist (berbasis `renlenon.vercel.app`)

> Awalnya snapshot DOM + CSS dari `https://renlenon.vercel.app`. Beberapa token sudah **disesuaikan dari referensi** agar sesuai implementasi final (font Geist + JetBrains Mono, warna `ink`, tipografi section yang diperbesar). Bagian yang menyimpang dari referensi ditandai eksplisit.

## Color Tokens

```yaml
colors:
  # Dark (default)
  ink: '#0b0c0e'              # bg-ink → background utama dark (body)
  surface-dark: '#0b0c0e'     # near-black (body dark)
  featured-dark: '#121212'    # kartu Featured Work (dot-grid)
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
  verified: '#1D9BF0'         # badge centang biru (verified checkmark)
  emerald: '#10b981'          # status dot (production ready / online)
  amber: '#f59e0b'            # badge in-progress

  # Brand colors (logo chips — Technologies & hero badges)
  # Diambil dari simple-icons; dipakai sebagai `fill` SVG (bukan dot).
  brand-react: '#61DAFB'
  brand-laravel: '#FF2D20'
  brand-mysql: '#4479A1'
  brand-nextjs: '#000000'
  brand-typescript: '#3178C6'
  brand-javascript: '#F7DF1E'
  brand-tailwind: '#06B6D4'
  brand-fastapi: '#009688'
  brand-postgresql: '#4169E1'
  brand-nodejs: '#5FA04E'
  brand-python: '#3776AB'
  brand-html5: '#E34F26'
  brand-git: '#F05032'
```

**Catatan warna:** badge/chip **berwarna** (badge status, logo brand) dipertahankan. Hanya **GPA** (`3.69 / 4.00`) yang dirender sebagai **teks polos tanpa pill/warna**.

**Implementasi Tailwind** (lihat `tailwind.config.ts`):
```ts
colors: {
  ink: '#0b0c0e',          // bg-ink (body dark)
  'ink-card': '#141518',
  'ink-border': '#22242a',
  'ink-hover': '#1a1c20',
}
```
Body: `bg-white text-gray-900 dark:bg-ink dark:text-white`.

## Typography

**Font (final):** Geist Sans + JetBrains Mono (via `geist` & `next/font/google` di `app/layout.tsx`).
- `--font-geist-sans` → `font-sans` (Tailwind `fontFamily.sans`).
- `--font-jetbrains-mono` → `font-mono` (Tailwind `fontFamily.mono`).

**Skala (diselaraskan dengan implementasi; tipografi section di bawah hero sudah diperbesar):**

| Elemen | Class |
|---|---|
| Hero headline | `text-[1.7rem] sm:text-[2.05rem] md:text-[2.15rem] font-normal tracking-tight leading-tight` |
| Hero nama (h1) | `text-2xl font-semibold tracking-tight sm:text-2xl md:text-3xl` |
| Bio hero | `text-base font-light leading-7 sm:text-lg sm:leading-8` |
| Section heading (h3) | `text-lg sm:text-xl font-semibold leading-tight` |
| Judul kartu proyek (h4) | `text-[15px] font-semibold` |
| Role title / Education degree | `text-lg font-semibold leading-tight` |
| Body paragraf section | `text-[15px]` |
| Chip Technologies | `text-[15px]` |
| Kartu kontak (label / subjudul) | `text-[15px] font-medium` / `text-[13px]` |
| Mono (tanggal/label) | `font-mono text-[11px]/[12px]/[13px]` |

## Layout

- **Container**: `max-w-3xl` (768px) — persis referensi. `w-full mx-auto px-4 sm:px-6`.
- **Navbar**: `max-w-3xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3`
- **Main**: `mx-auto flex w-full max-w-3xl flex-col gap-14 sm:gap-16 px-4 sm:px-6 pb-10 sm:pb-16 pt-2`
- **Section**: `w-full space-y-5` (atau `space-y-6` untuk beberapa).
- **Hero**: `flex flex-col justify-center pt-6 pb-8 sm:pt-10 sm:pb-8`.

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
- Kanan: link nav (`Projects`, `Experience`, `Highlights`) + tombol **View Resume** + **toggle tema**.
- **Catatan:** tombol "Download CV" sudah **dihapus** (hanya satu tombol CV).

### Buttons
- **Primary CTA** (View Resume): pill, `bg-gray-900 dark:bg-white text-white dark:text-black`.
- **Secondary**: pill outline, border hairline, bg transparan.
- **Explore All Projects**: pill, `bg-gray-900 text-white` (dark: `bg-white/[0.06] text-gray-300 border`).

### Badges & Pills
- **Tech badge (hero inline)**: `rounded-md px-2 py-1 border border-dashed border-gray-300 dark:border-gray-700` + **logo brand SVG berwarna** + label. Berisi **Laravel · React · Next.js · MySQL** (`HERO_TECHS`).
- **Tech pills (Technologies section)**: `rounded-full px-3 py-1.5 border` + **logo brand SVG berwarna** (`fill={color}`) + label. Data dari `components/techs.ts` (`TECHS`).
- **AI Engineering group**: grup terpisah di bawah Technologies, label mono-uppercase `AI Engineering`, chips **tanpa logo** (rounded-full, border netral): LLM API Integration, RAG, MCP, Prompt Engineering, AI Agents.
- **Status badge (Production Ready)**: `rounded text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`.
- **Coming Soon / In Progress**: pill kecil, `text-[10px] font-mono uppercase`.
- **GPA (Education)**: **teks polos** `text-[13px] font-mono text-gray-500 dark:text-gray-400` — **tanpa** pill/background/warna.

### Featured Work Card (dark treatment)
- `rounded-xl bg-[#121212] border border-zinc-800 p-6` + `bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]` (dot-grid).
- Judul putih, deskripsi `text-zinc-400`, tech tags `bg-zinc-800/50 border-zinc-700`.

### Projects Card
- Grid 3 kolom. Area preview atas (`bg-gray-50 dark:bg-white/[0.03]`, min-h 75px) + body (judul, deskripsi, tech chips, badge status).
- `rounded-xl border overflow-hidden`.

### Hero Avatar (`components/AvatarSwap.tsx`)
- Bulat: `h-32 w-32 sm:h-40 sm:w-40 rounded-full border-2 border-gray-200 dark:border-gray-500`.
- **Pixel-reveal swap**: grid 12×12 piksel putih menyala menutupi gambar → gambar berganti → piksel padam. Trigger hover/focus (desktop) atau tap (touch), plus auto-cycle tiap 7000ms. Timing: piksel menutup ~0,25s, gambar ditukar di 260ms, piksel padam di 300ms (putih hanya singkat).
- Hormati `prefers-reduced-motion`: langsung ganti gambar tanpa animasi.
- Dua gambar: `/avatar-anime.jpg` (center 42%) dan `/profile.jpg` (center 15%).

### Certifications Card (`components/CertThumb.tsx`)
- Thumbnail `w-16 h-11 rounded border` (`cursor-zoom-in`); klik → lightbox full-screen (`fixed inset-0 z-[100] bg-black/80`).
- Lightbox tutup via klik, tombol ✕, atau `Esc`; lock scroll body saat terbuka.

### Contact Cards (`#contact`)
- Grid: `grid-cols-1 sm:grid-cols-[1fr_260px] gap-6 items-start`.
- **3 kartu**: Email, GitHub, LinkedIn (kartu "Schedule a Call" sudah **dihapus**).
- Kartu: `p-4 rounded-xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-ink-card hover:border-gray-300` + ikon `w-5 h-5`, label `text-[15px] font-medium`, subjudul `text-[13px]`, panah `text-[16px]` (`→`).

### Chat Widget (`components/ChatWidget.tsx`)
- **Floating button**: `rounded-full bg-gray-900 dark:bg-white text-white dark:text-black px-3.5 py-1.5 shadow-md`, teks "Chat with Kyan".
- **Back-to-top button** di sampingnya: `w-8 h-8 rounded-full border`, ikon `⌃`.
- Panel: `rounded-2xl border shadow-xl`, header dark (avatar RP + dot online), message bubbles, quick-reply chips (**Projects**, **Resume**, **Contact**), input.
- Balasan berbasis keyword match; input user dirender sebagai teks polos (anti-XSS, tanpa `innerHTML`).

### GitHub Heatmap (`components/GitHubHeatmap.tsx`)
- Kartu: `border rounded-xl p-4 sm:p-5 bg-white dark:bg-ink-card`.
- Header: `CONTRIBUTIONS — LAST 12 MONTHS` (mono, kiri) + `{total} total` (kanan).
- **Rentang selalu 12 bulan** (1 tahun). Data live dari `github-contributions-api.jogruber.de` (username `kianlabs`), di-fetch client-side.
- **Desktop (≥ 640px)**: grid `flex-1` meregang pas lebar kartu → sel kecil & rapat seperti GitHub, tanpa scroll.
- **Mobile (< 640px)**: sel ukuran tetap (10px) di kontainer `overflow-x-auto`; **auto-scroll ke paling kanan** (bulan terakhir) saat dibuka, retry via `requestAnimationFrame`. User bisa swipe ke kiri untuk history.
- Warna sel mengikuti palet kontribusi resmi GitHub (level 0–4, versi light & dark). Legend "Less → More" di kanan bawah.

## Spacing Scale

```
section-gap:   gap-14 sm:gap-16   (antar section di main)
section-inner: space-y-5 / space-y-6
card-padding:  p-4 / p-6
grid-gap:      gap-3.5 / gap-4 / gap-6
navbar:        py-3 sm:py-4
```

## Toggle Tema

- Default `dark` (class di `<html>`), persis referensi.
- Tombol toggle moon/sun di navbar.
- Simpan ke `localStorage('theme')`, hormati `prefers-color-scheme` saat pertama kali.
- Anti-FOUC: script inline di `<head>` sebelum render.
