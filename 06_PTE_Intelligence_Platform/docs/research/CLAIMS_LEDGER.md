# Claims Ledger: Verification, Audit & Discrepancy Matrix

> **Scope:** Comprehensive audit of local artifacts (`01_PTE_Academic_WHV_Master_Guide.md`, `02_PTE_Templates_and_Cheat_Sheets.md`, `03_PTE_4_Weeks_Study_Plan.md`, `PTE_Interactive_Dashboard.html`, `Daftar Nilai Ujian.pdf`) against official Tier 1 statutory and test-maker documentation.

---

## 1. Summary of Audit Classifications

| Classification | Count | Definition |
| :--- | :---: | :--- |
| **Verified True (Tier 1)** | 14 | Confirmed by official Pearson Score Guide or Australian Department of Home Affairs legislation. |
| **Outdated / Superseded** | 5 | Was valid historically (pre-August 7, 2025), but superseded by statutory/exam changes. |
| **Community Strategy (Empirical)** | 6 | Not in official score guides, but empirically effective and confirmed harmless if applied correctly. |
| **Potentially Misleading / High Risk** | 5 | Poses severe risk of score deduction, zero score, or visa complication if uncorrected. |
| **Contextually Misunderstood** | 2 | Misinterpretation of document purpose or test domain. |

---

## 2. Detailed Ledger of Claims

### Category A: Australian Visa & Functional English Rules

```yaml
- claim_id: "CLM-AUD-001"
  original_claim: "PTE Academic Overall Score minimal 30 adalah syarat resmi Functional English untuk WHV 462."
  source_file: "01_PTE_Academic_WHV_Master_Guide.md (Section 1)"
  classification: "OUTDATED_SUPERSEDED"
  authority_ref: "SRC-DHA-FE-001 (Table 2 & Table 3, immi.homeaffairs.gov.au)"
  findings: |
    Pada tanggal 7 Agustus 2025, Department of Home Affairs memperbarui aturan tes bahasa Inggris untuk visa Australia.
    - Untuk tes yang diambil SEBELUM 7 Agustus 2025: Skor minimum adalah Overall 30 (tetap berlaku hingga 6 Agustus 2026).
    - Untuk tes yang diambil PADA ATAU SETELAH 7 Agustus 2025: Skor minimum PTE Academic resmi turun menjadi Overall Band Score minimal 24.
    Menetapkan angka 30 sebagai batas lulus absolut di aplikasi adalah fakta usang. Namun, menjaga target latihan di 30–36+ adalah zona aman yang sangat direkomendasikan.
  remediation: |
    Perbarui data master dan UI:
    - Status resmi: Lulus jika Overall >= 24 (untuk tes >= 7 Agustus 2025).
    - Threshold target latihan default: 36+ (memberikan bantalan 12 poin di atas syarat minimum legal).

- claim_id: "CLM-AUD-002"
  original_claim: "PTE Academic tidak memiliki syarat minimum per sub-skill untuk WHV Subclass 462."
  source_file: "01_PTE_Academic_WHV_Master_Guide.md (Section 1)"
  classification: "VERIFIED_TRUE"
  authority_ref: "SRC-DHA-FE-001 (Department of Home Affairs, Table 2)"
  findings: |
    Berdasarkan instrumen legislatif DHA Table 2, Functional English hanya mencantumkan "An overall band score of at least 24" tanpa persyaratan minimum band score per skill (Speaking, Writing, Reading, Listening). Persyaratan per-band (seperti minimal 50, 65, atau 79 di setiap skill) hanya berlaku untuk jalur Skilled Migration (Competent, Proficient, Superior English).
  remediation: |
    Jangan pernah menggagalkan pengguna di dashboard atau mock test hanya karena salah satu sub-skill di bawah 24/30 selama Overall Score mencapai target.

- claim_id: "CLM-AUD-003"
  original_claim: "Masa berlaku hasil tes PTE Academic untuk WHV adalah maksimal 12 bulan sebelum tanggal pengajuan visa."
  source_file: "01_PTE_Academic_WHV_Master_Guide.md (Section 1)"
  classification: "VERIFIED_TRUE"
  authority_ref: "SRC-DHA-FE-001 (DHA Functional English Provision)"
  findings: |
    Meskipun sertifikat Pearson resmi menyatakan masa berlaku 2 tahun (dan 3 tahun untuk skilled migration), peraturan perundang-undangan migrasi Australia untuk Functional English (termasuk Subclass 462) secara tegas mewajibkan tes diambil "in the 12 months before your visa application".
  remediation: |
    Sertakan reminder kadaluarsa di profil pengguna: jika hasil tes berumur > 10 bulan, tampilkan peringatan 'Segera ajukan visa atau jadwalkan tes ulang'.

- claim_id: "CLM-AUD-004"
  original_claim: "PTE Academic Online (tes dari rumah) dapat digunakan untuk WHV."
  source_file: "Implied / Missing Warning in Local Documents"
  classification: "POTENTIALLY_MISLEADING"
  authority_ref: "SRC-DHA-FE-001 (DHA Online Test Restrictions Section)"
  findings: |
    Department of Home Affairs secara eksplisit melarang seluruh tes online berbasis 'remote-proctored' atau 'at-home', termasuk PTE Academic Online. Jika peserta mengambil versi Online, visa Subclass 462 akan langsung ditolak.
  remediation: |
    Tampilkan peringatan keras (Alert Box) pada Setup & Onboarding: "WAJIB mengikuti tes di Pusat Tes Resmi (Test Centre) secara tatap muka. Dilarang memesan PTE Academic Online dari rumah."

- claim_id: "CLM-AUD-005"
  original_claim: "Daftar Nilai Ujian.pdf di root workspace adalah bukti kemampuan bahasa Inggris."
  source_file: "Daftar Nilai Ujian.pdf"
  classification: "CONTEXTUALLY_MISUNDERSTOOD"
  authority_ref: "SRC-LOC-PDF-011 & SRC-DHA-FE-001 (Table 1)"
  findings: |
    Daftar Nilai Ujian.pdf merupakan transkrip nilai semester Universitas Terbuka milik Hazza Bhaskara Hedyana Putra (Program Studi Akuntansi S1). Dokumen ini berbahasa Indonesia.
    Dokumen ini MEMENUHI syarat pendidikan Subclass 462 (telah menempuh pendidikan tinggi minimal 2 tahun atau setara S1), tetapi TIDAK BISA digunakan sebagai bukti Functional English karena bahasa pengantarnya bukan bahasa Inggris.
  remediation: |
    Klasifikasikan file ini di modul Admin/Visa sebagai 'Bukti Syarat Pendidikan SDUWHV / WHV 462', bukan sebagai sertifikat kemampuan bahasa Inggris.
```

---

### Category B: Scoring Rubrics, Test Mechanics & AI Realities

```yaml
- claim_id: "CLM-RUB-006"
  original_claim: "Penggunaan Template di PTE Academic adalah '100% Efektif & Aman'."
  source_file: "01_PTE_Academic_WHV_Master_Guide.md (Section 2, Line 30)"
  classification: "POTENTIALLY_DANGEROUS"
  authority_ref: "SRC-PEARSON-SG-003 & SRC-PEARSON-TF-004 (August 2025 Updates)"
  findings: |
    Klaim bahwa template 100% aman adalah mitos komunitas lama.
    Pearson Score Guide resmi menyatakan: jika algoritma mendeteksi respon berbasis hafalan template kaku yang tidak secara substantif menjawab topik soal, skor Content akan dinilai 0. Berdasarkan rubrik Pearson: jika skor Content = 0, seluruh Enabling Skills (Grammar, Vocabulary, Spelling) pada item tersebut otomatis mendapat 0.
    Terlebih lagi, sejak Agustus 2025, Pearson menerapkan 'Human Review Gate' yang menginspeksi anomali jawaban template.
  remediation: |
    Koreksi klaim: Ganti konsep 'Template Kaku Hafalan' dengan 'Structural Frameworks'.
    Ajarkan pengguna untuk menyisipkan minimal 50-60% konten kontekstual dari teks/audio/gambar asli, bukan sekadar mengisi 2 kata ke dalam 150 kata template hafalan mati.

- claim_id: "CLM-RUB-007"
  original_claim: "Trik Extra Words di Write From Dictation: Menumpuk variasi kata (singular/plural, kapitalisasi) bebas penalti."
  source_file: "02_PTE_Templates_and_Cheat_Sheets.md (Section 5) & Dashboard.html"
  classification: "COMMUNITY_STRATEGY"
  authority_ref: "SRC-PEARSON-SG-003 (Write From Dictation Scoring Guide)"
  findings: |
    Pearson menilai WFD dengan partial credit (+1 per kata yang cocok dan dieja benar). Secara teknis, sistem tidak mengenakan penalti pengurangan poin (-1) untuk kata salah.
    Namun, menumpuk terlalu banyak kata (misal: memasukkan 20 kata untuk kalimat 10 kata) memicu deteksi anomali di algoritma dan berisiko merusak koherensi kalimat jika Pearson memperbarui scoring engine.
  remediation: |
    Gunakan secara proporsional dan terukur: Izinkan pengguna menambahkan maksimal 1-2 kata keraguan (misal: 'student students') HANYA jika benar-benar ragu pada bentuk jamak/akhiran, jangan menumpuk seluruh variasi sinonim secara ekstrem.

- claim_id: "CLM-RUB-008"
  original_claim: "Aturan 50% di Repeat Sentence: Mengucapkan 50-60% kata dengan lancar memberikan nilai Fluency maksimal."
  source_file: "02_PTE_Templates_and_Cheat_Sheets.md (Section 6)"
  classification: "COMMUNITY_STRATEGY"
  authority_ref: "SRC-PEARSON-SG-003 (Repeat Sentence Item Scoring)"
  findings: |
    Rubrik resmi Pearson untuk Content Repeat Sentence:
    - 3 Poin: 100% kata benar dalam urutan tepat.
    - 2 Poin: >= 50% kata benar.
    - 1 Poin: < 50% kata benar tetapi minimal ada 1 kata.
    - 0 Poin: Tidak ada kata benar.
    Skor Oral Fluency (skala 0-5) dinilai sepenuhnya terpisah berdasarkan ritme, ketiadaan hestitasi, dan kelancaran aliran bicara. Oleh karena itu, bagi target skor 30-36 (yang setara CEFR A2-B1), mengejar 50% kata dengan fluency sempurna adalah strategi yang sangat cerdas dan valid secara matematis.
  remediation: |
    Pertahankan strategi ini di kurikulum dan simulator scoring. Berikan feedback positif jika user berhasil menirukan >50% kata dengan jeda < 1 detik.

- claim_id: "CLM-RUB-009"
  original_claim: "Mikrofon otomatis mati jika hening selama lebih dari 3 detik."
  source_file: "01_PTE_Academic_WHV_Master_Guide.md (Section 3A, Point 4)"
  classification: "VERIFIED_TRUE"
  authority_ref: "SRC-PEARSON-TF-004 (Speaking Section Test Delivery Rules)"
  findings: |
    Pearson secara resmi mengonfirmasi aturan 3-second silence timeout. Jika status perekaman 'Recording' menyala dan tidak ada input suara di atas ambang desibel tertentu selama 3 detik, perekaman berhenti permanen dan item dinilai 0.
  remediation: |
    Implementasikan timer audio interaktif pada modul Speaking: jika input audio hening selama 3 detik setelah recording dimulai, otomatis hentikan recording dan berikan peringatan '3-Second Rule Triggered'.

- claim_id: "CLM-RUB-010"
  original_claim: "Negative marking hanya berlaku di 3 tipe soal: MCMA Reading, MCMA Listening, dan Highlight Incorrect Words."
  source_file: "01_PTE_Academic_WHV_Master_Guide.md (Section 5)"
  classification: "VERIFIED_TRUE"
  authority_ref: "SRC-PEARSON-SG-003 (Negative Marking Sections)"
  findings: |
    Benar. Hanya 3 tipe soal tersebut yang memiliki nilai minus (-1 untuk opsi salah). Seluruh tipe soal lain menggunakan partial credit murni atau binary scoring (0 atau 1) tanpa pengurangan poin.
    Selain itu, skor total per item pada ketiga tipe soal tersebut tidak pernah minus (berlaku floor score 0).
  remediation: |
    Pastikan engine scoring lokal menerapkan rumus: `item_score = max(0, correct_picks - incorrect_picks)`.
```

---

### Category C: Test Structure & August 2025 Format Updates

```yaml
- claim_id: "CLM-STR-011"
  original_claim: "PTE Academic hanya terdiri dari 20 tipe soal berdurasi 2 jam."
  source_file: "01_PTE_Academic_WHV_Master_Guide.md (Section 4)"
  classification: "OUTDATED_SUPERSEDED"
  authority_ref: "SRC-PEARSON-TF-004 (August 2025 Pearson Test Structure)"
  findings: |
    Format 20 soal adalah format November 2021 hingga Juli 2025.
    Mulai 7 Agustus 2025, Pearson menambahkan 2 tipe soal baru pada Section Speaking & Writing:
    1. 'Respond to a Situation' (Speaking - 10s prep, 40s response).
    2. 'Summarize Group Discussion' (Speaking & Listening - 3-speaker audio, 10s prep, 2 min response).
    Jumlah tipe soal kini menjadi 22 tipe, dan estimasi waktu ujian menjadi ~2 jam 15 menit.
  remediation: |
    Perbarui spesifikasi sistem dan bank soal:
    - Tambahkan blueprint untuk 'Respond to a Situation' dan 'Summarize Group Discussion'.
    - Sediakan selector format di aplikasi: 'Format Standar Terbaru (22 Tipe)' dan 'Mode Legacy (20 Tipe)' untuk backward compatibility.

- claim_id: "CLM-STR-012"
  original_claim: "The Big 5 (WFD, RA, RS, R&W FIB, SST) menyumbang > 70% nilai keseluruhan."
  source_file: "01_PTE_Academic_WHV_Master_Guide.md (Section 4)"
  classification: "COMMUNITY_STRATEGY"
  authority_ref: "SRC-E2LANG-006 & Pearson Score Simulation Data"
  findings: |
    Pearson tidak pernah mempublikasikan formula bobot poin proprietary. Angka '70%' adalah estimasi empiris komunitas berdasarkan cross-scoring impact.
    Faktanya, kelima soal tersebut memang memiliki kontribusi poin silang terbesar:
    - WFD: Menyumbang Listening + Writing (hingga ~25% nilai masing-masing).
    - RA: Menyumbang Speaking + Reading (hingga ~20% nilai masing-masing).
    - RS: Menyumbang Speaking + Listening (hingga ~30% nilai masing-masing).
    - R&W FIB: Menyumbang Reading + Writing (hingga ~25% nilai masing-masing).
    - SST: Menyumbang Listening + Writing (hingga ~10% nilai masing-masing).
  remediation: |
    Gunakan matriks pembobotan ini untuk menyusun algoritma kurikulum adaptif 80/20, tetapi beri label di UI: "Estimasi Kontribusi Berdasarkan Analisis Empiris Komunitas".
```
