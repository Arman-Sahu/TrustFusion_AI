import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { History, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { HistoryRows } from "@/components/HistoryTable";
import { CLASS_LABEL } from "@/components/Severity";
import { history, useHistory } from "@/services/history";
import { loadDemoData } from "@/services/demo";

export const Route = createFileRoute("/history/")({
  head: () => ({
    meta: [
      { title: "Check history — CyberGuard" },
      { name: "description", content: "Review, search and delete your previous CyberGuard security checks." },
      { property: "og:title", content: "Check history — CyberGuard" },
      { property: "og:description", content: "All your previous scam checks in one place." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const list = useHistory();
  const [q, setQ] = useState("");
  const [sev, setSev] = useState("all");
  const [cls, setCls] = useState("all");
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return list.filter((h) =>
      (sev === "all" || h.severity === sev) &&
      (cls === "all" || h.classification === cls) &&
      (!s || [h.subject, h.explanation, h.saved_input, CLASS_LABEL[h.classification], ...h.indicators.map((i) => i.name)].join(" ").toLowerCase().includes(s)));
  }, [list, q, sev, cls]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader icon={<History />} title="Check history" subtitle="Saved only on this device (anonymous session). Original message text is stored only if you chose to save it." />
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history..." className="pl-9" />
        </div>
        <Select value={sev} onValueChange={setSev}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            {["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={cls} onValueChange={setCls}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All threat types</SelectItem>
            {Object.entries(CLASS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        {list.length > 0 ? (
          <Button variant="ghost" onClick={() => confirm("Delete all history?") && history.clear()}><Trash2 /> Clear all</Button>
        ) : (
          <Button variant="surface" onClick={loadDemoData}>Load demo data</Button>
        )}
      </div>
      <div className="glass mt-6 overflow-hidden rounded-xl">
        <HistoryRows items={filtered} actions={(h) => (
          <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => history.remove(h.id)}><Trash2 /></Button>
        )} />
      </div>
    </div>
  );
}
