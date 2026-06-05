# Panduan Deployment ke Google Cloud Platform (GCP) dengan Docker & SSL

Dokumen ini berisi panduan langkah-demi-langkah untuk menghosting aplikasi **Smart Tourism LBS** dari laptop Anda ke Google Cloud Platform menggunakan **Google Compute Engine (GCE)**, menghubungkan nama domain Anda, dan mengamankannya dengan **SSL (HTTPS)** gratis dari Let's Encrypt.

---

## Arsitektur Deployment yang Direkomendasikan
Untuk mempertahankan konfigurasi Docker Compose yang sudah ada, opsi terbaik dan paling hemat biaya adalah menggunakan **Google Compute Engine (VM Instance)**. 

Kita akan menggunakan setup berikut:
1. **VM Instance (Ubuntu LTS)** sebagai server host.
2. **Nginx** di server host sebagai reverse proxy untuk menangani SSL (HTTPS) dan mengarahkan lalu lintas ke container Docker.
3. **Certbot (Let's Encrypt)** untuk mengotomatisasi sertifikat SSL gratis.
4. **Docker & Docker Compose** untuk menjalankan database, backend, dan frontend di dalam container.

---

## Langkah 1: Membuat VM Instance di Google Compute Engine (GCE)

1. Masuk ke [Google Cloud Console](https://console.cloud.google.com/).
2. Buat project baru atau pilih project yang sudah ada.
3. Buka menu navigasi (kiri atas) -> **Compute Engine** -> **VM Instances**.
4. Klik **Create Instance**.
5. Konfigurasikan spesifikasi VM:
   - **Name**: `smart-tourism-server` (atau nama lain bebas).
   - **Region & Zone**: Pilih yang terdekat dengan pengguna Anda (misalnya `asia-southeast1` untuk Singapura atau `asia-southeast2` untuk Jakarta).
   - **Machine Configuration**: Pilih seri **E2** dengan machine type **e2-small** (2 vCPU, 2 GB RAM) atau **e2-medium** (2 vCPU, 4 GB RAM). Ini sudah lebih dari cukup untuk aplikasi ini.
   - **Boot Disk**: Klik *Change*, pilih OS **Ubuntu** versi **Ubuntu 22.04 LTS** atau **Ubuntu 24.04 LTS** (x86/64), dengan tipe disk *Balanced Persistent Disk* sebesar **20 GB** atau lebih.
   - **Firewall**: 
     - Centang **Allow HTTP traffic**.
     - Centang **Allow HTTPS traffic**.
6. Klik **Create** dan tunggu beberapa menit hingga VM selesai dibuat.

### Membuat IP Eksternal VM Menjadi Statis
Secara default, IP eksternal VM bersifat dinamis (bisa berubah saat VM di-restart). Kita harus mengubahnya menjadi statis agar domain tetap mengarah ke server yang sama:
1. Cari kolom pencarian di bagian atas GCP Console, ketik **VPC network** lalu pilih **IP addresses** (atau buka Menu -> VPC Network -> IP Addresses).
2. Temukan IP eksternal yang terikat dengan VM Anda (`smart-tourism-server`).
3. Pada kolom *Type*, ubah statusnya dari **Ephemeral** menjadi **Static**. Berikan nama (misal: `smart-tourism-static-ip`).
4. Catat IP Eksternal ini (misal: `34.101.X.X`).

---

## Langkah 2: Mengarahkan Domain Anda ke IP VM

Buka dashboard penyedia domain Anda (seperti Niagahoster, Domainesia, Rumahweb, GoDaddy, Namecheap, atau Cloudflare jika menggunakan nameserver Cloudflare).

Tambahkan dua **DNS Record** berikut:

| Type | Name | Value / Target | TTL | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `IP_EKSTERNAL_STATIS_VM_ANDA` | Auto / 3600 | Mengarahkan domain utama (`domainkamu.com`) |
| **A** | `www` | `IP_EKSTERNAL_STATIS_VM_ANDA` | Auto / 3600 | Mengarahkan subdomain `www` (`www.domainkamu.com`) |

*Catatan: Perubahan DNS memerlukan waktu propagasi berkisar antara beberapa menit hingga maksimal 24 jam.*

---

## Langkah 3: Menginstal Docker & Docker Compose di VM

1. Buka kembali halaman **VM Instances** di GCP Console.
2. Pada baris VM Anda, klik tombol **SSH** untuk membuka terminal langsung dari browser.
3. Perbarui paket sistem Anda terlebih dahulu:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
4. Install Docker dengan perintah resmi berikut:
   ```bash
   sudo apt install -y docker.io
   sudo systemctl enable --now docker
   ```
5. Install Docker Compose plugin:
   ```bash
   sudo apt install -y docker-compose-v2
   ```
6. Izinkan user Anda menjalankan docker tanpa `sudo` (opsional namun direkomendasikan):
   ```bash
   sudo usermod -aG docker $USER
   ```
   *Setelah menjalankan perintah di atas, tutup terminal SSH Anda dan klik tombol **SSH** kembali untuk menerapkan perubahan grup.*

---

## Langkah 4: Menyiapkan Kode Project di VM

Ada beberapa cara memindahkan project Anda dari laptop ke VM. Cara termudah adalah menggunakan **Git**:

1. Jika project Anda sudah di-push ke GitHub/GitLab (private atau public):
   ```bash
   git clone <URL_REPOSITORY_ANDA>
   cd smart-tourism-lbs
   ```
2. Jika belum menggunakan Git, Anda bisa membuat archive zip dari laptop Anda lalu mengunggahnya langsung melalui tombol **Upload File** di pojok kanan atas jendela SSH GCP Console. Setelah diunggah, install unzip dan ekstrak file tersebut:
   ```bash
   sudo apt install unzip
   unzip smart-tourism-lbs.zip
   cd smart-tourism-lbs
   ```

### Membuat File Konfigurasi `.env.production`
Salin file template environment ke file produksi asli:
```bash
cp .env.production.example .env.production
```

Edit file `.env.production` menggunakan editor teks `nano`:
```bash
nano .env.production
```

Sesuaikan nilai-nilainya:
```env
POSTGRES_DB=smart_tourism_lbs
POSTGRES_USER=postgres
POSTGRES_PASSWORD=BUAT_PASSWORD_DATABASE_YANG_RUMIT_DAN_PANJANG

FRONTEND_URL=https://domainkamu.com       # Ganti dengan nama domain Anda
GEMINI_API_KEY=AIzaSy...                  # Masukkan Gemini API Key dari Google AI Studio
GEMINI_MODEL=gemini-2.5-flash
JWT_SECRET=BUAT_STRING_RANDOM_YANG_PANJANG_UNTUK_KEAMANAN_TOKEN

ADMIN_EMAIL=admin@domainkamu.com          # Email login admin pilihan Anda
ADMIN_PASSWORD=PASSWORD_ADMIN_YANG_AMAN   # Password login admin pilihan Anda
```
*Tekan `Ctrl + O` lalu `Enter` untuk menyimpan, dan `Ctrl + X` untuk keluar dari Nano.*

---

## Langkah 5: Menyesuaikan Port Docker Compose untuk SSL

Agar kita bisa memasang SSL dengan mudah dan aman, kita akan menggunakan **Nginx** di level VM host sebagai gerbang masuk utama (port 80 dan 443). Nginx host ini nantinya akan mengarahkan lalu lintas (reverse proxy) ke container frontend.

Oleh karena itu, kita perlu mengubah port luar frontend dari port `80` ke port lain (misalnya `8080`), sehingga port `80` dan `443` di VM host bisa digunakan oleh Nginx server.

Mari sesuaikan [docker-compose.prod.yml](file:///home/ajmaaa/Git/smart-tourism-lbs/docker-compose.prod.yml):

Ubah bagian `frontend` port mapping:
```diff
   frontend:
     build:
       context: ./frontend
       args:
         VITE_API_URL: ""
     restart: unless-stopped
     depends_on:
       - backend
     ports:
-      - "80:80"
+      - "8080:80"
```

---

## Langkah 6: Menjalankan Docker Compose di Server

Sekarang build dan jalankan container Anda di server:

```bash
# Build dan jalankan container di background (-d)
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Setelah semua container aktif (`Running`), jalankan migrasi database Prisma dan database seeder di dalam container backend:

```bash
# Push schema database (Prisma)
docker compose --env-file .env.production -f docker-compose.prod.yml exec backend npm run db:push

# Masukkan data awal (Seeder) termasuk akun Admin
docker compose --env-file .env.production -f docker-compose.prod.yml exec backend npm run db:seed
```

Saat ini, aplikasi Anda sudah berjalan di dalam Docker dan dapat diakses di server melalui port 8080 (`http://IP_VM_ANDA:8080`).

---

## Langkah 7: Konfigurasi Nginx Host dan Let's Encrypt (SSL)

Sekarang kita akan memasang SSL agar domain Anda menggunakan `https://domainkamu.com`.

1. **Install Nginx dan Certbot di VM Host**:
   ```bash
   sudo apt update
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

2. **Buat file konfigurasi Nginx untuk domain Anda**:
   ```bash
   sudo nano /etc/nginx/sites-available/smart-tourism
   ```

   Masukkan konfigurasi berikut (ganti `domainkamu.com` dan `www.domainkamu.com` dengan domain asli Anda):
   ```nginx
   server {
       listen 80;
       server_name domainkamu.com www.domainkamu.com;

       # Maksimum ukuran file upload (misal untuk gambar galeri)
       client_max_body_size 20M;

       location / {
           proxy_pass http://127.0.0.1:8080; # Mengarahkan ke port docker frontend
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Aktifkan konfigurasi Nginx baru**:
   ```bash
   # Buat symbolic link ke folder sites-enabled
   sudo ln -s /etc/nginx/sites-available/smart-tourism /etc/nginx/sites-enabled/

   # Hapus konfigurasi default Nginx agar tidak bentrok
   sudo rm /etc/nginx/sites-enabled/default

   # Uji apakah konfigurasi Nginx sudah benar
   sudo nginx -t
   ```
   *Jika ada keterangan `syntax is ok` dan `test is successful`, reload Nginx:*
   ```bash
   sudo systemctl reload nginx
   ```

4. **Dapatkan dan Pasang Sertifikat SSL Gratis dengan Certbot**:
   Jalankan perintah Certbot untuk mengonfigurasi SSL secara otomatis di Nginx:
   ```bash
   sudo certbot --nginx -d domainkamu.com -d www.domainkamu.com
   ```
   - Certbot akan menanyakan alamat email Anda (untuk notifikasi kedaluwarsa sertifikat).
   - Setujui syarat dan ketentuan (ketik `A` lalu Enter).
   - Certbot secara otomatis akan memverifikasi domain Anda ke server Let's Encrypt, mengunduh sertifikat SSL, mengedit konfigurasi Nginx secara otomatis untuk mengaktifkan HTTPS, dan mengonfigurasi pengalihan (redirect) otomatis dari HTTP ke HTTPS.

5. **Verifikasi Auto-Renewal SSL**:
   Sertifikat Let's Encrypt berlaku selama 90 hari, tetapi Certbot secara default sudah memasang cron job untuk memperbaruinya secara otomatis sebelum kedaluwarsa. Uji proses ini dengan perintah:
   ```bash
   sudo certbot renew --dry-run
   ```
   *Jika tidak ada pesan error, fitur perpanjangan otomatis telah berfungsi dengan sempurna.*

---

## Langkah 8: Selesai!

Sekarang buka browser Anda dan kunjungi domain Anda:
- Halaman Utama: `https://domainkamu.com`
- Dashboard Admin: `https://domainkamu.com/admin`
- Periksa status gembok keamanan di browser untuk memastikan koneksi aman menggunakan HTTPS.

---

## Tips Perawatan & Pembaruan Aplikasi

Jika di kemudian hari Anda melakukan perubahan kode di laptop Anda dan ingin memperbarui aplikasi di server GCP:

1. Push perubahan kode terbaru dari laptop Anda ke repositori Git.
2. Hubungkan ke VM via SSH, lalu masuk ke folder project:
   ```bash
   cd smart-tourism-lbs
   git pull
   ```
3. Lakukan build ulang dan restart container Docker:
   ```bash
   docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
   ```
4. Jika ada perubahan schema Prisma (Database), jalankan kembali:
   ```bash
   docker compose --env-file .env.production -f docker-compose.prod.yml exec backend npm run db:push
   ```
