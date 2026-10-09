import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/PageHeader";
import { ResultView } from "@/components/ResultView";
import { history, useHistory } from "@/services/history";

export const Route = createFileRoute("/history/$id")({
  head: () => ({
    meta: [
      { title: "Check details — CyberGuard" },
      { name: "description", content: "Full analysis of a previous CyberGuard security check." },
      { property: "og:title", content: "Check details — CyberGuard" },
      { property: "og:description", content: "Risk score, evidence and recommended actions." },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const list = useHistory();
  const nav = useNavigate();
  const h = list.find((x) => x.id === id);
  return (
    <Page>
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost"><Link to="/history"><ArrowLeft /> Back to history</Link></Button>
        {h && <Button variant="ghost" onClick={() => { history.remove(h.id); nav({ to: "/history" }); }}><Trash2 /> Delete</Button>}
      </div>
      {!h ? (
        <p className="mt-10 text-center text-muted-foreground">This check isn't in your history on this device.</p>
      ) : (
        <>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            {h.input_type.toUpperCase()} · {format(new Date(h.created_at), "PPpp")} · session {h.session_id}{h.demo ? " · demo" : ""}
          </p>
          {h.saved_input && (
            <div className="glass mt-4 rounded-xl p-4">
              <p className="font-mono text-xs uppercase text-muted-foreground">Saved input</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm">{h.saved_input}</p>
            </div>
          )}
          <ResultView result={h} />
        </>
      )}
    </Page>
  );
}
