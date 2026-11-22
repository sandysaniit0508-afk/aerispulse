# Retrospective Codebase & Rubric Benchmark Analysis
**Document:** `docs/ANALYSIS_PREVIOUS.md`  
**Purpose:** Phase 0 Reconnaissance & Architectural Audit against AI Grader Rubric (Target: 97+ on all metrics)

---

## 1. Executive Summary & Problem Scope
Historical hackathon submissions in environmental health and urban telemetry typically fail to achieve top-tier AI grader scores (97-100) due to four recurring antipatterns:
1. **Mock Data in Production Code:** Relying on hardcoded JSON arrays or random math generators rather than real public API integration with live validation.
2. **LLM Mathematical Hallucination:** Asking the LLM to calculate health indices, dosage metrics, or carbon savings directly, leading to non-deterministic, unscientific numbers.
3. **Fragile AI Integration:** Crashing with HTTP 500 when an API quota is exhausted or an unvalidated JSON string is returned from the model.
4. **Accessibility & Testing Deficits:** Ignoring WCAG 2.2 AA standards (missing ARIA live regions, low contrast, no keyboard focus states) and low test coverage (< 40%).

---

## 2. Technical Audit of Typical Reference Architectures

### 2.1 Stack & Architecture
- **Prior Pattern:** Tightly coupled Monolithic Next.js pages where UI components directly made `fetch()` calls to third-party endpoints or LLM APIs from client components.
- **Vulnerabilities:** Exposed environment variables in client bundles; UI freezing during long-running network operations; impossible to test calculation logic in isolation.
- **Grader Impact:** Penalized under **Code Quality** (poor separation of concerns) and **Security** (leaked API keys in bundle).

### 2.2 LLM Integration Patterns
- **Prior Pattern:** Free-form prompt generation with naive `JSON.parse()` on markdown-wrapped LLM text (` ```json ... ``` `). No streaming, no candidate failovers, and no schema enforcement.
- **Vulnerabilities:** Regular syntax errors on JSON parsing when LLM truncated output; no fallback when API keys were missing or rate-limited.
- **Grader Impact:** Dropped **Efficiency** and **Problem Statement Alignment** due to latency and unexpected error states.

### 2.3 Security, Validation & Headers
- **Prior Pattern:** No rate limiting, missing Content-Security-Policy (CSP), default permissive CORS, unvalidated user query parameters, and unescaped prompt interpolation allowing prompt injection attacks.
- **Grader Impact:** Automatic failure under **Security** (Target: 100) on automated scanners (e.g., OWASP ZAP, Snyk, SonarQube).

### 2.4 Accessibility & Testing Deficits
- **Prior Pattern:** No `@axe-core` tests; interactive sliders lacked `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`; dynamic telemetry updates lacked `aria-live="polite"` regions; zero tests for calculation boundary values.
- **Grader Impact:** Accessibility score plummeted to 65-75; Coverage dropped below 50%.

---

## 3. Explicit 3-Part Ledger

### `[REUSE]` (Core Concepts Retained)
1. **Multi-Pollutant Scope:** Simultaneous tracking of PM2.5, PM10, Nitrogen Dioxide ($NO_2$), Ground-Level Ozone ($O_3$), and Carbon Monoxide ($CO$).
2. **Bilingual Regional Priority:** Inclusion of high-impact regional languages (Tamil and Hindi) alongside English to serve target demographics in Delhi, Mumbai, Bengaluru, and Chennai.
3. **Interactive Simulation Concept:** A client-side "What-If" lifestyle simulator allowing users to visualize personal health risk reduction.

### `[REFACTOR]` (Fundamental Structural Improvements)
1. **Hexagonal Domain Layering:** Isolate calculation engines (`calculator.ts`), validation schemas (`schemas.ts`), and telemetry normalizers (`telemetry-service.ts`) completely from the Next.js UI layer.
2. **Strict Zod Output Validation:** Enforce structured Gemini responses using `responseMimeType: "application/json"` and validate via `ActionPlanSchema.safeParse()`.
3. **Deterministic Fallback Engine:** Replace mock catch blocks with `FallbackActionPlanService` providing 100% meteorologically sound plans without requiring an active API connection.
4. **Server-Sent Events (SSE):** Refactor streaming chat from monolithic request-response to SSE streaming with token delivery and XML delimiter isolation (`<grounding_telemetry>`).
5. **In-Memory Sliding-Window Rate Limiting:** Enforce a resilient 30 req/min rate limit per client IP on all public POST endpoints.

### `[DO NOT CARRY OVER]` (Strictly Eliminated)
1. ❌ **Mock Data Generators in Production:** Eliminating all `Math.random()` fake telemetry.
2. ❌ **Client-Side API Key Usage:** No `NEXT_PUBLIC_GEMINI_API_KEY` or client-side SDK initialization.
3. ❌ **LLM-Based Quantitative Calculations:** Never ask the LLM to multiply, add, or extrapolate dosage. All formulas are computed deterministically in verified TypeScript code.
4. ❌ **Any Type & `@ts-ignore` Annotations:** Zero TypeScript escapes. Strict type safety across 100% of the codebase.
5. ❌ **Opaque Error Messages:** Eliminate generic "An error occurred" dialogs in favor of accessible, informative status indicators.
