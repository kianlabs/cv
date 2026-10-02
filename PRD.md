# PRD — Portfolio Website (repo: `cv`)

## 0. REVISI v3 — Penyesuaian Konten & Heatmap

**Perubahan dari v2:**
- **Headline hero**: `Full-Stack Web Developer — Laravel · React · Next.js`.
- **Bio**: menyelipkan frasa "with an AI-assisted workflow".
- **Technologies**: chip memakai **logo brand berwarna** (React, Laravel, MySQL, dll — `components/techs.ts`) + grup baru **AI Engineering**.
- **GitHub Activity**: dari kartu profil statis → **heatmap kontribusi live 12 bulan** (desktop fit-to-card; mobile scroll horizontal, auto ke bulan terakhir).
- **GPA**: jadi teks polos (tanpa pill/warna).
- **Experience**: KyanDev start **Mar 2025**.
- **Verified checkmark**: menempel di samping nama (fix wrap mobile).
- Badge/chip berwarna **dipertahankan** (bukan monokrom).

## 0b. REVISI v2 — Replikasi Desain Referensi

**Perubahan besar dari v1:** desain diganti menjadi **replikasi persis `renlenon.vercel.app`** (dark minimalist), dengan **dark default + toggle light/dark**. Ukuran font, gambar, spacing, dan struktur wajib **sama persis** dengan referensi. Konten, gambar, dan beberapa keterangan disesuaikan dengan data Ridzkyan.

> Referensi: `https://renlenon.vercel.app` — snapshot DOM & CSS disimpan untuk acuan presisi.

---

## 1. Ringkasan

Website portfolio + CV untuk **Ridzkyan Buti Pratama** (panggilan: Kyan) memakai **Next.js (App Router) + TypeScript + Tailwind CSS**.
Desain = replikasi persis `renlenon.vercel.app`. Folder ini = repo GitHub `kianlabs/cv`.
**JANGAN** menyentuh repo/site lain (khususnya `kyandev.vercel.app`).

## 2. Tujuan

- Satu halaman portfolio bergaya dark minimalist (mengikuti referensi; ukuran, spacing, warna, font, layout).
- Tombol **View Resume** membuka CV (`/cv-ridzkyan.pdf`).
- **Dark theme default + toggle light/dark** (persis referensi; tombol toggle di navbar).
- **Heatmap kontribusi GitHub live** (12 bulan) yang selalu sinkron dengan akun GitHub.

## 3. Material sumber (semua ada di folder ini)

| File | Kegunaan |
|---|---|
| `stitch-export.html` | Acuan struktur & konten lama (light theme, bukan lagi acuan visual) |
| `DESIGN.md` | Token desain — **direvisi** ke dark minimalist (acuan styling) |
| `cv-ridzkyan.pdf` | File CV final → `public/cv-ridzkyan.pdf` (akses `/cv-ridzkyan.pdf`) |

## 4. Struktur halaman (SAMA PERSIS dengan referensi)

Urutan & nama section mengikuti `renlenon.vercel.app`:

1. **Navbar** — sticky, logo inisial `RP`, link: Projects, Experience, Highlights, tombol **View Resume**, **toggle tema** (moon/sun).
2. **Hero** — avatar bulat, nama + badge verified, headline peran (**Laravel · React · Next.js**), bio dengan inline tech badges (**Laravel · React · Next.js · MySQL**), tombol **View Resume**.
3. **Experience** — layout 2-kolom (kiri: tanggal mono, kanan: role + deskripsi). KyanDev: **Mar 2025 — Present**.
4. **Featured Work** — grid 2 kolom, kartu gelap dengan dot-grid, badge status "Production Ready", tech tags.
5. **Projects** — grid 3 kolom, kartu dengan area preview, judul, deskripsi, tech chips, badge "Coming Soon"/"In Progress".
6. **Technologies** — chip dengan **logo brand berwarna** (`components/techs.ts`), plus grup **AI Engineering** (LLM API Integration, RAG, MCP, Prompt Engineering, AI Agents).
7. **Certifications** — list vertikal (tanggal kiri, logo + judul kanan). Placeholder tetap placeholder.
8. **Education** — layout timeline (tanggal kiri, gelar + GPA kanan). GPA sebagai **teks polos** (tanpa pill/warna).
9. **Outside the IDE** — 2 kolom (teks + chips kiri, gambar kartu kanan).
10. **GitHub Activity** — **heatmap kontribusi live** 12 bulan (bukan kartu profil statis). Desktop fit-to-card; mobile scroll horizontal + auto ke bulan terakhir.
11. **Let's work together** — 2 kolom (deskripsi + status kiri, kartu kontak kanan).
12. **Footer** — quote, copyright, lokasi.
13. **Chat widget** — tombol floating kanan bawah "Chat with Kyan", panel chat + quick-reply chips.

## 5. Functional requirements (WAJIB)

### 5.1. Dark + toggle
- **Default dark** (`class="dark"` di `<html>`), sama seperti referensi.
- **Toggle light/dark** di navbar (ikon moon/sun).
- Preferensi disimpan (`localStorage`), hormati `prefers-color-scheme` saat pertama.
- Script anti-FOUC di `<head>` (set class sebelum render).

### 5.2. GitHub Activity — heatmap kontribusi live
- **Heatmap kontribusi 12 bulan** yang menarik data live dari GitHub (via `github-contributions-api.jogruber.de`, username `kianlabs`). Selaras dengan grafik kontribusi GitHub asli.
- **Desktop**: heatmap diregangkan pas lebar kartu (sel rapat seperti GitHub).
- **Mobile**: heatmap bisa di-scroll horizontal, **otomatis ter-geser ke bulan terakhir** saat dibuka.
- Data kontribusi **nyata** (bukan karangan); angka total ditampilkan dari API.

### 5.3. Link mati dilarang
- "READ CASE STUDY" (UangKu, GaweTracker) → tombol **disabled** "Case Study — Coming Soon".
- "VISIT SITE" (KRING!, NobarHub, JamKosong) → badge **"Coming Soon"** (disabled), bukan link.
- "View credential" (sertifikasi placeholder) → hapus.
- "Schedule a Call" → `mailto:ridzkyan0504@gmail.com`.

### 5.4. Tombol CV
Hanya **"View Resume"** (navbar + hero) → `href="/cv-ridzkyan.pdf"`. Tombol "Download CV" **dihapus** (cukup satu tombol). Chip chat: "Resume".

### 5.4b. Warna badge & logo
- Badge/chip berwarna **dipertahankan** (status Production Ready, Coming Soon/In Progress, ikon verified, dot online).
- **Technologies** memakai **logo brand berwarna** (SVG dari `components/techs.ts`), bukan dot polos.
- **GPA** di Education dirender sebagai **teks polos** (tanpa pill/warna).

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

1. **JANGAN mengarang**: nama/isi sertifikasi, URL live proyek, statistik kontribusi, link repo. (Tanggal mulai KyanDev sudah ditetapkan owner: **Mar 2025**.)
2. Placeholder (`[Date TBD]`, `Placeholder 01/02`) **TETAP** placeholder sampai owner mengisi.
3. **JANGAN** `git push`, **JANGAN** deploy — kecuali owner minta eksplisit.
4. Jangan menambahkan halaman/rute baru di luar satu halaman portfolio ini.
5. **JANGAN** menyalin aset berhak cipta (foto orang lain) — pakai placeholder/gambar sendiri. Logo brand teknologi memakai SVG resmi (simple-icons) yang diizinkan.

## 8. Acceptance criteria

- [ ] `npm run build` sukses.
- [ ] Tampilan dark minimalist sesuai referensi: ukuran font, spacing, warna, layout.
- [ ] Dark default + toggle tema berfungsi & tersimpan.
- [ ] Semua 13 section ada.
- [ ] Tidak ada `href="#"` hidup.
- [ ] "View Resume" membuka `/cv-ridzkyan.pdf`.
- [ ] Heatmap kontribusi menampilkan data **nyata** 12 bulan (desktop fit-to-card; mobile auto-scroll ke bulan terakhir).
- [ ] Technologies memakai logo brand berwarna + grup AI Engineering.
- [ ] GPA sebagai teks polos (tanpa pill/warna).
- [ ] Chat widget: ketik `<img src=x onerror=alert(1)>` → tampil sebagai teks polos.
- [ ] Responsif: 360px (mobile) & 1280px (desktop), tidak ada overflow horizontal.
