# Issue: Aplikasi Pencatat Minum Susu Bayi

## Deskripsi
Membuat aplikasi website dengan tampilan mobile-first untuk mencatat history berapa ml bayi minum susu dalam sehari.

## Fitur Utama

### 1. Input Data
- Form input dengan field:
  - Jumlah mililiter (ml)
  - Waktu/jam minum
  - Tanggal (default: hari ini)
- Tombol simpan untuk mencatat data

### 2. History
- Tampilkan daftar semua record minum susu
- Setiap record menampilkan:
  - Waktu/jam
  - Jumlah ml
  - Tanggal
- Urutan dari yang terbaru
- Filter berdasarkan tanggal

### 3. Total Harian
- Tampilkan total ml yang diminum dalam sehari
- Update otomatis setiap ada input baru
- Bisa melihat total hari-hari sebelumnya

## Spesifikasi Teknis

### UI/UX
- Mobile-first responsive design
- Desain sederhana dan mudah digunakan
- Input cepat untuk kemudahan orang tua
- Tampilan list yang clean dan readable

### Data Storage
- LocalStorage untuk penyimpanan data di browser
- Struktur data JSON untuk setiap record

### Tech Stack (Saran)
- HTML5
- CSS3 (Mobile responsive)
- JavaScript vanilla atau framework ringan
- Progressive Web App (PWA) optional

## User Flow
1. User membuka aplikasi
2. User melihat total hari ini di bagian atas
3. User input ml dan jam
4. User klik simpan
5. Data tersimpan dan muncul di history
6. Total harian terupdate otomatis

## Nice to Have
- Export data ke CSV
- Notifikasi reminder
- Grafik/chart konsumsi harian
- Multi-anak support
- Dark mode
