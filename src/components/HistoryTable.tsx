import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import type { HistoryEntry } from "@/services/history";
import { CLASS_LABEL, SeverityBadge, SEV_TEXT } from "./Severity";

const TYPE: Record<string, string> = { url: "Link", message: "Message", qr: "QR", impersonation: "Impersonation" };

export function HistoryRows({ items, actions }: { items: HistoryEntry[]; actions?: (h: HistoryEntry) => React.ReactNode }) {
  if (!items.length) return <p className="p-8 text-center text-muted-foreground">No checks yet.</p>;
  return (
    <ul className="divide-y divide-border">
      {items.map((h) => (
        <li key={h.id} className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/50">
          <Link to="/history/$id" params={{ id: h.id }} className="flex min-w-0 flex-1 items-center gap-4">
            <span className={`w-10 text-right font-display text-xl font-bold ${SEV_TEXT[h.severity]}`}>{h.risk_score}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{CLASS_LABEL[h.classification]} <span className="text-muted-foreground">· {TYPE[h.input_type]}</span></p>
              <p className="truncate font-mono text-xs text-muted-foreground">{h.subject ?? h.indicators[0]?.name ?? "No indicators"} · {format(new Date(h.created_at), "d MMM, HH:mm")}</p>
            </div>
            <SeverityBadge severity={h.severity} />
          </Link>
          {actions?.(h)}
        </li>
      ))}
    </ul>
  );
}
