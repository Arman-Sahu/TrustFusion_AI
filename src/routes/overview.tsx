import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Cpu } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { HistoryRows } from "@/components/HistoryTable";
import { StatCard } from "@/components/StatCard";
import { api } from "@/services/api";
import { computeStats, useHistory } from "@/services/history";
import type { EngineState } from "@/engines/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/overview")({
  head: () => ({
    meta: [
      { title: "Security overview & model status — CyberGuard" },
      { name: "description", content: "Transparent view of CyberGuard's detection engines, system health and recent incidents." },
      { property: "og:title", content: "Security overview — CyberGuard" },
      { property: "og:description", content: "Which detection engines are active, in fallback, or not configured." },
    ],
  }),
  component: Overview,
});

const STATE: Record<EngineState, string> = {
  ACTIVE: "bg-sev-safe/15 text-sev-safe border-sev-safe/40",
  FALLBACK: "bg-sev-medium/15 text-sev-medium border-sev-medium/40",
  NOT_CONFIGURED: "bg-muted text-muted-foreground border-border",
};

function Overview() {
  const list = useHistory();
  const s = computeStats(list);
  const health = useQuery({ queryKey: ["health"], queryFn: api.health, refetchInterval: 30000 });
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader icon={<Cpu />} title="Security overview" subtitle="For judges and the technically curious: system health and honest model status." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total analyses" value={s.total} />
        <StatCard label="Threats detected" value={s.threats} tone="text-sev-high" />
        <StatCard label="Critical" value={s.critical} tone="text-sev-critical" />
        <div className="glass rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">System health</p>
          <p className={cn("mt-1 flex items-center gap-2 font-display text-2xl font-bold", health.isError ? "text-sev-critical" : "text-sev-safe")}>
            <Activity className="h-5 w-5" /> {health.isLoading ? "…" : health.isError ? "Offline" : "Online"}
          </p>
        </div>
      </div>
      <div className="glass mt-6 rounded-xl p-5">
        <h3 className="font-semibold">Model status</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {health.data?.engines.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
              <div>
                <p className="font-medium">{e.label}</p>
                <p className="text-sm text-muted-foreground">{e.engine}</p>
                <p className="mt-1 text-xs text-muted-foreground">{e.state === "FALLBACK" ? "Fallback analysis active. " : ""}{e.note}</p>
              </div>
              <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-xs", STATE[e.state])}>{e.state.replace("_", " ")}</span>
            </div>
          ))}
          {health.isError && <p className="text-sm text-sev-critical">Couldn't reach the analysis service.</p>}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No accuracy figures are shown because no trained model is connected yet.</p>
      </div>
      <div className="glass mt-6 overflow-hidden rounded-xl">
        <h3 className="p-5 pb-2 font-semibold">Recent incidents</h3>
        <HistoryRows items={list.filter((h) => ["HIGH", "CRITICAL"].includes(h.severity)).slice(0, 8)} />
      </div>
    </div>
  );
}
