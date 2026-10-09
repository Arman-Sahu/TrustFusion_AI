import type { Classification, Severity } from "@/engines/types";
import { cn } from "@/lib/utils";

export const SEV_TEXT: Record<Severity, string> = {
  SAFE: "text-sev-safe", LOW: "text-sev-low", MEDIUM: "text-sev-medium", HIGH: "text-sev-high", CRITICAL: "text-sev-critical",
};
const SEV_BADGE: Record<Severity, string> = {
  SAFE: "bg-sev-safe/15 text-sev-safe border-sev-safe/40",
  LOW: "bg-sev-low/15 text-sev-low border-sev-low/40",
  MEDIUM: "bg-sev-medium/15 text-sev-medium border-sev-medium/40",
  HIGH: "bg-sev-high/15 text-sev-high border-sev-high/40",
  CRITICAL: "bg-sev-critical/15 text-sev-critical border-sev-critical/40",
};
export const SEV_VAR: Record<Severity, string> = {
  SAFE: "var(--sev-safe)", LOW: "var(--sev-low)", MEDIUM: "var(--sev-medium)", HIGH: "var(--sev-high)", CRITICAL: "var(--sev-critical)",
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold tracking-wide", SEV_BADGE[severity], className)}>
      {severity}
    </span>
  );
}

export const CLASS_LABEL: Record<Classification, string> = {
  SAFE: "No threat found", SUSPICIOUS: "Suspicious", PHISHING: "Phishing", QR_PHISHING: "QR phishing",
  OTP_SCAM: "OTP scam", PAYMENT_SCAM: "Payment scam", PRIZE_SCAM: "Prize scam",
  IMPERSONATION: "Impersonation", MALICIOUS_URL: "Risky website",
};

export function RiskGauge({ score, severity, size = 160 }: { score: number; severity: Severity; size?: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={SEV_VAR[severity]} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} style={{ transition: "stroke-dashoffset 900ms ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display text-4xl font-bold", SEV_TEXT[severity])}>{score}</span>
        <span className="font-mono text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
