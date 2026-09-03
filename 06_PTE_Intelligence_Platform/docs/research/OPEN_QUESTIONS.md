# Open Questions & Architectural Decisions: Decision Matrix

> **Document Type:** Systems Engineering Trade-off & Open Problem Ledger  
> **Status:** Open for User Review & Research Gate Approval  
> **Last Updated:** 2026-09-02  

---

## 1. Matrix Pertanyaan Terbuka & Opsi Solusi

### Q1. Arsitektur Database: PostgreSQL Lokal (via Docker) vs Embedded SQLite + Vector Extension

*   **Latar Belakang:**  
    Aplikasi membutuhkan database relasional untuk 30+ entitas dan vector embedding untuk semantic search / deduplikasi soal. Preferensi awal menyarankan PostgreSQL lokal melalui Docker. Namun, lingkungan pengguna adalah mesin desktop Windows pribadi yang mungkin tidak selalu menjalankan Docker Daemon setiap saat.
*   **Opsi yang Dievaluasi:**
    *   *Opsi A (PostgreSQL + pgvector via Docker Compose):*  
        Kelebihan: Fitur database enterprise, konkurensi multi-worker solid, pgvector teruji.  
        Kekurangan: Membutuhkan Docker Desktop aktif terus-menerus di Windows, overhead RAM 1.5–2 GB.
    *   *Opsi B (SQLite + sqlite-vec / chromadb lokal embedded - DEREKOMENDASIKAN):*  
        Kelebihan: Zero-configuration, file database tunggal di folder workspace, tidak butuh Docker atau instalasi service Windows, sangat portabel untuk backup/restore, startup instan.  
        Kekurangan: Write lock jika banyak proses simultan menulis bersamaan (bisa diatasi dengan mode WAL).
*   **Rekomendasi Tim:**  
    Gunakan **Dual-Adapter Pattern**: Default instalasi berjalan di atas **SQLite + sqlite-vec** (tanpa Docker), dengan opsi upgrade ke **PostgreSQL** jika pengguna mengaktifkan mode Docker di setup wizard.

---

### Q2. Mesin Speech-to-Text (STT) Lokal untuk Penilaian Speaking Aksen Indonesia

*   **Latar Belakang:**  
    PTE menilai *Oral Fluency* dan *Pronunciation*. Untuk pengguna Indonesia level A2–B1, mesin STT harus mampu menghasilkan transkrip berstempel waktu per kata (*word-level timestamps*) tanpa salah mengenali aksen Indonesia sebagai hening atau gumaman acak.
*   **Opsi yang Dievaluasi:**
    *   *Opsi A (Whisper.cpp / Faster-Whisper model `small.en` atau `base.en` - DEREKOMENDASIKAN):*  
        Kelebihan: Sangat cepat di CPU menggunakan AVX2/int8 quantization, akurasi tinggi pada aksen non-native, menghasilkan word-level timestamps dan log-probability (confidence per kata).  
        Kekurangan: Membutuhkan library C++ runtime / CT2.
    *   *Opsi B (Vosk / Kaldi):*  
        Kelebihan: Sangat ringan.  
        Kekurangan: Kurang toleran terhadap artikulasi ragu dan aksen variatif.
*   **Rekomendasi Tim:**  
    Implementasikan **Faster-Whisper (`base.en` untuk CPU hemat daya, `small.en` jika ada GPU NVIDIA CUDA)** melalui Python local worker. Ekstrak confidence score dan jeda waktu antar-kata untuk mengukur durasi hening dan laju bicara (*Words Per Minute*).

---

### Q3. Mesin Text-to-Speech (TTS) Lokal untuk Audio Soal Listening & Group Discussion

*   **Latar Belakang:**  
    Soal Listening (WFD, RS, RL, SST, SGD) membutuhkan audio manusia yang jernih dengan variasi aksen (Australian, British, American) dan kecepatan bicara wajar (120–150 wpm). Soal baru *Summarize Group Discussion* membutuhkan audio 3 suara berbeda dalam 1 rekaman.
*   **Opsi yang Dievaluasi:**
    *   *Opsi A (Piper TTS lokal onnx - DEREKOMENDASIKAN):*  
        Kelebihan: 100% offline, latensi ultra-rendah (<1 detik generate audio), tersedia puluhan voice profile (en_AU, en_GB, en_US) kualitas natural.  
        Kekurangan: Perlu unduh model suara .onnx (~50MB per suara).
    *   *Opsi B (Kokoro-82M / Bark):*  
        Kelebihan: Sangat ekspresif.  
        Kekurangan: Berat di hardware jika tanpa GPU high-end.
*   **Rekomendasi Tim:**  
    Gunakan **Piper TTS** dengan bundle 3 suara (Aussie Male, British Female, US Male). Untuk soal *Summarize Group Discussion*, script generator akan menggabungkan 3 track vokal Piper secara terurut menjadi satu file MP3 audio diskusi.

---

### Q4. Spesifikasi Hardware & Pemilihan Model Ollama

*   **Latar Belakang:**  
    AI evaluasi dan generator soal orisinal harus berjalan di Ollama lokal. Kita perlu memetakan profil hardware pengguna:
*   **Matriks Pilihan Model:**
    *   *Tier Rendah (RAM 8 GB, No GPU):* `llama3.2:1b` atau `qwen2.5:1.5b` (Hanya untuk validasi format, ekstraksi ringkasan).
    *   *Tier Menengah (RAM 16 GB, CPU kuat atau GPU 4-6 GB - DEFAULT REKOMENDASI):* `qwen2.5:7b-instruct-q4_K_M` atau `mistral:7b-instruct-q4_0`. Sangat unggul dalam mengikuti rubrik JSON terstruktur dan evaluasi esai.
    *   *Tier Tinggi (RAM 32 GB, GPU $\ge 8$ GB VRAM):* `llama3.1:8b-instruct-q8_0`.
*   **Rekomendasi Tim:**  
    Setup Wizard akan mendeteksi RAM dan VRAM secara otomatis saat pertama kali dibuka, lalu merekomendasikan perintah `ollama pull` yang paling optimal untuk hardware tersebut.

---

### Q5. Penilaian Speaking: Pronunciation & Fluency Tanpa Proprietary Pearson

*   **Latar Belakang:**  
    Platform tidak boleh mengklaim mengetahui algoritma Pearson rahasia, namun harus memberikan feedback pedagogis yang adil terhadap aksen Indonesia.
*   **Formulasi Metrik Lokal Terbuka:**
    *   *Oral Fluency:* Dihitung secara deterministik dari sinyal audio:
        $$\text{Fluency Score} = f(\text{WPM}, \text{Pause Count} > 1.5s, \text{Chunking Ratio})$$
        Jika pengguna berbicara antara 120–160 WPM dengan jeda hening $< 1$ detik di tengah frasa, skor kelancaran tinggi.
    *   *Pronunciation (Keterpahaman):* Dihitung dari mean log-probability output Whisper STT per kata. Jika kata-kata kunci diartikulasikan cukup jelas untuk ditranskripsikan Whisper dengan confidence $> 85\%$, pengguna diberi skor pronunciation tinggi tanpa memotong nilai hanya karena aksen vokal Indonesia (*fair intelligibility*).

---

## 2. Status Keputusan untuk Research Gate

| Keputusan | Pilihan yang Diusulkan | Alasan Kritis |
| :--- | :--- | :--- |
| **Database Default** | SQLite + WAL + sqlite-vec | Menghilangkan hambatan Docker; zero-friction untuk pengguna lokal Windows. |
| **STT Engine** | Faster-Whisper (`base.en` / `small.en`) | Word timestamps akurat, cepat di CPU. |
| **TTS Engine** | Piper TTS (AU, GB, US profiles) | Ringan, offline, mendukung multi-speaker group discussion. |
| **Ollama Model Default** | Qwen2.5-7B-Instruct (4-bit quant) | Akurasi evaluasi rubrik JSON tertinggi di kelas 7B. |
| **Target Skor Latihan** | Overall 36+ | Bantalan keamanan di atas syarat resmi 24 (post-Aug 2025). |
