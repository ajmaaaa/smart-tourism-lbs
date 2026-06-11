# Pembaruan Desain Frontend Explore Penyengat

## Tujuan
Pembaruan ini mengubah tampilan website menjadi modern minimalis dengan nuansa Melayu yang tetap halus dan mudah digunakan. Fitur backend, peta Leaflet, pencarian destinasi, routing A*, chatbot AI, dan halaman admin tetap dipertahankan.

## Perubahan utama
- `frontend/index.html`: metadata SEO dasar, tema browser, favicon, dan deskripsi website.
- `frontend/public/penyengat-mark.svg`: ikon baru dengan bentuk masjid sederhana dan warna hijau-emas.
- `frontend/src/components/Navbar.jsx`: navbar responsif, tombol menu untuk perangkat kecil, dan akses cepat ke Pak Cik Penyengat.
- `frontend/src/components/HeroSection.jsx`: hero baru, informasi singkat kunjungan, peta lebih ringkas, dan hierarki tombol yang lebih jelas.
- `frontend/src/components/AboutSection.jsx`: narasi lebih ringkas dan badge yang tidak mengklaim status UNESCO.
- `frontend/src/components/VisitorGuideSection.jsx`: bagian baru untuk menampilkan data transportasi, sejarah, dan FAQ dari endpoint backend.
- `frontend/src/components/ContactSection.jsx`: kontak dan footer diperbarui tanpa nomor telepon atau akun media sosial dummy.
- `frontend/src/styles/global.css`, `app.css`, dan `hero.css`: sistem desain baru dengan warna hijau tua, emas, krem, tipografi serif untuk judul, kartu sederhana, serta ornamen geometris Melayu yang tidak berlebihan.

## Menjalankan frontend lokal
```bash
cd frontend
npm install
npm run dev
```

## Memeriksa build produksi
```bash
cd frontend
npm install
npm run build
```

## Memasang di VPS dengan Docker Compose
Dari direktori utama proyek:
```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build frontend
```

Jika nama service frontend pada server berbeda, jalankan seluruh service:
```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```
