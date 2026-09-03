# PTE Academic Personal Intelligence Platform

Personal Intelligence Platform dirancang untuk persiapan ujian **PTE Academic** dengan target **Australia Work and Holiday Visa (Subclass 462)** (Official Legal Requirement: 24 Overall | Target Aman: 36+ Overall).

## 🚀 Cara Menjalankan Aplikasi

Pastikan **Node.js** dan **Python 3** sudah terpasang pada komputer Anda.

### Menjalankan via Launcher (Windows)
Cukup klik dua kali (double click) file:
```cmd
run_platform.bat
```
Script ini akan:
1. Memeriksa ketersediaan Python dan Node.js.
2. Membuka browser secara otomatis ke `http://localhost:3005/dashboard`.
3. Menjalankan server lokal Next.js di Port 3005.

### Menjalankan Manual via Terminal
```bash
cd 06_PTE_Intelligence_Platform
npm install
npm run build
npm run start -p 3005
```

## 📂 Struktur Repositori

- `run_platform.bat` : Root launcher untuk menjalankan platform secara instan.
- `06_PTE_Intelligence_Platform/` : Source code aplikasi (Next.js 14, Tailwind CSS, TypeScript, SQLite3).
  - `src/` : Frontend UI, Dashboard, Curriculum Spaced Repetition (SM-2), dan Exam Simulator.
  - `scripts/` : Engine Python (hardware probe, backup manager, scoring engine, STT & AI evaluation).
  - `data/` : Local SQLite storage (`app_storage.sqlite3`).
  - `docs/` : Dokumentasi spesifikasi PTE dan manual pengguna.
  - `tests/` : Unit test dan automated smoke tests.
