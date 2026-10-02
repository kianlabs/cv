# PRD — Portfolio Website (repo: `cv`)

## 0. REVISI v2 — Replikasi Desain Referensi

**Perubahan besar dari v1:** desain diganti menjadi **replikasi persis `renlenon.vercel.app`** (dark minimalist), dengan **dark default + toggle light/dark**. Ukuran font, gambar, spacing, dan struktur wajib **sama persis** dengan referensi. Konten, gambar, dan beberapa keterangan disesuaikan dengan data Ridzkyan.

> Referensi: `https://renlenon.vercel.app` — snapshot DOM & CSS disimpan untuk acuan presisi.

---

## 1. Ringkasan

Website portfolio + CV untuk **Ridzkyan Buti Pratama** (panggilan: Kyan) memakai **Next.js (App Router) + TypeScript + Tailwind CSS**.
Desain = replikasi persis `renlenon.vercel.app`. Folder ini = repo GitHub `kianlabs/cv`.
**JANGAN** menyentuh repo/site lain (khususnya `kyandev.vercel.app`).

## 2. Tujuan

- Satu halaman portfolio yang identik secara visual dengan referensi (ukuran, spacing, warna, font, layout).
- Tombol **Download CV / View Resume** benar-benar mengunduh CV.
- **Dark theme default + toggle light/dark** (persis referensi; tombol toggle di navbar).

## 3. Material sumber (semua ada di folder ini)

| File | Kegunaan |
|---|---|
| `stitch-export.html` | Acuan struktur & konten lama (light theme, bukan lagi acuan visual) |
| `DESIGN.md` | Token desain — **direvisi** ke dark minimalist (acuan styling) |
| `cv-ridzkyan.pdf` | File CV final → `public/cv-ridzkyan.pdf` (akses `/cv-ridzkyan.pdf`) |
| `screen.png` | Screenshot desain lama (referensi historis) |

## 4. Struktur halaman (SAMA PERSIS dengan referensi)

Urutan & nama section mengikuti `renlenon.vercel.app`:

1. **Navbar** — sticky, logo inisial `RP`, link: Projects, Experience, Highlights, tombol **Download CV**, **toggle tema** (moon/sun).
2. **Hero** — avatar bulat, nama + badge verified, headline peran, bio dengan inline tech badges, tombol **View Resume** + **Download CV**.
3. **Experience** — layout 2-kolom (kiri: tanggal mono, kanan: role + deskripsi).
4. **Featured Work** — grid 2 kolom, kartu gelap dengan dot-grid, badge status "Production Ready", tech tags.
5. **Projects** — grid 3 kolom, kartu dengan area preview, judul, deskripsi, tech chips, badge "Coming Soon"/"In Progress".
6. **Technologies** — grid pill badges (dot warna + label).
7. **Certifications** — list vertikal (tanggal kiri, logo + judul kanan). Placeholder tetap placeholder.
8. **Education** — layout timeline (tanggal kiri, gelar + GPA kanan).
9. **Outside the IDE** — 2 kolom (teks + chips kiri, gambar kartu kanan).
10. **GitHub Activity** — kartu profil GitHub statis (link ke github.com/kianlabs). **Bukan heatmap.**
11. **Let's work together** — 2 kolom (deskripsi + status kiri, kartu kontak kanan).
12. **Footer** — quote, copyright, lokasi.
13. **Chat widget** — tombol floating kanan bawah "Chat with Kyan", panel chat + quick-reply chips.

## 5. Functional requirements (WAJIB)

### 5.1. Dark + toggle
- **Default dark** (`class="dark"` di `<html>`), sama seperti referensi.
- **Toggle light/dark** di navbar (ikon moon/sun).
- Preferensi disimpan (`localStorage`), hormati `prefers-color-scheme` saat pertama.
- Script anti-FOUC di `<head>` (set class sebelum render).

### 5.2. GitHub Activity — kartu profil statis
- Kartu profil GitHub statis yang link ke `https://github.com/kianlabs`.
- **JANGAN** mengarang angka kontribusi, streak, atau statistik.

### 5.3. Link mati dilarang
- "READ CASE STUDY" (UangKu, GaweTracker) → tombol **disabled** "Case Study — Coming Soon".
- "VISIT SITE" (KRING!, NobarHub, JamKosong) → badge **"Coming Soon"** (disabled), bukan link.
- "View credential" (sertifikasi placeholder) → hapus.
- "Schedule a Call" → `mailto:ridzkyan0504@gmail.com`.

### 5.4. Tombol CV
Hanya **"View Resume"** (navbar + hero) → `href="/cv-ridzkyan.pdf"`. Tombol "Download CV" **dihapus** (cukup satu tombol). Chip chat: "Resume".

### 5.5. Chat widget — anti XSS
- Input user **JANGAN** dirender via `innerHTML` / `dangerouslySetInnerHTML`. Pakai React state + plain text.
- Pertahankan: tombol floating, header, close, greeting, quick-reply chips (keyword match: `project`, `cv`/`resume`, `contact`/`email`, `experience`).

### 5.6. Font & ikon
- **Ikuti referensi**: font **system sans** (bukan Geist) + **system mono** untuk label/tanggal. Lihat DESIGN.md §Typography.
- Ikon: **inline SVG** (jangan CDN icon font). Referensi pakai Font Awesome — **jangan** tiru CDN-nya; ganti inline SVG.

### 5.7. Data kontak (pakai persis)
- Email: `ridzkyan0504@gmail.com`
- GitHub: `https://github.com/kianlabs`
- LinkedIn: `https://linkedin.com/in/ridzkyan-pratama-7911b441b`

## 6. Non-functional requirements

- Responsive, mobile-first (referensi: `max-w-3xl`, `px-4 sm:px-6`).
- HTML semantik (`header`, `main`, `section`, `footer`).
- SEO dasar: `<title>`, meta description, Open Graph.
- Aksesibilitas: `label` pada input chat, `alt` pada gambar, `focus-visible`.
- `npm run build` **harus lolos tanpa error**.

## 7. Batasan keras (JANGAN dilanggar)

1. **JANGAN mengarang**: tanggal mulai KyanDev, nama/isi sertifikasi, URL live proyek, statistik kontribusi, link repo.
2. Placeholder (`[start date TBD]`, `Placeholder 01/02`) **TETAP** placeholder.
3. **JANGAN** `git push`, **JANGAN** deploy — kecuali owner minta eksplisit.
4. Jangan menambahkan halaman/rute baru di luar satu halaman portfolio ini.
5. **JANGAN** menyalin aset berhak cipta (foto orang lain, logo brand pihak lain) — pakai placeholder/gambar sendiri.

## 8. Acceptance criteria

- [ ] `npm run build` sukses.
- [ ] Tampilan identik dengan referensi: ukuran font, spacing, warna, layout.
- [ ] Dark default + toggle tema berfungsi & tersimpan.
- [ ] Semua 13 section ada.
- [ ] Tidak ada `href="#"` hidup.
- [ ] Download CV mengunduh `/cv-ridzkyan.pdf`.
- [ ] Tidak ada heatmap kontribusi palsu.
- [ ] Chat widget: ketik `<img src=x onerror=alert(1)>` → tampil sebagai teks polos.
- [ ] Responsif: 360px (mobile) & 1280px (desktop), tidak ada overflow horizontal.
