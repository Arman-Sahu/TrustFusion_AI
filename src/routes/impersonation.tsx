import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ScanSearch, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Page, PageHeader, SaveToggle } from "@/components/PageHeader";
import { ResultView } from "@/components/ResultView";
import { useAnalysis } from "@/hooks/use-analysis";
import { api } from "@/services/api";
import { SAMPLES } from "@/services/demo";

export const Route = createFileRoute("/impersonation")({
  head: () => ({
    meta: [
      { title: "Impersonation checker — CyberGuard" },
      { name: "description", content: "Check if someone claiming to be your bank, employer or family is really who they say they are." },
      { property: "og:title", content: "Impersonation checker — CyberGuard" },
      { property: "og:description", content: "Detect fake banks, fake bosses and fake family members." },
    ],
  }),
  component: ImpPage,
});

const EMPTY = { claimed_identity: "", organisation: "", sender: "", requested_action: "", message: "" };

function ImpPage() {
  const [f, setF] = useState(EMPTY);
  const [save, setSave] = useState(false);
  const { result, loading, run } = useAnalysis();
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Page>
      <PageHeader icon={<UserX />} title="Is it really them?" subtitle="Tell us who contacted you and what they want. We look for signs of impersonation and pressure tactics." />
      <div className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
        <div><Label>Who do they claim to be?</Label><Input className="mt-1.5" value={f.claimed_identity} onChange={set("claimed_identity")} placeholder="e.g. Bank officer, your manager" maxLength={200} /></div>
        <div><Label>Organisation</Label><Input className="mt-1.5" value={f.organisation} onChange={set("organisation")} placeholder="e.g. HDFC Bank" maxLength={200} /></div>
        <div><Label>Sender (number / email)</Label><Input className="mt-1.5 font-mono" value={f.sender} onChange={set("sender")} placeholder="+91 98765 43210" maxLength={200} /></div>
        <div><Label>What are they asking for?</Label><Input className="mt-1.5" value={f.requested_action} onChange={set("requested_action")} placeholder="e.g. Share OTP, send money" maxLength={500} /></div>
        <div className="sm:col-span-2"><Label>Their message</Label><Textarea className="mt-1.5 min-h-28" value={f.message} onChange={set("message")} placeholder="Paste what they said..." maxLength={5000} /></div>
        <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
          <SaveToggle checked={save} onChange={setSave} />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setF(SAMPLES.impersonation)}>Use example</Button>
            <Button variant="hero" size="lg" disabled={loading || !(f.message || f.requested_action).trim()} onClick={() => run(() => api.impersonation(f), save ? f.message : undefined)}>
              {loading ? <Loader2 className="animate-spin" /> : <ScanSearch />} Analyze
            </Button>
          </div>
        </div>
      </div>
      {result && <ResultView result={result} />}
    </Page>
  );
}
