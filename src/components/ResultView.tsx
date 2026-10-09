import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, Siren } from "lucide-react";
import type { AnalysisResult } from "@/engines/types";
import { Button } from "@/components/ui/button";
import { CLASS_LABEL, RiskGauge, SEV_TEXT, SeverityBadge } from "./Severity";
import { cn } from "@/lib/utils";

export function ResultView({ result }: { result: AnalysisResult }) {
  const risky = result.indicators.filter((i) => i.weight > 0);
  const trust = result.indicators.filter((i) => i.weight <= 0);
  const danger = ["HIGH", "CRITICAL"].includes(result.severity);
  return (
    <section className="glass mt-8 overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500" aria-live="polite">
      <div className="flex flex-col items-center gap-6 border-b border-border p-6 sm:flex-row sm:p-8">
        <RiskGauge score={result.risk_score} severity={result.severity} />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <SeverityBadge severity={result.severity} />
            <span className="font-mono text-xs text-muted-foreground">confidence {Math.round(result.confidence * 100)}%</span>
          </div>
          <h2 className={cn("mt-3 text-3xl font-bold", SEV_TEXT[result.severity])}>
            {result.severity} — {CLASS_LABEL[result.classification]}
          </h2>
          {result.subject && <p className="mt-2 break-all font-mono text-sm text-muted-foreground">{result.subject}</p>}
          <p className="mt-3 text-foreground/90">{result.explanation}</p>
        </div>
      </div>

      <div className="grid gap-px bg-border md:grid-cols-2">
        <div className="bg-card p-6">
          <h3 className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-5 w-5 text-primary" /> Why is this risky?</h3>
          {risky.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No major suspicious indicators detected.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {risky.map((i) => (
                <li key={i.key} className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-sev-high" />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">{i.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">+{Math.round(i.weight)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{i.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {trust.map((i) => (
            <p key={i.key} className="mt-3 flex gap-2 text-sm text-sev-safe"><CheckCircle2 className="h-4 w-4" /> {i.name}</p>
          ))}
        </div>
        <div className="bg-card p-6">
          <h3 className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5 text-sev-safe" /> What you should do</h3>
          <ol className="mt-4 space-y-3">
            {result.recommendations.map((r, n) => (
              <li key={r} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs text-primary">{n + 1}</span>
                <span className="text-sm">{r}</span>
              </li>
            ))}
          </ol>
          {danger && (
            <Button asChild variant="emergency" className="mt-6 w-full">
              <Link to="/scammed"><Siren /> I already interacted with it</Link>
            </Button>
          )}
        </div>
      </div>
      <p className="flex items-center gap-2 border-t border-border bg-card px-6 py-3 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5" /> {result.engine_note}
      </p>
    </section>
  );
}
