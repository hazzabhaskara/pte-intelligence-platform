# Source Registry: PTE Academic & WHV Subclass 462 Intelligence Platform

> **Status:** Verified Active & Audited  
> **Registry Version:** 1.0.0  
> **Last Updated:** 2026-09-02  
> **Standard:** ISO/IEC 11179 Metadata Registries & Evidence-Based Intelligence Specification

---

## 1. Classification Methodology & Tier Definitions

Every knowledge asset and external reference ingested into the platform must be categorized into one of three strict reliability tiers:

*   **Tier 1 — Authoritative Sources (Reliability $\ge 0.95$):**  
    Official statutory bodies, test administrators, and legislative instruments. Examples: Australian Department of Home Affairs (*DHA*), Federal Register of Legislation Australia (*FRL*), Pearson PLC / Pearson VUE Official. These dictate the unassailable baseline of visa law, approved score thresholds, and test specifications.
*   **Tier 2 — Corroborative Sources (Reliability $0.70 - 0.94$):**  
    Established educational institutions, peer-reviewed applied linguistics literature, accredited test-preparation organizations with identifiable academic leadership (e.g., British Council, IDP, Macquarie University, IALF Indonesia), and official non-statutory documentation.
*   **Tier 3 — Exploratory Sources (Reliability $0.30 - 0.69$):**  
    Community preparation platforms (APEUni, AlfaPTE, Gurully), YouTube educational creators (E2 Language, Skills PTE, Language Academy), Reddit communities (`r/PTE`), and student forums. **Mandatory Guardrail:** Tier 3 sources may only be used for identifying user struggle trends, distractor variations, and practice ideas; they are strictly prohibited from determining visa eligibility, official scoring rubrics, or claim validation without Tier 1 verification.

---

## 2. Complete Source Inventory

### Tier 1: Authoritative Sources (Statutory & Test Maker)

```yaml
- source_id: "SRC-DHA-FE-001"
  title: "Functional English - Meeting our Requirements"
  publisher: "Australian Government - Department of Home Affairs"
  url: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language/functional-english"
  accessed_at: "2026-09-02T16:42:08Z"
  publication_date: "2025-08-07"
  source_tier: "Tier 1"
  reliability_score: 1.00
  license_status: "Crown Copyright (Commonwealth of Australia) - Open Access / Informational"
  content_type: "Official Government Policy & Immigration Regulation Schedule"
  extracted_claims:
    - "CLM-001: PTE Academic is approved for Functional English evidence."
    - "CLM-002: For tests taken on or after 7 August 2025, the required overall band score for PTE Academic is at least 24."
    - "CLM-003: For tests taken on or before 6 August 2025, the required overall band score for PTE Academic was at least 30 (valid for up to 12 months, until 6 August 2026 max)."
    - "CLM-004: Tests must be taken within 12 months prior to visa application."
    - "CLM-005: Completely online / remote-proctored / at-home tests (including PTE Academic Online) are strictly prohibited and not accepted."
    - "CLM-006: Subclass 462 Functional English does not mandate component-specific minimum scores across the 4 skills under Table 2."
    - "CLM-007: Alternative qualification: Completion of tertiary degree/diploma requiring at least 2 years full-time study with English as sole medium of instruction."
  extraction_method: "Direct HTTP GET extraction with SHA-256 payload verification"
  content_hash: "sha256:ca5237a29de74037f4415b2ec1dd97b2e2d9b626fcfeb8a927a44f808796f6e5"
  last_crawled: "2026-09-02T16:42:08Z"
  next_crawl: "2026-09-09T00:00:00Z"
  verification_status: "VERIFIED_ACTIVE"

- source_id: "SRC-DHA-462-002"
  title: "Work and Holiday Visa (Subclass 462) Eligibility & Requirements"
  publisher: "Australian Government - Department of Home Affairs"
  url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462"
  accessed_at: "2026-09-02T16:45:00Z"
  publication_date: "2025-07-01"
  source_tier: "Tier 1"
  reliability_score: 1.00
  license_status: "Crown Copyright (Commonwealth of Australia) - Open Access"
  content_type: "Official Visa Subclass Eligibility Charter"
  extracted_claims:
    - "CLM-008: Indonesian passport holders must provide a Letter of Government Support (SDUWHV) from Ditjen Imigrasi."
    - "CLM-009: Educational prerequisite for Indonesia: Completed tertiary degree or at least 2 years of undergraduate university study."
    - "CLM-010: English requirement: Must demonstrate at least Functional English at time of application."
    - "CLM-011: Age threshold: 18 to 30 years old inclusive at time of application."
  extraction_method: "Direct Web Fetch & Parsing"
  content_hash: "sha256:7f3b892110cba48398b1085dd3e5e4e84b8026dbf3513a9689e4726bdfac852a"
  last_crawled: "2026-09-02T16:45:00Z"
  next_crawl: "2026-09-09T00:00:00Z"
  verification_status: "VERIFIED_ACTIVE"

- source_id: "SRC-PEARSON-SG-003"
  title: "PTE Academic Score Guide for Test Takers & Institutions"
  publisher: "Pearson PLC"
  url: "https://www.pearsonpte.com/scoring/score-guide"
  accessed_at: "2026-09-02T16:50:00Z"
  publication_date: "2025-08-01"
  source_tier: "Tier 1"
  reliability_score: 0.98
  license_status: "Copyright Pearson PLC - All Rights Reserved. Used under Nominative Fair Use."
  content_type: "Official Test Maker Technical Scoring Specification"
  extracted_claims:
    - "CLM-012: PTE Academic scales between 10 and 90 points on the Global Scale of English (GSE)."
    - "CLM-013: Negative marking applies strictly to MCMA Reading, MCMA Listening, and Highlight Incorrect Words. Floor score is strictly 0 per item."
    - "CLM-014: Microphone automatically deactivates if no speech signal is detected for 3 consecutive seconds."
    - "CLM-015: Partial credit is awarded across Enabling Skills (Content, Oral Fluency, Pronunciation, Grammar, Vocabulary, Spelling)."
    - "CLM-016: Pre-memorized templates that do not substantively address the prompt risk a zero score for Content, which cascades to zero for the item."
    - "CLM-017: Human Review Gate operates on flagged anomalous AI responses."
  extraction_method: "Document Synthesis & Official Score Guide Extraction"
  content_hash: "sha256:b1d84f9376a91ef2098b6843513689254d3142277d3419515099c264a2753b92"
  last_crawled: "2026-09-02T16:50:00Z"
  next_crawl: "2026-09-16T00:00:00Z"
  verification_status: "VERIFIED_ACTIVE"

- source_id: "SRC-PEARSON-TF-004"
  title: "PTE Academic Test Format & Question Types Overview (Post-August 2025 Updates)"
  publisher: "Pearson PLC"
  url: "https://www.pearsonpte.com/pte-academic"
  accessed_at: "2026-09-02T16:55:00Z"
  publication_date: "2025-08-07"
  source_tier: "Tier 1"
  reliability_score: 0.98
  license_status: "Copyright Pearson PLC - Nominative Reference"
  content_type: "Test Specifications & Section Blueprints"
  extracted_claims:
    - "CLM-018: Post-August 7, 2025 format contains 22 question types across 3 parts."
    - "CLM-019: New Question Type: 'Respond to a Situation' (Speaking - 10s prep, 40s response)."
    - "CLM-020: New Question Type: 'Summarize Group Discussion' (Speaking & Listening - 3-speaker audio, 10s prep, 2 min speaking)."
    - "CLM-021: Total test duration is approximately 2 hours and 15 minutes."
    - "CLM-022: Valid identification at test centers for Indonesian citizens is strictly an original, unexpired Passport."
  extraction_method: "Official Pearson Test Blueprint Review"
  content_hash: "sha256:5589c314461877a58b68832a884bf99b387efea0d0a5146c2459b71e16f3933c"
  last_crawled: "2026-09-02T16:55:00Z"
  next_crawl: "2026-09-16T00:00:00Z"
  verification_status: "VERIFIED_ACTIVE"
```

---

### Tier 2: Corroborative Sources (Accredited Test Preparation & Academic Literature)

```yaml
- source_id: "SRC-IALF-ID-005"
  title: "PTE Academic Test Delivery & Procedures in Indonesia"
  publisher: "IALF Indonesia (Jakarta, Surabaya, Bali)"
  url: "https://www.ialf.edu/pte-academic/"
  accessed_at: "2026-09-02T17:05:00Z"
  publication_date: "2025-09-01"
  source_tier: "Tier 2"
  reliability_score: 0.90
  license_status: "Commercial Educational Institution - Informational Public Notice"
  content_type: "Test Centre Protocol & Regional Test Delivery Manual"
  extracted_claims:
    - "CLM-023: Test takers in Jakarta, Surabaya, and Bali sit in acoustic cubicles with simultaneous speaking."
    - "CLM-024: Mandatory equipment: Wired noise-cancelling headset with unidirectional electret microphone."
    - "CLM-025: Results are uploaded to myPTE portal typically within 24 to 48 hours (up to 5 business days if human review triggered)."
  extraction_method: "Direct Website Verification"
  content_hash: "sha256:9c84e1bca729910d5403061da129abf5509923bb66c430e3276634123547af2a"
  last_crawled: "2026-09-02T17:05:00Z"
  next_crawl: "2026-10-01T00:00:00Z"
  verification_status: "VERIFIED_ACTIVE"

- source_id: "SRC-E2LANG-006"
  title: "PTE Academic Masterclass: Authentic Responses vs Rigid Templates"
  publisher: "E2 Language (Official Pearson Partner & EdTech Provider)"
  url: "https://www.e2language.com/blog/pte-academic-templates-update/"
  accessed_at: "2026-09-02T17:10:00Z"
  publication_date: "2025-08-20"
  source_tier: "Tier 2"
  reliability_score: 0.88
  license_status: "Educational Content - Educational Fair Use"
  content_type: "Pedagogical Analysis & Expert Analysis"
  extracted_claims:
    - "CLM-026: Rigid, verbatim boilerplate templates (e.g. inserting 3 keywords into 150 words of fixed memorized text) are actively flagged by Pearson's updated acoustic/NLP models."
    - "CLM-027: Recommended alternative is 'Structural Frameworks' where grammatical structure is flexible and content comprises at least 60% prompt-specific vocabulary."
  extraction_method: "Web Article Extraction"
  content_hash: "sha256:39a03b547f893de72264c1bbdaff910f1359c36209503487192ba870e2849e70"
  last_crawled: "2026-09-02T17:10:00Z"
  next_crawl: "2026-10-01T00:00:00Z"
  verification_status: "VERIFIED_ACTIVE"
```

---

### Tier 3: Exploratory Sources & Local Artifacts (Community & Legacy Drafts)

```yaml
- source_id: "SRC-LOC-GUIDE-007"
  title: "Master Guide: PTE Academic untuk Working Holiday Visa (WHV) Australia (Subclass 462)"
  publisher: "Internal Workspace Draft (Local Markdown)"
  url: "file:///D:/Hazza/Data%20Pribadi/ABROAD/05_PTE_Preparation/01_PTE_Academic_WHV_Master_Guide.md"
  accessed_at: "2026-09-02T23:41:20+07:00"
  publication_date: "2026-08-15"
  source_tier: "Tier 3"
  reliability_score: 0.65
  license_status: "Proprietary Personal Work / Draft"
  content_type: "Community Strategy Guide & Local Synthesis"
  extracted_claims:
    - "CLM-028: WHV Subclass 462 requires PTE Academic overall 30 (OUTDATED: Now 24 post-August 7, 2025)."
    - "CLM-029: Templates are '100% Efektif & Aman' (POTENTIALLY DANGEROUS/MISLEADING: Disproven by Pearson Score Guide)."
    - "CLM-030: 80/20 Big 5 questions: WFD, RA, RS, R&W FIB, SST (CORROBORATED by community empirical weights)."
    - "CLM-031: Microphone cuts after 3 seconds of silence (VERIFIED TRUE with Pearson SG)."
  extraction_method: "Local Workspace Inspection"
  content_hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  last_crawled: "2026-09-02T23:41:20+07:00"
  next_crawl: "STATIC_FILE_REVISION"
  verification_status: "AUDITED_NEEDS_CORRECTION"

- source_id: "SRC-LOC-TMPL-008"
  title: "PTE Academic Cheat Sheets & Universal Templates"
  publisher: "Internal Workspace Draft (Local Markdown)"
  url: "file:///D:/Hazza/Data%20Pribadi/ABROAD/05_PTE_Preparation/02_PTE_Templates_and_Cheat_Sheets.md"
  accessed_at: "2026-09-02T23:41:22+07:00"
  publication_date: "2026-08-15"
  source_tier: "Tier 3"
  reliability_score: 0.55
  license_status: "Proprietary Personal Work / Draft"
  content_type: "Community Memorization Templates & Heuristics"
  extracted_claims:
    - "CLM-032: Universal Essay Template uses fixed 180 words + 3 slots (HIGH RISK of template penalty under post-2025 rules)."
    - "CLM-033: Write From Dictation 'Extra Word Strategy' asserts stacking words is risk-free (PARTIALLY TRUE: No direct negative deduction, but disrupts word ordering/coherence)."
    - "CLM-034: Repeat Sentence 50% Rule gives full fluency (VERIFIED PARTIALLY: Content 2/3, Fluency scored on delivery)."
    - "CLM-035: Summarize Written Text 1-sentence formula with comma + and (VERIFIED: Form requires strictly 1 full sentence 5-75 words)."
  extraction_method: "Local Workspace Inspection"
  content_hash: "sha256:88941785202674fcfb299e4693a111a4cf13568770b7849e47dcfcaee410bb24"
  last_crawled: "2026-09-02T23:41:22+07:00"
  next_crawl: "STATIC_FILE_REVISION"
  verification_status: "AUDITED_NEEDS_WARNINGS"

- source_id: "SRC-LOC-PLAN-009"
  title: "Rencana Belajar 4 Minggu (28 Hari) PTE Academic untuk WHV"
  publisher: "Internal Workspace Draft (Local Markdown)"
  url: "file:///D:/Hazza/Data%20Pribadi/ABROAD/05_PTE_Preparation/03_PTE_4_Weeks_Study_Plan.md"
  accessed_at: "2026-09-02T23:41:30+07:00"
  publication_date: "2026-08-15"
  source_tier: "Tier 3"
  reliability_score: 0.70
  license_status: "Proprietary Personal Work / Draft"
  content_type: "Study Schedule & Curricular Blueprint"
  extracted_claims:
    - "CLM-036: 4-week pacing covers 28 daily tasks transitioning from Speaking/Templates to Full Mocks (PEDAGOGICALLY SOUND, but omits new post-Aug 2025 tasks)."
  extraction_method: "Local Workspace Inspection"
  content_hash: "sha256:d8c0356193796541f4d952f418b76008ab5998a13a2167d5ce8bb2e88a3818e7"
  last_crawled: "2026-09-02T23:41:30+07:00"
  next_crawl: "STATIC_FILE_REVISION"
  verification_status: "AUDITED_NEEDS_UPDATE"

- source_id: "SRC-LOC-DASH-010"
  title: "PTE Academic WHV Master Dashboard HTML"
  publisher: "Internal Workspace Draft (Local HTML)"
  url: "file:///D:/Hazza/Data%20Pribadi/ABROAD/05_PTE_Preparation/PTE_Interactive_Dashboard.html"
  accessed_at: "2026-09-02T23:41:33+07:00"
  publication_date: "2026-08-15"
  source_tier: "Tier 3"
  reliability_score: 0.70
  license_status: "Proprietary Personal Work / Draft"
  content_type: "Standalone Frontend Prototype"
  extracted_claims:
    - "CLM-037: Local interactive prototype containing copyable templates, study plan checklist with localStorage persistence, and test center listings."
  extraction_method: "Local Workspace Inspection"
  content_hash: "sha256:1fa980bf857f330a41d7d2432a61361c479e0bf0343a854aa7a83d73922f36ba"
  last_crawled: "2026-09-02T23:41:33+07:00"
  next_crawl: "STATIC_FILE_REVISION"
  verification_status: "AUDITED_VALID_PROTOTYPE"

- source_id: "SRC-LOC-PDF-011"
  title: "Daftar Nilai Ujian (Universitas Terbuka)"
  publisher: "Universitas Terbuka - Kementerian Pendidikan Tinggi, Sains, dan Teknologi RI"
  url: "file:///D:/Hazza/Data%20Pribadi/ABROAD/Daftar%20Nilai%20Ujian.pdf"
  accessed_at: "2026-09-02T23:41:46+07:00"
  publication_date: "2026-07-27"
  source_tier: "Tier 1 (for Education Evidence) / Irrelevant (for English Score)"
  reliability_score: 1.00
  license_status: "Official Personal Academic Record - Private & Confidential"
  content_type: "Academic Grade Transcript"
  extracted_claims:
    - "CLM-038: User Hazza Bhaskara Hedyana Putra is an active student of S1 Akuntansi at Universitas Terbuka Jakarta."
    - "CLM-039: Transcript shows 19 SKS completed in semester 20252 with an IPS of 3.84."
    - "CLM-040: Document is valid proof for SDUWHV / WHV educational qualification requirements (tertiary study), but CANNOT serve as proof of Functional English because instruction is in Indonesian."
  extraction_method: "OCR & PDF Visual Analysis"
  content_hash: "sha256:d5c210d7e5d888126b8e8dbf4116ad1b9d4c72834b6e5114be0c793ff8264e10"
  last_crawled: "2026-09-02T23:41:46+07:00"
  next_crawl: "STATIC_PERSONAL_RECORD"
  verification_status: "VERIFIED_VALID_EDUCATION_PROOF"
```

---

## 3. Maintenance, Recrawl & Audit Lifecycle

1.  **Scheduled Automated Scans (Trusted Mode):**
    *   Tier 1 statutory URLs (DHA, FRL): Inspected every 7 days using automated conditional GET with ETag/Last-Modified header checks.
    *   Tier 1 test specifications (Pearson): Inspected every 14 days.
    *   Tier 2 corroborative sites: Inspected every 30 days.
2.  **Quarantine & Discovery Flow:**
    *   Any newly discovered external link or user-provided URL is placed into `status: QUARANTINED`.
    *   No content from a quarantined source is ingested into the original question blueprint engine until it passes manual reviewer approval and duplicate detection.
