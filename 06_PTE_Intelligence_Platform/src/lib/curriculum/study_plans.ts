export interface StudyDay {
  day_number: number;
  focus: string;
  speaking_drill: string;
  writing_drill: string;
  reading_listening_drill: string;
  estimated_minutes: number;
}

export interface StudyPlanConfig {
  id: string;
  title: string;
  duration_weeks: number;
  intensity_label: string;
  target_user: string;
  description: string;
  daily_sessions: StudyDay[];
}

export const STUDY_PLANS: StudyPlanConfig[] = [
  {
    id: 'plan-2w',
    title: 'Sprint Intensif 2 Minggu',
    duration_weeks: 2,
    intensity_label: 'SANGAT INTENSIF (3-4 jam/hari)',
    target_user: 'Bagi yang mengejar deadline ballot WHV atau tanggal ujian terdekat.',
    description: 'Fokus 100% pada 4 tipe soal berbobot tertinggi: Write From Dictation, Read Aloud, Repeat Sentence, dan Reading FIB.',
    daily_sessions: [
      { day_number: 1, focus: 'Fondasi Speaking & WFD', speaking_drill: 'Read Aloud (10x)', writing_drill: 'Summarize Written Text (2x)', reading_listening_drill: 'Write From Dictation (15x)', estimated_minutes: 90 },
      { day_number: 2, focus: 'Oral Fluency & FIB', speaking_drill: 'Repeat Sentence (15x)', writing_drill: 'Write Essay Outline', reading_listening_drill: 'Reading FIB (10x)', estimated_minutes: 90 },
      { day_number: 3, focus: 'Post-Aug 2025 Speaking', speaking_drill: 'Respond to a Situation (5x)', writing_drill: 'Write Essay (1x)', reading_listening_drill: 'Listening FIB (10x)', estimated_minutes: 100 },
      { day_number: 4, focus: 'Mini Mock Section 1', speaking_drill: 'Speaking & Writing Section Test', writing_drill: 'Review Evaluasi AI', reading_listening_drill: 'WFD Review Deck (20x)', estimated_minutes: 120 }
    ]
  },
  {
    id: 'plan-4w',
    title: 'Standar 4 Minggu (Rekomendasi Master)',
    duration_weeks: 4,
    intensity_label: 'STANDAR IDEAL (1.5-2 jam/hari)',
    target_user: 'Rekomendasi utama sesuai panduan persiapan WHV 462.',
    description: 'Keseimbangan sempurna antara pemahaman rubrik, drill repetisi berjarak, dan full mock test setiap akhir pekan.',
    daily_sessions: [
      { day_number: 1, focus: 'Minggu 1: Diagnostik & Speaking Fondasi', speaking_drill: 'Read Aloud & WPM Check (10x)', writing_drill: 'SWT Form Rules', reading_listening_drill: 'WFD Spaced Repetition (10x)', estimated_minutes: 60 },
      { day_number: 2, focus: 'Minggu 1: Oral Fluency & Repeat Sentence', speaking_drill: 'Repeat Sentence (15x)', writing_drill: 'SWT Practice (2x)', reading_listening_drill: 'Reading FIB (5x)', estimated_minutes: 60 },
      { day_number: 3, focus: 'Minggu 1: Situational Speaking', speaking_drill: 'Respond to a Situation (5x)', writing_drill: 'Essay Template Review', reading_listening_drill: 'Re-order Paragraphs (5x)', estimated_minutes: 60 },
      { day_number: 4, focus: 'Minggu 1: Group Discussion', speaking_drill: 'Summarize Group Discussion (5x)', writing_drill: 'Write Essay (1x)', reading_listening_drill: 'WFD Review Deck (15x)', estimated_minutes: 75 }
    ]
  },
  {
    id: 'plan-8w',
    title: 'Fondasi 8 Minggu',
    duration_weeks: 8,
    intensity_label: 'SANTAI & BERTINGKAT (45-60 menit/hari)',
    target_user: 'Bagi pembelajar yang membutuhkan penguatan tata bahasa dan kosakata dasar.',
    description: 'Pendekatan bertahap dimulai dari kosakata dasar, pengucapan kata demi kata, hingga transisi ke simulasi seksi.',
    daily_sessions: [
      { day_number: 1, focus: 'Akurasi Fonetik Dasar', speaking_drill: 'Read Aloud Kata Per Kata', writing_drill: 'Grammar Mechanics', reading_listening_drill: 'WFD 5 Kalimat Dasar', estimated_minutes: 45 }
    ]
  },
  {
    id: 'plan-12w',
    title: 'Komprehensif 12 Minggu',
    duration_weeks: 12,
    intensity_label: 'JANGKA PANJANG (30-45 menit/hari)',
    target_user: 'Persiapan jangka panjang sebelum pembukaan tahun anggaran baru visa WHV.',
    description: 'Membangun kebiasaan harian bahasa Inggris yang terintegrasi dengan Australia Practical English track.',
    daily_sessions: [
      { day_number: 1, focus: 'Kebiasaan Harian', speaking_drill: 'Read Aloud Wacana Singkat', writing_drill: 'Jurnal Harian Singkat', reading_listening_drill: 'Mendengarkan Aksen Australia', estimated_minutes: 30 }
    ]
  }
];

export const AUSTRALIA_PRACTICAL_MODULES = [
  {
    id: 'AU-01',
    title: 'Pengurusan TFN (Tax File Number) & Superannuation',
    category: 'ADMINISTRASI & PAJAK',
    description: 'Istilah dan kosakata penting saat mengisi deklarasi TFN online ATO dan memilih dana pensiun (Super).',
    key_terms: ['ATO', 'Tax File Number', 'Superannuation', 'Withholding Tax', 'Resident for Tax Purposes'],
    scenario_dialogue: "ATO Officer: 'Please ensure your TFN application matches your Australian residential address and passport details.'"
  },
  {
    id: 'AU-02',
    title: 'Pembukaan Rekening Bank Australia (CommBank / NAB / ANZ)',
    category: 'PERBANKAN',
    description: 'Prosedur 100-point identity check, kartu debit PayPass, dan pengaturan BSB serta nomor rekening.',
    key_terms: ['BSB Number', 'Account Number', '100 Point ID Check', 'PayPass / Contactless', 'Savings Account'],
    scenario_dialogue: "Bank Teller: 'I will need your foreign passport and Australian residential address to activate your debit Mastercard.'"
  },
  {
    id: 'AU-03',
    title: 'Sertifikasi RSA & Komunikasi Barista / Hospitality',
    category: 'KERJA HOSPITALITY',
    description: 'Komunikasi wajib industri pelayanan makanan & minuman: Responsible Service of Alcohol, menangani pelanggan, dan pesanan kopi Australia.',
    key_terms: ['Responsible Service of Alcohol', 'Flat White', 'Refusal of Service', 'Intoxicated Customer', 'Order Docket'],
    scenario_dialogue: "Customer: 'Could I get a large flat white with oat milk, and a takeaway avocado toast, please?'"
  },
  {
    id: 'AU-04',
    title: 'Wawancara Kerja Casual & Farm Harvest Regional',
    category: 'KERJA CASUAL & FARM',
    description: 'Komunikasi untuk perpanjangan visa tahun kedua (88 days regional work): piece rate vs hourly rate, safety briefing farm.',
    key_terms: ['Piece Rate Agreement', 'Horticulture Award', 'Payslip', 'Safety Induction', 'Second Year Visa 88 Days'],
    scenario_dialogue: "Farm Manager: 'This harvest contract complies with the Fair Work Horticulture Award minimum hourly safety rate.'"
  }
];
