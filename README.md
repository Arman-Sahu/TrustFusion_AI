# CyberGuard — Stay Safe Before You Click

Public, end-user cyber-safety assistant: check links, QR codes, messages and impersonation attempts, get a 0–100 risk score, plain-language evidence and recommended actions.

## Architecture
```text
Browser (React + TanStack Router)
  pages: / /url /qr /message /impersonation /scammed /dashboard /history /overview /tips
  services/api.ts  ──POST JSON──►  Server routes (/api/*, edge runtime)
  services/history.ts (localStorage, anonymous session)      │
  QR decoded locally with jsQR                               ▼
                                     engines/analyze.ts (orchestrator)
                                       ├─ url-engine.ts      (URL features, look-alikes)
                                       ├─ message-engine.ts  (NLP rules + text features)
                                       ├─ models.ts          (urlThreatModel / messageThreatModel / behaviorAnomalyModel slots)
                                       ├─ risk-engine.ts     (dedupe, weighted score, severity, classification)
                                       ├─ explanation.ts     (evidence-only explanations; LLM-compatible)
                                       └─ recommendations.ts (category-specific actions)
```
Flow: input → validation → analysis → classification → risk score → evidence → explanation → recommendations → saved to history.

## API
| Method | Path | Body |
|---|---|---|
| POST | /api/analyze/url | `{ url }` |
| POST | /api/analyze/message | `{ message }` |
| POST | /api/analyze/qr | `{ content }` (decoded QR text) |
| POST | /api/analyze/impersonation | `{ claimed_identity, organisation, sender, requested_action, message }` |
| GET | /api/health | engine status |

Response: `{ id, input_type, risk_score, severity, classification, confidence, indicators[{key,name,weight,description}], explanation, recommendations[], engine, engine_note, created_at }`.
History & stats are computed client-side from the device's local history (privacy-first; no server storage of messages).

Severity: 0–19 SAFE · 20–39 LOW · 40–59 MEDIUM · 60–79 HIGH · 80–100 CRITICAL. Score = 100·(1−e^(−Σweights/55)), deduplicated by indicator key.

## Security
Input size limits (16 KB), per-IP rate limiting (30/min), URL validation, friendly errors only, suspicious URLs are **never fetched or opened**, no keys in the frontend.

## Environment variables (optional)
`LLM_API_KEY`, `THREAT_INTELLIGENCE_API_KEY` — when absent, the Overview page shows FALLBACK / NOT CONFIGURED. `DATABASE_URL` is reserved for a future server-side history store.

## AI models — honest status
All detection currently runs on a **local heuristic hybrid engine**. Slots exist for XGBoost/Random Forest (URL), DistilBERT (messages), Isolation Forest (behaviour) and an LLM explainer that may only rephrase engine evidence. No accuracy is claimed.

## Demo
1. Home → "Try a scam SMS" → Analyze Now → CRITICAL. 2. QR page → "Try sample QR content". 3. Dashboard → "Load demo data". 4. History → open any check. 5. Overview → model status.

## Limitations / future work
No live reputation lookups, heuristics can miss novel scams, history is per-device. Next: connect trained models, threat-intel APIs, optional account-based history.
