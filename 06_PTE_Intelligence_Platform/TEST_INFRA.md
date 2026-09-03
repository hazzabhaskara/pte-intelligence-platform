# E2E Test Infra: Executive Readiness Dashboard Scrolling & Performance Optimization

## Test Philosophy
- Opaque-box, requirement-driven verification covering CSS repaint elimination, dynamic code-splitting and memoization, SQLite database query aggregation, and compilation health.
- Systematic 4-tier testing: Feature Coverage (Tier 1), Boundary & Corner Cases (Tier 2), Cross-Feature Interactions (Tier 3), and Real-World Application / Smoke Testing (Tier 4).

## Feature Inventory
| # | Feature | Source | Tier 1 | Tier 2 | Tier 3 |
|---|---------|--------|:------:|:------:|:------:|
| 1 | Card Backdrop-Filter Elimination | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Sticky Header Blur Retention | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | Off-Screen Containment | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | Native SVG Radar Chart | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 5 | Dynamic Import (`ssr: false`) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 6 | React.memo Render Isolation | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 7 | SQLite Server Aggregations | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 8 | Recent Attempts LIMIT 5 | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 9 | Zero-Record Safe Baseline | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |

## Test Architecture
- **Compilation & Typecheck**: `npm run build` and `npm run lint` executing Next.js production build and TypeScript compilation.
- **SQL Aggregation & Integrity Verification**: Automated Node test script executing query comparison against live database and mock empty table conditions.
- **Render & DOM Inspection**: Verification of static CSS selectors, absence of `backdrop-filter` in `.card`, presence of `content-visibility: auto`, presence of dynamic chunk for radar chart.
- **Scrolling Performance Profiling**: Performance smoke check ensuring steady 60 FPS without forced reflow or repaint thrashing.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Clean Dashboard Initial Load with 0 attempts | F7, F8, F9, F4, F5 | Medium |
| 2 | Heavy Rapid Scrolling up and down page | F1, F2, F3, F6 | High |
| 3 | Backup creation triggering parent re-render | F4, F6, F7 | Medium |
| 4 | Full Production Next.js Build & Static Export Check | F5, F7, F8, F9 | High |
| 5 | Cross-Page Navigation to /practice and back | F1, F2, F3 | Medium |

## Coverage Thresholds
- Tier 1: Feature coverage verifying individual rules and functions.
- Tier 2: Boundary & Corner cases (empty attempts table, null/zero skill scores, missing backup list).
- Tier 3: Interactions (memoized chart during backup creation, off-screen rendering during fast scroll).
- Tier 4: Full application build, typecheck, and scrolling smoke verification.
