# PANDUAN PENGGUNA RESMI (USER MANUAL)
## PTE Academic Personal Intelligence Platform
### Khusus Persiapan Functional English — Australia Work and Holiday Visa (Subclass 462)

---

## 1. Landasan Hukum & Ketentuan Skor Visa WHV 462

1. **Target Skor Resmi Hukum (Department of Home Affairs Table 2):**
   * Berdasarkan pembaruan resmi pasca-7 Agustus 2025, ambang batas minimum *Functional English* untuk visa WHV subclass 462 adalah **PTE Academic Overall minimal 24**.
2. **Target Latihan Aman Platform:**
   * Platform ini menetapkan target latihan aman pada **Overall 36+** (setara CEFR B1). Buffer 12 poin ini melindungi Anda dari variasi teknis mikrofon, kegugupan hari ujian, dan fluktuasi sistem *scoring* Pearson.
3. **Ketentuan Penting Tiap Keterampilan (*No Per-Skill Minimum*):**
   * **TIDAK ADA syarat skor minimum per skill individu** untuk visa WHV 462. Anda hanya diwajibkan meraih skor *Overall* minimal 24.

---

## 2. Cara Menjalankan Aplikasi di Komputer Pribadi

Aplikasi ini berjalan **100% lokal** di komputer Anda tanpa memerlukan akun cloud, tanpa API berbayar, dan tanpa koneksi server eksternal.

### Cara 1: Peluncuran Sekali Klik (Direkomendasikan di Windows)
Cukup klik ganda file:
```text
D:\Hazza\Data Pribadi\ABROAD\run_platform.bat
```
Skrip ini akan otomatis memeriksa Node.js & Python, membuka browser Anda ke `http://localhost:3005/dashboard`, dan menjalankan server.

### Cara 2: Melalui Terminal Manual
```bash
cd "D:\Hazza\Data Pribadi\ABROAD"
npm run start -p 3005
```
Buka browser favorit Anda dan akses:
`http://localhost:3005` atau `http://localhost:3005/dashboard`.

---

## 3. Panduan Penggunaan Modul Aplikasi (Fase 1 – 8)

### 🏆 Executive Readiness Dashboard (`/dashboard`)
* Memantau estimasi skor *Overall* Anda saat ini secara *realtime*.
* Menampilkan status kelulusan regulasi (*Target 24: PASS*) dan status bantalan aman (*Target 36+: ON TRACK*).
* Menyajikan diagram 4 keterampilan: *Speaking*, *Writing*, *Reading*, dan *Listening*.
* Memiliki **Konsol Backup Lokal Terenkripsi** untuk mencadangkan database SQLite ke format `.gz` dengan verifikasi hash SHA-256.

### 🎯 Mode Latihan & Simulasi Ujian (`/practice`)
1. **Mode 1: Drill Fokus (Repetitive Practice):**
   * Latihan intensif berulang pada tipe soal tertentu (misal: *Read Aloud*, *Write From Dictation*, *Respond to a Situation*).
2. **Mode 2: Section Test (Timed Block):**
   * Simulasi seksi ujian resmi dengan batas waktu ketat:
     - Part 1: *Speaking & Writing* (~54–67 menit)
     - Part 2: *Reading* (~29–30 menit)
     - Part 3: *Listening* (~30–43 menit)
3. **Mode 3: Full Mock Simulator (2 jam 15 menit):**
   * Simulasi ujian penuh yang mereplikasi urutan soal Pearson, aturan penguncian mikrofon jika hening lebih dari 3 detik (*3-second silence rule*), serta penghitung kata *realtime* untuk esai.

### 🎙️ Konsol Evaluasi AI Speaking & Writing (`/practice/ai-evaluation`)
* **Speaking Evaluator:** Menghitung kecepatan bicara (*Words Per Minute* / WPM: ideal 120–165 WPM), kelancaran lisan (*Oral Fluency*), persentase pelafalan, dan audio synthesizer suara asli dengan **Aksen Australia (`en-AU`)**.
* **Writing Evaluator:** Menilai esai (*Write Essay*) dan ringkasan (*Summarize Written Text*) berdasarkan rubrik resmi, mendeteksi pelanggaran bentuk kalimat, serta memiliki **Heuristik Deteksi Template Kaku** untuk mencegah nilai nol dari algoritma Pearson.

### 🧠 Kurikulum Adaptif, Remediasi & Spaced Repetition (`/curriculum`)
* **Remediasi Berbobot Tinggi:** Mengarahkan waktu belajar Anda ke 4 tipe soal penyumbang nilai terbesar: *Write From Dictation* (100%), *Read Aloud* (95%), *Repeat Sentence* (90%), dan *Reading FIB* (88%).
* **Deck Flashcard SuperMemo SM-2:** Menghafal kalimat dan kosakata akademik dengan interval hari yang bertambah secara otomatis sesuai tingkat kemudahan Anda.
* **Rencana Belajar 2, 4, 8, atau 12 Minggu:** Jadwal harian yang membagi sesi Speaking pagi, Writing siang, dan Listening/Reading sore.
* **Australia Practical English Track:** Pelajaran bahasa Inggris kontekstual kehidupan kerja Australia:
  - AU-01: TFN (Tax File Number) ATO & Superannuation
  - AU-02: Buka Rekening Bank Australia (CommBank/NAB/ANZ) & 100-pt ID check
  - AU-03: Sertifikasi RSA & Komunikasi Barista Kopi Australia
  - AU-04: Komunikasi Kerja Casual Regional & Farm Harvest (88 hari visa tahun kedua)

### 📚 Bank Soal & Katalog 22 Blueprint (`/questions`)
* Berisi 22 blueprint resmi Pearson PTE (termasuk soal baru pasca-Agustus 2025: *Respond to a Situation* dan *Summarize Group Discussion*).
* Generator soal orisinal *Dual-Engine* (Ollama lokal + korpus akademik deterministik offline) dengan jaminan 100% bebas pelanggaran hak cipta.

### 🔍 Admin Sumber & Karantina Data (`/admin/sources`)
* Mengelola daftar izin (*allowlist*) situs resmi pemerintah Australia (`homeaffairs.gov.au`) dan Pearson (`pearsonpte.com`).
* Mengisolasi materi baru ke dalam antrean karantina dengan *zero-trust review console*.

---

## 4. Perlindungan Data, Backup & Keamanan
* Database utama terletak di `data/app_storage.sqlite3`.
* File backup tersimpan di folder `backups/backup_{timestamp}.sqlite3.gz`.
* Tidak ada data Anda yang dikirim ke internet atau server cloud.
