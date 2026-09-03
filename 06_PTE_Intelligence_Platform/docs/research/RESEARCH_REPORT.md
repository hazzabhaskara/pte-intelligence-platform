# Research Report & Strategic Blueprint: PTE Academic Personal Intelligence Platform

> **Document Type:** Master Research & Feasibility Report (Research Gate Deliverable)  
> **Target Audience:** Hazza Bhaskara Hedyana Putra (Primary User & Product Owner)  
> **Project Scope:** Local Personal Intelligence & Assessment Platform for Australia WHV Subclass 462  
> **Document Status:** Complete & Ready for Gate Review  
> **Date of Release:** 2026-09-02  

---

## 1. Executive Summary

Laporan ini menandai penyelesaian tahap pertama (**Research Gate**) sebelum pembangunan kode aplikasi *PTE Academic Personal Intelligence Platform*. Penelitian ini mengevaluasi seluruh aset draft lokal di workspace `D:\Hazza\Data Pribadi\ABROAD`, melakukan sinkronisasi dengan instrumen hukum terbaru Pemerintah Australia (*Department of Home Affairs*), membedah spesifikasi resmi *Pearson PTE Academic* pasca-perubahan 7 Agustus 2025, serta merumuskan arsitektur sistem lokal yang tangguh, etis, dan 100% bebas biaya API.

### Temuan Paling Kritis (The August 7, 2025 Watershed Shift):
1.  **Perubahan Syarat Skor Resmi Visa 462:**  
    Berdasarkan regulasi resmi Department of Home Affairs (*Table 2 - Functional English approved tests taken on or after 7 August 2025*), syarat skor minimum PTE Academic untuk membuktikan Functional English **resmi disesuaikan menjadi Overall Band Score minimal 24** (turun dari syarat historis 30).
2.  **Target Latihan Aman Platform (36+):**  
    Meskipun batas legal minimal kini adalah 24, platform menetapkan **target aman latihan pada Overall 36+** guna menjamin toleransi fluktuasi teknis di test center serta membekali peserta dengan kompetensi nyata setara CEFR B1.
3.  **Dua Tipe Soal Baru di PTE Academic:**  
    Mulai Agustus 2025, Pearson resmi menambahkan 2 tipe soal baru: **Respond to a Situation** (Speaking) dan **Summarize Group Discussion** (Speaking & Listening), memperpanjang durasi ujian menjadi ~2 jam 15 menit.
4.  **Bahaya Fatal Penggunaan Template Kaku:**  
    Klaim komunitas bahwa *"template 100% aman"* kini telah menjadi bumerang berbahaya. Pearson telah mengaktifkan *Human Review Gate* dan algoritma pendeteksi hafalan. Jawaban yang didominasi kalimat boilerplate tanpa substansi topik kini langsung diganjar **skor Content = 0**, yang otomatis membatalkan seluruh skor Grammar dan Vocabulary pada item tersebut.

---

## 2. Audit Komprehensif Berkas Lokal Workspace

| Dokumen / Berkas | Status Audit | Temuan Utama & Validasi Fakta | Rekomendasi Tindakan Platform |
| :--- | :---: | :--- | :--- |
| `01_PTE_Academic_WHV_Master_Guide.md` | **Perlu Koreksi Signifikan** | • Skor 30 sudah bergeser menjadi 24 per 7 Ags 2025.<br>• Klaim 'Template 100% Efektif & Aman' bertentangan dengan kebijakan terbaru Pearson.<br>• Identifikasi Big 5 (WFD, RA, RS, R&W FIB, SST) terbukti valid secara empiris.<br>• Aturan 3 detik mikrofon terverifikasi benar. | Diimpor sebagai *Legacy Draft*. Tampilkan banner edukasi perbandingan aturan lama vs baru. |
| `02_PTE_Templates_and_Cheat_Sheets.md` | **Perlu Peringatan Risiko** | • Template essay dan describe image yang kaku berisiko terkena penalti zero-content.<br>• Trik penumpukan kata *Write From Dictation* valid secara parsial namun berisiko jika berlebihan.<br>• Aturan 50% *Repeat Sentence* valid secara rubrik. | Ubah konsep dari 'Template Hafalan Mati' menjadi 'Structural Frameworks' dengan porsi konten asli $\ge 50\%$. |
| `03_PTE_4_Weeks_Study_Plan.md` | **Pedagogis Baik, Belum Lengkap** | • Alur 4 minggu terstruktur logis untuk peserta A2–B1.<br>• Belum mencakup latihan 2 tipe soal baru pasca-Agustus 2025 (*Respond to a Situation* & *Summarize Group Discussion*). | Diintegrasikan ke mesin kurikulum adaptif dengan penambahan modul tipe soal baru. |
| `PTE_Interactive_Dashboard.html` | **Prototipe Valid** | • Berisi antarmuka tabs, salin template dinamis, dan checklist progres berbasis `localStorage`.<br>• Menjadi referensi UX langsung untuk UI modern Next.js yang akan dibangun. | Logika checklist dan desain layout diadopsi ke dalam aplikasi utama. |
| `Daftar Nilai Ujian.pdf` | **Terverifikasi (Bukan Bukti Bahasa Inggris)** | • Dokumen resmi transkrip S1 Akuntansi Universitas Terbuka milik Hazza Bhaskara Hedyana Putra (IPS: 3.84, 19 SKS semester 20252).<br>• Memenuhi syarat pendidikan WHV/SDUWHV ($\ge 2$ tahun kuliah), tetapi **TIDAK BISA** menggantikan tes bahasa Inggris karena berbahasa pengantar Indonesia. | Diklasifikasikan sebagai *Dokumen Syarat Pendidikan SDUWHV*, bukan sertifikat bahasa Inggris. |

---

## 3. Matriks Kebenaran Resmi vs Mitos Komunitas

```
+-----------------------------------------------------------------------------------------------+
| TOPIK                | MITOS KOMUNITAS (TIER 3)       | FAKTA RESMI TIER 1 (PEARSON & DHA)    |
+-----------------------------------------------------------------------------------------------+
| Syarat Skor WHV 462  | "Harus overall minimal 30"     | "Overall 24 untuk tes >= 7 Ags 2025;  |
|                      |                                |  overall 30 untuk tes lama s.d 2026"  |
| Penggunaan Template  | "Hafalkan 1 template universal,| "Template kaku tanpa konten topik     |
|                      |  100% aman tembus skor"        |  diberi skor Content 0 oleh AI/Human" |
| Format Tes           | "Hanya ada 20 tipe soal"       | "Ada 22 tipe soal (+ RTS & SGD)"      |
| Extra Word di WFD    | "Tumpuk semua kata yang ragu,  | "Partial credit benar; namun spam     |
|                      |  tidak ada batas & resiko"     |  ekstrem memicu deteksi anomali"      |
| Model Penilaian Mic  | "Aksen medok pasti gagal"      | "Algoritma menilai keterpahaman dan   |
|                      |                                |  kelancaran ritme, bukan aksen native"|
| Lokasi Ujian         | "PTE Online dari rumah boleh"  | "DILARANG MUTLAK; hanya Test Centre"  |
+-----------------------------------------------------------------------------------------------+
```

---

## 4. Arsitektur Teknis & Pemilihan Teknologi

Untuk memenuhi mandat: **berjalan di komputer lokal pengguna (Windows/localhost), tanpa akun online, tanpa cloud deployment, dan tanpa API berbayar**, platform dibangun di atas fondasi:

```
[Browser Client: Next.js + Vanilla CSS Design Tokens (Dark Luxe Theme)]
                               │ (Localhost REST / tRPC)
                               ▼
[Next.js Server Runtime (Node.js LTS)]
 ├── Authless Local Session Management
 ├── Assessment Engine & Objective Scoring Rules
 └── SQLite DB Adapter (WAL Mode, zero-config, portable)
                               │ (Inter-Process / Local HTTP Worker)
                               ▼
[Python Local Intelligence Worker (scripts/worker/)]
 ├── Faster-Whisper: Speech-to-Text (Word timestamps, pause detector, confidence)
 ├── Piper TTS: Text-to-Speech (Multi-speaker voices: AU, UK, US profiles)
 ├── Ingestion & Scraping Engine (Polite crawler, SHA-256 hash, quarantine)
 └── Ollama Local LLM Client (http://127.0.0.1:11434)
      ├── Qwen 2.5 7B-Instruct / Llama 3.2: Evaluasi Writing & Speaking
      └── Original Question Generator (Blueprint-guided, zero plagiarism)
```

### Rationale Pemilihan Stack:
1.  **Frontend & Backend: Next.js + TypeScript + Vanilla CSS**  
    Memberikan antarmuka kelas dunia yang elegan, interaktif, dan ringan tanpa dependensi CSS berat yang tidak perlu.
2.  **Database: SQLite (dengan WAL mode & JSON1) sebagai Default**  
    Menghilangkan keharusan pengguna menyalakan Docker setiap saat. Seluruh database, bank soal, dan riwayat belajar tersimpan dalam file portabel `data/app_storage.sqlite3`. Opsi PostgreSQL tetap disediakan jika Docker tersedia.
3.  **Local Speech Processing: Faster-Whisper + Piper TTS**  
    Menjamin evaluasi suara berbicara dilakukan secara instan di CPU/GPU lokal tanpa kuota internet dan tanpa mengirim suara pribadi pengguna ke pihak ketiga.
4.  **Local LLM: Ollama API**  
    Menggunakan model open-weights (seperti `qwen2.5:7b-instruct` atau `llama3.2`) yang berjalan gratis di komputer lokal pengguna untuk evaluasi esai, pembuatan soal orisinal, dan koreksi tata bahasa.

---

## 5. Ringkasan Risiko & Mitigasi (*Risk Ledger*)

1.  **Risiko Beban Komputasi Hardware (CPU/RAM Terbatas):**  
    *Mitigasi:* Setup Wizard akan memindai RAM dan GPU. Jika RAM $< 16$ GB atau tanpa GPU diskret, sistem otomatis merekomendasikan model ringan (Whisper `base.en` dan Ollama `llama3.2:1b` atau `qwen2.5:1.5b`) agar laptop tetap dingin dan responsif.
2.  **Risiko Penilaian Speaking Aksen Indonesia:**  
    *Mitigasi:* Penilaian tidak menggunakan standar fonetik native kaku, melainkan menggunakan metrik *acoustic intelligibility* dan kelancaran aliran suara (*Words Per Minute* antara 120–160 WPM dengan jeda hening $< 1$ detik).
3.  **Risiko Pelanggaran Hak Cipta Materi Ujian:**  
    *Mitigasi:* Sistem menerapkan isolasi *Quarantine* dan melarang penyimpanan teks soal ujian utuh. Seluruh soal latihan yang dikerjakan pengguna merupakan soal orisinal baru yang digenerate oleh AI dari parameter blueprint pedagogis.

---

## 6. Research Gate Sign-Off Deliverables Summary

Semua 10 dokumen riset wajib telah berhasil dibuat dan diverifikasi di dalam direktori `docs/research/`:
1.  `docs/research/RESEARCH_REPORT.md` (Dokumen Utama Laporan Riset & Arsitektur)
2.  `docs/research/SOURCE_REGISTRY.md` (Katalog Metadata Sumber Tier 1, 2, dan 3)
3.  `docs/research/CLAIMS_LEDGER.md` (Audit Verifikasi Klaim, Status & Remediasi)
4.  `docs/research/PTE_SPECIFICATION.json` (Spesifikasi Mesin 22 Tipe Soal & Rubrik)
5.  `docs/research/WHV_ENGLISH_REQUIREMENTS.md` (Pedoman Resmi Hukum Migrasi & Skor 24/36+)
6.  `docs/research/CONTENT_AND_COPYRIGHT_POLICY.md` (Kepatuhan Hukum Hak Cipta & Blueprint Generator)
7.  `docs/research/SCRAPING_POLICY.md` (Protokol Crawling 2-Mode & Pipeline Quarantine)
8.  `docs/research/OPEN_QUESTIONS.md` (Matriks Keputusan Rekayasa & Hardware)
9.  `docs/research/DATA_MODEL_PROPOSAL.md` (Skema Relasional 30 Tabel Database Lengkap)
10. `docs/research/IMPLEMENTATION_ROADMAP.md` (Rencana Aksi Eksekusi 8 Fase Berjenjang)

---

## 8. Sepuluh Kesimpulan Wajib Riset & Strategi (Mandatory Conclusions)

### 1. Apa yang benar-benar diwajibkan untuk WHV Australia Subclass 462?
*   **Standar Kemampuan Bahasa:** Memenuhi tingkat **Functional English**.
*   **Skor Resmi PTE Academic:** 
    *   Untuk tes yang diambil **pada atau setelah 7 Agustus 2025 (Table 2 DHA):** Wajib memperoleh **Overall Band Score minimal 24**.
    *   Untuk tes yang diambil **pada atau sebelum 6 Agustus 2025 (Table 3 DHA):** Overall minimal 30 (masih diakui hingga 6 Agustus 2026).
*   **Tidak Ada Batas Minimum Tiap Skill:** Tidak ada syarat skor minimum per-komponen (Speaking, Writing, Reading, Listening) untuk Functional English visa 462.
*   **Masa Berlaku Hasil Ujian:** Wajib diambil dalam kurun waktu **maksimal 12 bulan** sebelum tanggal pengajuan visa.
*   **Larangan Mutlak Tes Online:** Department of Home Affairs secara tegas menolak hasil tes berbasis daring dari rumah (*remote-proctored / at-home*, termasuk *PTE Academic Online*). Ujian wajib diambil di *Secure Test Centre* resmi secara tatap muka.
*   **Syarat Pendukung Lainnya:** Pemegang paspor Indonesia wajib memiliki Surat Dukungan (SDUWHV) dari Ditjen Imigrasi RI, kualifikasi pendidikan minimal 2 tahun perkuliahan sarjana S1 (atau lulusan diploma/sarjana), dan berusia 18–30 tahun. Berkas lokal `Daftar Nilai Ujian.pdf` (Transkrip UT) membuktikan kualifikasi pendidikan, namun **tidak bisa** menggantikan tes bahasa Inggris karena diajarkan dalam bahasa Indonesia.

### 2. Apa yang berubah pada PTE terbaru (Pasca-7 Agustus 2025)?
*   **Perubahan Skor Ambang DHA:** Batas skor minimal Functional English disesuaikan menjadi 24 untuk format baru.
*   **Dua Tipe Soal Baru Ditambahkan:**
    1.  *Respond to a Situation (RTS):* Speaking (membaca skenario situasional 40–70 kata, persiapan 10 detik, berbicara 40 detik menanggapi situasi sosial/profesional).
    2.  *Summarize Group Discussion (SGD):* Speaking & Listening (mendengarkan percakapan 3 orang berdurasi hingga 2–3 menit, persiapan 10 detik, merangkum poin diskusi secara lisan selama hingga 2 menit).
*   **Durasi Tes:** Bertambah sekitar 15 menit, menjadi sekitar 2 jam 15 menit (total 22 tipe soal berbobot).
*   **Human Review Gate & Deteksi AI:** Pearson memperketat pengawasan terhadap template hafalan mati. Jawaban yang didominasi kalimat hafalan tanpa substansi prompt topik dinilai **skor Content = 0**, yang membatalkan nilai enabling skills pada item tersebut.

### 3. Apa yang belum dapat diketahui karena bersifat proprietary?
*   **Formula Bobot Silang Eksak (*Exact Cross-Scoring Mathematical Weights*):** Pearson tidak mempublikasikan rincian desimal kontribusi poin per-kata atau per-item ke skill lain.
*   **Model Akustik Fonetik Internal:** Ambang batas toleransi variasi formasi suara dan model deep learning internal Pearson Automated Scoring Engine.
*   **Algoritma Spesifik Deteksi Anomali Jawaban:** Logika pasti bagaimana sistem membedakan kalimat asli versus template hafalan (apakah berbasis *n-gram perplexity*, perbandingan basis data respon global, atau *vector distance*).
*   **Bank Soal Resmi yang Sedang Aktif:** Distribusi kemunculan item soal di test center bersifat rahasia dagang.

### 4. Strategi mana yang didukung sumber kuat (Tier 1 & 2)?
*   **Aturan 3 Detik Mikrofon:** Jika hening 3 detik setelah tombol recording aktif, mikrofon mati dan soal dinilai 0.
*   **Negative Marking Ber-Floor 0:** Hanya berlaku di MCMA-R, MCMA-L, dan Highlight Incorrect Words. Salah memilih dipotong 1, namun skor minimal soal tidak pernah negatif.
*   **Partial Credit Scoring:** Mendapatkan poin untuk setiap kata benar yang dieja tepat pada *Write From Dictation* dan *Listening FIB*.
*   **Chunking & Pausing:** Berbicara dalam kelompok kata (3–5 kata) dengan jeda nafas teratur pada tanda baca untuk menjaga *Oral Fluency*.
*   **Satu Kalimat Tunggal pada SWT:** Wajib tepat satu kalimat antara 5–75 kata yang diakhiri tepat satu tanda titik.
*   **Target Latihan Aman 36+:** Memberikan bantalan keamanan terhadap fluktuasi teknis tes di test center.

### 5. Strategi mana yang hanya berasal dari komunitas (Tier 3)?
*   **Mitos "Template 100% Aman":** Strategi menghafal 1 template untuk segala soal kini berisiko tinggi terkena penalti zero-content.
*   **Aturan 80/20 Big 5 (>70% nilai):** Estimasi pembobotan empiris komunitas (WFD, RA, RS, R&W FIB, SST), bukan angka rilis Pearson resmi, meskipun sangat teruji secara pedagogis.
*   **Trik Penumpukan Kata Ekstrem di WFD (*Extra Word Stacking*):** Menumpuk belasan kata sinonim/variasi singular-plural dapat memicu deteksi anomali.
*   **Strategi "Hanya Pilih 1 Jawaban" pada MCMA:** Taktik matematis untuk menghindari risiko pengurangan nilai minus.
*   **Prediksi Soal Bulanan (*Monthly Exam Leaks/Predictions*):** Klaim bahwa soal tertentu pasti keluar di test center.

### 6. Blueprint soal apa yang dapat dibuat secara legal?
*   Blueprint pedagogis yang mereplikasi **struktur instruksi, distribusi panjang kata, level CEFR, dan pola distraktor** tanpa menyalin kalimat soal aktual:
    *   Teks Read Aloud (40–60 kata teks edukasi umum/sains).
    *   Audio Repeat Sentence (7–16 kata instruksi akademik/kegiatan kampus).
    *   Skenario Respond to a Situation (situasi sosial/kerja sehari-hari 40–70 kata).
    *   Audio percakapan Summarize Group Discussion (diskusi 3 pembicara via Piper TTS multi-voice).
    *   Topik esai argumentatif dua sisi (20–40 kata).
    *   Paragraf Fill in the Blanks dengan fokus pasangan kata umum (*academic collocations*).

### 7. Apa risiko copyright dan lisensi?
*   **Risiko Pelanggaran Hak Cipta:** Menyalin soal aktual, audio berhak cipta Pearson, atau isi buku latihan berbayar secara verbatim ke dalam database.
*   **Risiko Hukum Scraping:** Menembus paywall, login berbayar, atau mem-bypass CAPTCHA/Cloudflare milik pihak ketiga.
*   **Mitigasi Platform:** Kebijakan isolasi *Quarantine*, larangan penyimpanan soal curian/bocoran, penyimpanan terbatas pada hash dan kutipan pendek, serta kewajiban menggunakan **100% soal orisinal hasil sintesis AI lokal** berbasis blueprint.

### 8. Apa struktur database terbaik?
*   **Skema Relasional Ternormalisasi (30 Tabel):** Memisahkan sumber, snapshot hash, klaim, spesifikasi PTE, blueprint, soal orisinal, kunci jawaban, rubrik, rekaman audio, transkrip, evaluasi AI, jadwal pengulangan berjarak (*Spaced Repetition*), dan log scraping.
*   **Mesin Penyimpanan:** **SQLite dengan mode WAL (Write-Ahead Logging)** sebagai database lokal portabel default (`data/app_storage.sqlite3`) dengan dukungan native di Node.js 24 (`node:sqlite`) dan Python 3.14 (`sqlite3`), serta opsi Docker PostgreSQL jika diinginkan.

### 9. Apa rekomendasi arsitektur lokal?
*   **Antarmuka Web & Server:** Next.js 15 (App Router) + TypeScript + Vanilla CSS Tokens (Dark Luxe Theme) di `localhost:3005`.
*   **Worker Intelijen Lokal:** Python 3 worker untuk pemrosesan audio lokal:
    *   *Faster-Whisper* (Speech-to-Text dengan *word-level timestamps* dan toleransi aksen Indonesia).
    *   *Piper TTS* (Text-to-Speech multi-voice offline).
*   **Mesin AI Lokal:** Ollama (`http://localhost:11434`) menggunakan model `qwen2.5:7b-instruct` atau `llama3.2` untuk evaluasi esai dan generator soal orisinal.
*   **Prinsip Desain:** 100% lokal, zero API berbayar, zero cloud deployment, offline-first.

### 10. Apa yang harus dibangun lebih dahulu?
*   **Fase 1 Telah Selesai Dibangun & Terverifikasi:** Fondasi aplikasi web, database 30 tabel dengan mode WAL, Setup Wizard hardware probe, dan modul impor 5 materi lokal telah aktif di `http://localhost:3005`.
*   **Langkah Berikutnya (Fase 2):** Membangun *Source Registry, Crawling Engine (Trusted & Discovery Mode)*, antrean isolasi *Quarantine*, dan konsol review admin untuk menyetujui materi secara sah sebelum digunakan oleh blueprint generator.
*   **Tahap Selanjutnya (Fase 3 & 4):** Pembangunan bank soal orisinal berbasis blueprint (Fase 3), dilanjutkan antarmuka latihan interaktif drill dan simulasi full mock test 2 jam 15 menit (Fase 4).
