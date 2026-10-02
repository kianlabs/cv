# PRD — Portfolio Website (repo: `cv`)

## 1. Ringkasan

Bangun website portfolio + CV untuk **Ridzkyan Buti Pratama** (panggilan: Kyan) memakai **Next.js (App Router) + TypeScript + Tailwind CSS**.
Init project Next.js di folder ini langsung. Folder ini nantinya menjadi repo GitHub `kianlabs/cv`.
**JANGAN** menyentuh repo/site lain (khususnya `kyandev.vercel.app`).

## 2. Tujuan

- Satu halaman portfolio yang rapi: headline, experience, karya, proyek, teknologi, pendidikan, kontak.
- Tombol **Download CV / View Resume** harus benar-benar mengunduh CV.
- **Light theme only** — tidak ada dark mode.

## 3. Material sumber (semua ada di folder ini)

| File | Kegunaan |
|---|---|
| `stitch-export.html` | Acuan struktur & konten (hasil export Google Stitch, satu file HTML) |
| `DESIGN.md` | Token warna "Obsidian & Mint" — pakai sebagai dasar styling |
| `cv-ridzkyan.pdf` | File CV final → **pindahkan ke `public/`** supaya bisa diakses via `/cv-ridzkyan.pdf` |

Screenshot target desain sudah dikonfirmasi owner (terlampir di chat).

## 4. Struktur halaman (sections, sesuai `stitch-export.html`)

1. **Header/nav** — logo "RP", nama + badge verified, link: Projects, Experience, Highlights, tombol **Download CV**.
2. **Hero** — headline "Full-Stack Web Developer — Next.js · React · TypeScript", bio singkat, tombol **View Resume** + **Download CV**.
3. **Experience** — "Freelance Web Developer — KyanDev (Self-employed)", periode **"[start date TBD] — Present"** (TETAP seperti itu, jangan diisi).
4. **Featured Work** — kartu **UangKu** (Personal Finance App) dan **GaweTracker** (Job Application Tracker), masing-masing ada tombol "READ CASE STUDY".
5. **Projects** — kartu **KRING!** (Point of Sale System), **NobarHub** (Movie Catalog & Discovery), **JamKosong** (Multi-niche Booking & Queue, label IN PROGRESS). Masing-masing ada "VISIT SITE".
6. **Technologies** — chips: React, Next.js, TypeScript, JavaScript, Tailwind CSS, Astro, FastAPI, PostgreSQL, Node.js, Python, HTML/CSS, Git.
7. **Certifications** — "Placeholder 01 — Certification" dan "Placeholder 02 — Technical Workshop" (**TETAP placeholder**, jangan diisi/dikarang).
8. **Education** — Bachelor of Informatics Engineering, Universitas Duta Bangsa Surakarta, 2022–2026, GPA 3.69/4.00.
9. **Outside the IDE** — teks santai + chips Technology/Business/AI.
10. **GitHub Activity** — lihat requirement khusus di bawah (bukan heatmap).
11. **Let's work together** — kartu kontak: Email, GitHub, LinkedIn, "Schedule a Call".
12. **Footer** — quote *"Repetition until it becomes technique."*, "© 2026 Ridzkyan Buti Pratama · Built with Next.js".
13. **Chat widget** — tombol floating "Chat with Ridzkyan" (kanan bawah), panel chat dengan quick-reply chips: Projects, Download CV, Contact.

## 5. Functional requirements (WAJIB)

### 5.1. Light theme only
Hapus total tombol theme toggle. Tidak ada class/logika dark mode.

### 5.2. GitHub Activity — ganti heatmap palsu
File export menggambar heatmap kontribusi memakai `Math.random()` — **HAPUS total**.
Ganti dengan **kartu profil GitHub statis** yang link ke `https://github.com/kianlabs`.
**JANGAN** mengarang angka kontribusi, streak, atau statistik apa pun.

### 5.3. Bereskan semua link mati (`href="#"`, ada 10 di file export)
Aturan: yang belum punya URL asli **JANGAN** dijadikan link mati.
- "READ CASE STUDY" (UangKu, GaweTracker) → belum ada URL case study: render sebagai tombol **disabled** berlabel "Case Study — Coming Soon", atau hapus tombolnya. Pilih yang paling rapi.
- "VISIT SITE" (KRING!, NobarHub, JamKosong) → belum ada yang live: render sebagai badge **"Coming Soon"** (disabled), bukan link.
- "View credential" (sertifikasi placeholder) → hapus, karena sertifikasinya placeholder.
- "Schedule a Call" → `mailto:ridzkyan0504@gmail.com`.

### 5.4. Tombol CV
"View Resume" dan "Download CV" (header + hero + chat quick-reply) → `href="/cv-ridzkyan.pdf"`.

### 5.5. Chat widget — anti XSS
Input user **JANGAN** dirender via `innerHTML` / `dangerouslySetInnerHTML`. Pakai React state + render sebagai plain text.
Pertahankan: tombol floating, header, tombol close, greeting, quick-reply chips (pakai keyword-matching sederhana untuk `project`, `cv`/`resume`, `contact`/`email`, `experience`).

### 5.6. Font & ikon
Hapus `<link>` CDN Google Fonts dan Material Symbols dari file export.
- Font: pakai `next/font` — **Geist** (body) + **JetBrains Mono** (mono/aksen).
- Ikon: inline SVG (jangan CDN icon font).

### 5.7. Data kontak (pakai persis, jangan diubah)
- Email: `ridzkyan0504@gmail.com`
- GitHub: `https://github.com/kianlabs`
- LinkedIn: `https://linkedin.com/in/ridzkyan-pratama-7911b441b`

## 6. Non-functional requirements

- Responsive, mobile-first.
- HTML semantik (`header`, `main`, `section`, `footer`).
- SEO dasar: `<title>`, meta description, Open Graph dasar.
- Aksesibilitas dasar: `label` pada input chat, `alt` pada gambar, `focus-visible` pada elemen interaktif.
- `npm run build` **harus lolos tanpa error**.

## 7. Batasan keras (JANGAN dilanggar)

1. **JANGAN mengarang**: tanggal mulai KyanDev, nama/isi sertifikasi, URL live proyek, statistik kontribusi, link repo.
2. Placeholder (`[start date TBD]`, `Placeholder 01/02`) **TETAP** placeholder.
3. **JANGAN** `git push`, **JANGAN** deploy ke Vercel/Netlify — kerja lokal saja, owner yang push sendiri.
4. Jangan menambahkan halaman/rute baru di luar satu halaman portfolio ini (kecuali yang memang ada di desain).

## 8. Acceptance criteria

- [ ] `npm run build` sukses.
- [ ] Halaman tampil sesuai desain (cocokkan dengan screenshot): semua 13 section ada.
- [ ] Tidak ada `href="#"` yang masih hidup sebagai link.
- [ ] Tombol Download CV mengunduh `/cv-ridzkyan.pdf` (klik dan cek file terdownload).
- [ ] Tidak ada theme toggle di halaman mana pun.
- [ ] Tidak ada heatmap kontribusi palsu.
- [ ] Chat widget: ketik `<img src=x onerror=alert(1)>` → harus tampil sebagai teks polos, tidak dieksekusi.
- [ ] Responsif: cek lebar 360px (mobile) dan 1280px (desktop), tidak ada overflow horizontal.
