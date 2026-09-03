# Content & Copyright Policy: Ethical Practice & IP Protection

> **Policy Directive:** Compliance, Fair Use, Intellectual Property Integrity & Original Item Synthesis  
> **Applicable Entity:** PTE Academic Personal Intelligence Platform (Localhost)  
> **Status:** Mandatory Enforcement Baseline  
> **Effective Date:** 2026-09-02  

---

## 1. Core Principles & Statutory Compliance

Aplikasi ini dirancang sebagai instrumen pembelajaran pribadi (*personal educational software*) yang beroperasi di lingkungan komputer lokal (*localhost*). Platform menjunjung tinggi standar etika akademik dan kepatuhan hukum hak cipta internasional (termasuk *Australian Copyright Act 1968* dan *Undang-Undang No. 28 Tahun 2014 tentang Hak Cipta RI*).

### Lima Prinsip Tanpa Kompromi:
1.  **Dilarang Keras Menyimpan Soal Bocoran (*Live Exam Dumps / Leaks*):**  
    Aplikasi dilarang keras mengumpulkan, menyimpan, mendistribusikan, atau memfasilitasi materi yang bersumber dari kecurangan ujian, rekaman ilegal di test center, atau bank soal curian.
2.  **Dilarang Menyimpan Salinan Penuh Materi Berhak Cipta Tanpa Izin:**  
    Materi dari platform komersial (seperti APEUni, AlfaPTE, Pearson Official Books) tidak boleh diduplikasi secara penuh (*verbatim cloning*) ke dalam database lokal.
3.  **Hanya Menyimpan Metadata, Hash, dan Kutipan Pendek yang Diizinkan (*Fair Dealing / Fair Use*):**  
    Sistem hanya diizinkan menyimpan ringkasan analitis, pointer URL, checksum SHA-256, dan kutipan singkat (*short excerpts*) untuk keperluan verifikasi fakta dan benchmarking pedagogis.
4.  **Sintesis Berbasis Blueprint (*Blueprint-Driven Original Generation*):**  
    Seluruh soal latihan yang disajikan kepada pengguna harus merupakan **soal orisinal baru yang digenerate oleh AI lokal (Ollama)** berdasarkan parameter blueprint pedagogis, bukan salinan soal ujian aktual.
5.  **Penggunaan Nama Tipe Soal Secara Nominatif (*Nominative Fair Use*):**  
    Penyebutan nama-nama tipe soal (seperti *"Read Aloud"*, *"Repeat Sentence"*, *"Write From Dictation"*) dan nama *"PTE Academic"* dilakukan murni untuk tujuan identifikasi deskriptif dan edukatif, tanpa klaim terafiliasi atau didukung oleh Pearson PLC.

---

## 2. Paradigma Blueprint: Dari Analisis ke Soal Orisinal

Tujuan dari proses audit dan analisis sumber bukanlah menyalin kalimat soal, melainkan mengekstrak **DNA struktural (Blueprint)**:

```
[Materi Referensi Eksternal] 
       │ (Dilarang Simpan Verbatim)
       ▼
[Ekstraksi Parameter Pedagogis]
 ├── Formula Instruksi & Panjang Kata
 ├── Profil Kesulitan CEFR (A2, B1, B2)
 ├── Pola Distraktor & Jebakan Gramatikal
 ├── Domain Topik Akademik / Umum
 └── Kolokasi & Frekuensi Kosakata
       │
       ▼
[Question Blueprint Schema (JSON)]
       │
       ▼
[Ollama Local AI Generator] ───► [Deteksi Duplikasi / Plagiarisme]
                                          │
                                          ▼
                               [Soal Latihan Orisinal 100%]
```

### Atribut Wajib Setiap Soal Latihan Orisinal:
Setiap item latihan yang dibuat dan disimpan ke dalam database `original_exercise_items` wajib memiliki metadata:
*   `blueprint_id`: ID rancangan struktur yang digunakan.
*   `generation_prompt_hash`: Hash prompt yang digunakan oleh Ollama.
*   `uniqueness_score`: Skor keunikan terhadap database lokal dan referensi umum (wajib $\ge 90\%$).
*   `license_status`: `ORIGINAL_AI_GENERATED_PUBLIC_DOMAIN`.
*   `approval_status`: `REVIEWED_AND_APPROVED`.

---

## 3. Protokol Deteksi Duplikasi & Plagiarisme

Sebelum sebuah soal hasil generasi AI masuk ke dalam Bank Soal aktif:
1.  **Lexical Matching (Jaccard & Levenshtein):** Memeriksa apakah teks kalimat memiliki tingkat kesamaan kata berurutan $> 30\%$ dengan bank referensi yang tersimpan.
2.  **Semantic Similarity Threshold:** Menggunakan vector embedding lokal untuk mendeteksi apakah kalimat merupakan parafrase dangkal dari soal resmi Pearson yang terkenal.
3.  **Rejection Action:** Jika kesamaan melebihi ambang batas, item langsung dibuang (*auto-discard*) dan AI diminta melakukan regenerasi dengan benih topik (*seed topic*) baru.

---

## 4. Batasan Klaim & Disclaimer Legal

Aplikasi harus secara transparan menampilkan pernyataan berikut pada footer UI dan halaman hasil tes:

> **Pernyataan Hukum (Legal Disclaimer):**  
> *"Aplikasi ini adalah platform intelijen persiapan pribadi independen dan TIDAK terafiliasi, disponsori, atau disetujui oleh Pearson PLC maupun Department of Home Affairs Australia. Skor yang ditampilkan merupakan estimasi feedback formatif berdasarkan model AI lokal dan BUKAN jaminan skor resmi ujian Pearson PTE Academic."*
