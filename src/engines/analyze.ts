import { analyzeMessageFeatures } from "./message-engine";
import { analyzeUrlFeatures, extractUrls } from "./url-engine";
import { classify, confidenceFor, dedupe, scoreIndicators, severityFor } from "./risk-engine";
import { explain } from "./explanation";
import { recommendFor } from "./recommendations";
import type { AnalysisResult, Indicator, InputType } from "./types";

export class AnalysisInputError extends Error {}

const NOTE = "Local heuristic analysis — no external threat-intelligence or ML model was used.";

function build(input_type: InputType, indicators: Indicator[], subject?: string, extracted_urls?: string[]): AnalysisResult {
  const ind = dedupe(indicators);
  const risk_score = scoreIndicators(ind);
  const severity = severityFor(risk_score);
  const classification = classify(ind, risk_score, input_type);
  return {
    id: crypto.randomUUID(),
    input_type,
    risk_score,
    severity,
    classification,
    confidence: confidenceFor(ind, risk_score),
    indicators: ind,
    explanation: explain(classification, severity, risk_score, ind),
    recommendations: recommendFor(classification, severity, ind),
    engine: "heuristic",
    engine_note: NOTE,
    created_at: new Date().toISOString(),
    subject,
    extracted_urls,
  };
}

export function analyzeUrl(url: string, type: InputType = "url"): AnalysisResult {
  const r = analyzeUrlFeatures(url);
  if (!r) throw new AnalysisInputError("That doesn't look like a valid web address. Try something like https://example.com");
  return build(type, r.indicators, r.url.href);
}

function urlIndicatorsFromText(text: string) {
  const urls = extractUrls(text);
  const ind: Indicator[] = [];
  for (const u of urls) {
    const r = analyzeUrlFeatures(u);
    if (!r) continue;
    const risky = r.indicators.filter((i) => i.weight > 0);
    if (risky.length) {
      const top = risky.sort((a, b) => b.weight - a.weight)[0]!;
      ind.push({ key: "suspicious_url", name: "Contains a suspicious link", weight: Math.min(25, 8 + risky.reduce((s, i) => s + i.weight, 0) / 3), description: `${r.url.hostname}: ${top.name.toLowerCase()}.` });
      for (const i of risky) if (["brand_impersonation", "lookalike_domain", "ip_host"].includes(i.key)) ind.push(i);
    }
  }
  return { urls, ind };
}

export function analyzeMessage(text: string): AnalysisResult {
  const t = text.trim();
  if (t.length < 3) throw new AnalysisInputError("Please paste the message you want to check.");
  const { urls, ind } = urlIndicatorsFromText(t);
  return build("message", [...analyzeMessageFeatures(t), ...ind], undefined, urls);
}

export interface ImpersonationInput {
  claimed_identity?: string;
  sender?: string;
  organisation?: string;
  requested_action?: string;
  message: string;
}

export function analyzeImpersonation(i: ImpersonationInput): AnalysisResult {
  const combined = [i.claimed_identity, i.organisation, i.requested_action, i.message].filter(Boolean).join(". ");
  if (combined.trim().length < 3) throw new AnalysisInputError("Please describe the message or request.");
  const ind = analyzeMessageFeatures(combined);
  const { urls, ind: urlInd } = urlIndicatorsFromText(combined);
  ind.push(...urlInd);
  const claims = (i.claimed_identity ?? "") + " " + (i.organisation ?? "");
  if (/\b(bank|finance|loan|card|upi|paytm|paypal|sbi|hdfc|icici)\b/i.test(claims + " " + i.message))
    ind.push({ key: "financial_impersonation", name: "Claims to be a financial organisation", weight: 15, description: "Banks never ask for OTPs, PINs or passwords over messages or calls." });
  const sender = (i.sender ?? "").trim();
  if (sender) {
    if (/^\+?\d[\d\s-]{7,}$/.test(sender) && claims.trim())
      ind.push({ key: "unknown_sender", name: "Personal number claiming to be an organisation", weight: 12, description: `Organisations usually message from verified sender IDs, not a regular number (${sender}).` });
    if (/@(gmail|yahoo|outlook|hotmail|proton)\./i.test(sender) && claims.trim())
      ind.push({ key: "free_email", name: "Free email address for an 'official' sender", weight: 15, description: `Real organisations don't use free email providers (${sender}).` });
  } else if (claims.trim()) {
    ind.push({ key: "unknown_sender", name: "Sender cannot be verified", weight: 8, description: "No sender details given to confirm the identity." });
  }
  return build("impersonation", ind, i.claimed_identity || i.organisation, urls);
}

export function analyzeQr(content: string): AnalysisResult {
  const c = content.trim();
  if (!c) throw new AnalysisInputError("The QR code appears to be empty.");
  if (c.length > 4096) throw new AnalysisInputError("QR content is too large to analyse.");
  if (/^upi:\/\//i.test(c)) {
    const ind: Indicator[] = [{ key: "payment_request", name: "QR requests a UPI payment", weight: 25, description: "Scanning this will open a payment. Scammers send 'receive money' QRs that actually take money." }];
    const params = new URLSearchParams(c.split("?")[1] ?? "");
    if (params.get("am")) ind.push({ key: "preset_amount", name: `Pre-filled amount: ${params.get("am")}`, weight: 8, description: "The amount is already set for you." });
    const r = build("qr", ind, c);
    return { ...r, classification: r.risk_score >= 40 ? "PAYMENT_SCAM" : r.classification };
  }
  if (normalizeLooksUrl(c)) {
    const r = analyzeUrl(c, "qr");
    return { ...r, extracted_urls: [r.subject!] };
  }
  const r = analyzeMessage(c);
  return { ...r, input_type: "qr", subject: c };
}

function normalizeLooksUrl(s: string) {
  return /^(https?:\/\/|www\.)/i.test(s) || /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(s);
}
