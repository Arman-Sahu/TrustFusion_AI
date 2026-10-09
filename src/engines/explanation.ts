import type { Classification, Indicator, Severity } from "./types";

const LABEL: Record<Classification, string> = {
  SAFE: "looks safe",
  SUSPICIOUS: "shows some suspicious signs",
  PHISHING: "looks like a phishing attempt",
  QR_PHISHING: "looks like a phishing QR code",
  OTP_SCAM: "looks like an OTP scam",
  PAYMENT_SCAM: "looks like a payment scam",
  PRIZE_SCAM: "looks like a fake prize scam",
  IMPERSONATION: "looks like someone impersonating a trusted organisation or person",
  MALICIOUS_URL: "looks like a risky website",
};

/**
 * Template explanation built strictly from detected evidence.
 * An LLM may later rephrase this text, but must only receive the structured evidence.
 */
export function explain(c: Classification, sev: Severity, score: number, indicators: Indicator[]): string {
  const risky = indicators.filter((i) => i.weight > 0).slice(0, 4);
  if (!risky.length)
    return `This ${LABEL[c]}. We didn't find any common warning signs, but no automated check is perfect — stay cautious with unexpected requests.`;
  const reasons = risky.map((i) => i.name.toLowerCase()).join("; ");
  const lead =
    sev === "CRITICAL" || sev === "HIGH"
      ? `This ${LABEL[c]} (${score}/100). Don't interact with it.`
      : `This ${LABEL[c]} (${score}/100). Be careful.`;
  return `${lead} Main reasons: ${reasons}.`;
}
