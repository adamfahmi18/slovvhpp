# Slovv HPP

Sistem manajemen **HPP (Harga Pokok Produksi)** full-stack — hitung biaya produksi,
kelola produk, pantau profitabilitas, dan dapatkan rekomendasi bisnis berbasis AI.

Dibangun dengan Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui,
Framer Motion, Supabase, Recharts, React Hook Form, dan Zod.

## 1. Prasyarat

- Node.js 20+
- Sebuah project [Supabase](https://supabase.com) (gratis sudah cukup)

## 2. Setup Supabase

1. Buat project baru di Supabase.
2. Buka **SQL Editor**, jalankan isi `supabase/schema.sql` — ini membuat seluruh
   tabel (`users`, `products`, `calculations`, `reports`, `analytics`,
   `app_settings`), trigger `updated_at`, mengaktifkan Row Level Security, dan
   membuat satu akun admin awal (`admin` / `change-this-password`).
3. Jalankan `supabase/02_bahan_baku.sql` — menambahkan tabel `raw_materials`
   (bahan baku) dan `product_recipe_items` (resep produk), sehingga biaya
   bahan baku produk dihitung otomatis dari resep alih-alih diketik manual.
4. Jalankan `supabase/03_overhead.sql` — menambahkan tabel `overhead_costs`
   (biaya tetap bulanan seperti sewa/gaji/listrik), kolom
   `app_settings.estimated_monthly_production`, dan kolom `overhead_cost` di
   `products`/`calculations`/`analytics`. Overhead per unit dihitung otomatis
   sebagai `total biaya overhead ÷ estimasi produksi bulanan` dan ikut masuk
   ke setiap perhitungan HPP (lihat menu **Overhead**).
5. **Ganti password admin** setelah login pertama kali dari halaman
   **Pengaturan → Ubah Password**, atau update langsung di database dengan:
   ```sql
   update public.users
   set password_hash = crypt('password-baru-anda', gen_salt('bf'))
   where username = 'admin';
   ```
6. *(Opsional)* Jalankan `supabase/seed.sql` (setelah ketiga file di atas)
   untuk data contoh (produk, resep, bahan baku, biaya overhead, dan 60 hari
   data analitik) agar Dashboard/Laporan/Analitik/Overhead langsung terisi.
5. Ambil `Project URL`, `anon public key`, dan `service_role key` dari
   **Project Settings → API** untuk langkah berikutnya.

## 3. Environment Variables

Salin `.env.example` menjadi `.env.local` lalu isi:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SESSION_SECRET=...          # string acak, minimal 32 karakter
AI_PROVIDER=anthropic       # atau "openai"
ANTHROPIC_API_KEY=...       # opsional — lihat catatan di bawah
OPENAI_API_KEY=...          # opsional
```

> **Fitur Analisis AI tetap berfungsi tanpa API key.** Jika `ANTHROPIC_API_KEY`
> / `OPENAI_API_KEY` tidak diisi, sistem otomatis memakai analisis berbasis
> aturan (rule-based) dari data yang ada, jadi fitur tidak pernah rusak di
> production. Isi salah satu key untuk analisis yang lebih kaya dan natural.

## 4. Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — Anda akan diarahkan ke
`/login`.

## 5. Deploy ke Vercel

1. Push repository ini ke GitHub/GitLab.
2. Import project di [vercel.com/new](https://vercel.com/new).
3. Tambahkan environment variables yang sama seperti `.env.local` di
   **Project Settings → Environment Variables**.
4. Deploy — `vercel.json` sudah dikonfigurasi untuk Next.js App Router.

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/login/          # Halaman login
│   ├── (dashboard)/           # Rute terproteksi: dashboard, calculator,
│   │                          # products, reports, analytics, settings
│   └── api/                   # REST API routes (auth, products, reports, ai)
├── actions/                   # Server actions (mutasi + fetch data per fitur)
├── components/
│   ├── ui/                    # Primitif shadcn-style (Button, Card, Dialog, ...)
│   ├── layout/                # Sidebar, TopNav, BottomNav, page transition
│   └── <fitur>/                # Komponen spesifik per halaman
├── lib/
│   ├── supabase/               # Client Supabase (server & browser)
│   ├── calculations/hpp.ts     # Logika inti perhitungan HPP
│   ├── ai/analyze.ts           # Integrasi AI + fallback rule-based
│   ├── export/                 # Export Excel (xlsx) & PDF (jsPDF)
│   ├── validations/            # Skema Zod
│   └── auth.ts / auth-edge.ts  # Sesi JWT (server & middleware)
├── types/                      # Tipe TypeScript bersama
└── middleware.ts                # Proteksi rute via cookie sesi
supabase/
├── schema.sql                  # Skema database lengkap
└── seed.sql                    # Data contoh opsional
```

## Catatan Desain & Asumsi

- **Autentikasi**: hanya login (username, password, remember me) sesuai
  permintaan — tidak ada register/forgot password/OTP/social login. Akun
  dikelola langsung di tabel `users` via SQL. Sesi disimpan sebagai JWT
  (`jose`) di cookie httpOnly, diverifikasi di Edge Middleware.
- **Target Margin** pada Kalkulator HPP & form Produk adalah parameter yang
  bisa disesuaikan (default dari Pengaturan Sistem) untuk menghasilkan
  *Selling Price Suggestion* dan *Margin %* — sesuai kebutuhan kalkulator HPP
  pada umumnya, karena margin adalah output yang bergantung pada target harga.
- **Reports** dihitung on-the-fly dari tabel `analytics` (bukan bergantung
  pada job terjadwal terpisah) agar selalu akurat begitu data analitik masuk.
- Tabel `app_settings` ditambahkan di luar 5 tabel inti untuk menyimpan
  Pengaturan Sistem (nama perusahaan, margin default, mata uang) secara
  persisten.
- **Resep & Bahan Baku**: setiap produk punya resep (bill of materials) yang
  menentukan `raw_material_cost`-nya secara otomatis dari
  `sum(quantity × price_per_unit)` bahan yang dipakai — bukan input manual.
  Mengubah harga satu bahan baku otomatis memperbarui HPP semua produk yang
  memakainya saat produk itu dibuka/disimpan ulang.
- **Overhead**: biaya tetap bulanan (sewa, gaji, listrik, dll) dikelola di
  menu Overhead terpisah dari biaya per-batch. `overhead_cost` yang masuk ke
  setiap kalkulasi/produk **selalu dihitung ulang di server**
  (`getOverheadPerUnit() × quantityProduced`), tidak pernah dipercaya dari
  input klien — pola yang sama seperti `raw_material_cost` dari resep — agar
  angka HPP tidak bisa dimanipulasi dari sisi browser.
- **Navigasi**: menu utama (bottom nav mobile) berisi Dashboard, Kalkulator,
  Produk, dan Bahan Baku; Overhead, Laporan, Analitik, dan Pengaturan berada
  di menu "Lainnya". Di sidebar desktop semua menu tetap tampil sejajar.
- Setiap query database berjalan di server (Server Actions / Route Handlers)
  menggunakan `service_role key`, sehingga Row Level Security tetap aktif
  dan tidak ada akses langsung dari browser ke Supabase.
