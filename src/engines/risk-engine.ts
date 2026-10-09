import type { Classification, Indicator, Severity } from "./types";

export function severityFor(score: number): Severity {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  if (score >= 20) return "LOW";
  return "SAFE";
}

/** Merge indicators by key, keeping the highest weight (no double-counting). */
export function dedupe(indicators: Indicator[]): Indicator[] {
  const map = new Map<string, Indicator>();
  for (const i of indicators) {
    const prev = map.get(i.key);
    if (!prev || prev.weight < i.weight) map.set(i.key, i);
  }
  return [...map.values()].sort((a, b) => b.weight - a.weight);
}

/**
 * Explainable score: sum of indicator weights, softly saturated so that many
 * weak signals don't exceed 100 and a few strong signals still read as high.
 * Negative weights (trust signals) reduce the score.
 */
export function scoreIndicators(indicators: Indicator[]): number {
  const raw = indicators.reduce((s, i) => s + i.weight, 0);
  if (raw <= 0) return Math.max(0, Math.min(8, 4 + raw));
  const score = 100 * (1 - Math.exp(-raw / 55));
  return Math.round(Math.min(100, Math.max(0, score)));
}

/** Confidence grows with the amount of independent evidence. */
export function confidenceFor(indicators: Indicator[], score: number): number {
  const n = indicators.filter((i) => i.weight > 0).length;
  if (n === 0) return 0.7;
  const c = 0.55 + Math.min(0.4, n * 0.07) + (score > 80 ? 0.03 : 0);
  return Math.round(c * 100) / 100;
}

export function classify(
  indicators: Indicator[],
  score: number,
  context: "url" | "message" | "qr" | "impersonation",
): Classification {
  const has = (k: string) => indicators.some((i) => i.key === k);
  if (score < 20) return "SAFE";
  if (score < 40) return "SUSPICIOUS";
  if (context === "qr") return "QR_PHISHING";
  if (has("otp_request")) return "OTP_SCAM";
  if (context === "impersonation" || has("authority_impersonation")) return "IMPERSONATION";
  if (has("prize")) return "PRIZE_SCAM";
  if (has("payment_request") && !has("credential_request")) return "PAYMENT_SCAM";
  if (has("credential_request") || has("brand_impersonation") || has("login_page")) return "PHISHING";
  if (context === "url") return "MALICIOUS_URL";
  return "PHISHING";
}
