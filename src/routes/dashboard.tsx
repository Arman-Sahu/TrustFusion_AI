import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { HistoryRows } from "@/components/HistoryTable";
import { CLASS_LABEL, SEV_VAR } from "@/components/Severity";
import { computeStats, useHistory } from "@/services/history";
import { loadDemoData } from "@/services/demo";
import type { Severity } from "@/engines/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My security dashboard — CyberGuard" },
      { name: "description", content: "Your personal overview of links, messages and QR codes you've checked and threats you've avoided." },
      { property: "og:title", content: "My security dashboard — CyberGuard" },
      { property: "og:description", content: "See your personal cyber-safety activity at a glance." },
    ],
  }),
  component: Dashboard,
});

const SEVS: Severity[] = ["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--primary)", "var(--muted-foreground)"];
const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" } };

function Dashboard() {
  const list = useHistory();
  const s = computeStats(list);
  const sevData = SEVS.map((sv) => ({ name: sv, value: list.filter((h) => h.severity === sv).length }));
  const catMap = new Map<string, number>();
  list.filter((h) => h.classification !== "SAFE").forEach((h) => catMap.set(CLASS_LABEL[h.classification], (catMap.get(CLASS_LABEL[h.classification]) ?? 0) + 1));
  const catData = [...catMap].map(([name, value]) => ({ name, value }));
  const timeline = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, "yyyy-MM-dd");
    const day = list.filter((h) => h.created_at.slice(0, 10) === key);
    return { day: format(d, "EEE"), checks: day.length, threats: day.filter((h) => ["MEDIUM", "HIGH", "CRITICAL"].includes(h.severity)).length };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader icon={<LayoutDashboard />} title="Your security dashboard" subtitle="Everything you've checked on this device. Stored only in your browser." />
        {list.length === 0 && <Button variant="hero" className="mb-8" onClick={loadDemoData}><Sparkles /> Load demo data</Button>}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total checks" value={s.total} />
        <StatCard label="Safe" value={s.safe} tone="text-sev-safe" />
        <StatCard label="Threats detected" value={s.threats} tone="text-sev-high" />
        <StatCard label="Critical" value={s.critical} tone="text-sev-critical" />
        <StatCard label="Phishing attempts" value={s.phishing} />
        <StatCard label="Link checks" value={s.url} />
        <StatCard label="Message checks" value={s.message + s.impersonation} />
        <StatCard label="QR checks" value={s.qr} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-xl p-5 lg:col-span-2">
          <h3 className="font-semibold">Security check timeline (7 days)</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <AreaChart data={timeline}>
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} width={30} />
                <Tooltip {...tip} />
                <Area dataKey="checks" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} />
                <Area dataKey="threats" stroke="var(--sev-critical)" fill="var(--sev-critical)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold">Threat categories</h3>
          <div className="mt-4 h-56">
            {catData.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={catData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {catData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip {...tip} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="pt-16 text-center text-sm text-muted-foreground">No threats yet 🎉</p>}
          </div>
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold">Risk distribution</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={sevData}>
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} width={30} />
                <Tooltip {...tip} cursor={{ fill: "var(--secondary)" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {sevData.map((d) => <Cell key={d.name} fill={SEV_VAR[d.name as Severity]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass overflow-hidden rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-2">
            <h3 className="font-semibold">Recent activity</h3>
            <Link to="/history" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <HistoryRows items={list.slice(0, 6)} />
        </div>
      </div>
    </div>
  );
}
