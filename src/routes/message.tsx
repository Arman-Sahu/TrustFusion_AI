import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, MessageSquareWarning, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Page, PageHeader, SaveToggle } from "@/components/PageHeader";
import { ResultView } from "@/components/ResultView";
import { useAnalysis } from "@/hooks/use-analysis";
import { api } from "@/services/api";
import { SAMPLES } from "@/services/demo";

export const Route = createFileRoute("/message")({
  head: () => ({
    meta: [
      { title: "Message scam checker — CyberGuard" },
      { name: "description", content: "Paste an SMS, WhatsApp message or email to detect phishing, OTP scams and social engineering." },
      { property: "og:title", content: "Message scam checker — CyberGuard" },
      { property: "og:description", content: "Find out if that message is a scam, and why." },
    ],
  }),
  component: MessagePage,
});

function MessagePage() {
  const [text, setText] = useState("");
  const [save, setSave] = useState(false);
  const { result, loading, run } = useAnalysis();
  return (
    <Page>
      <PageHeader icon={<MessageSquareWarning />} title="Check a message" subtitle="SMS, WhatsApp, email or social media — paste it here and we'll look for scam tactics." />
      <div className="glass rounded-2xl p-4">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the full message here..." className="min-h-40 border-0 bg-transparent text-base focus-visible:ring-0" maxLength={5000} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <SaveToggle checked={save} onChange={setSave} />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setText(SAMPLES.message)}>Use example</Button>
            <Button variant="hero" size="lg" disabled={loading || !text.trim()} onClick={() => run(() => api.message(text), save ? text : undefined)}>
              {loading ? <Loader2 className="animate-spin" /> : <ScanSearch />} Analyze
            </Button>
          </div>
        </div>
      </div>
      {result && <ResultView result={result} />}
    </Page>
  );
}
