import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link2, Loader2, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Page, PageHeader } from "@/components/PageHeader";
import { ResultView } from "@/components/ResultView";
import { useAnalysis } from "@/hooks/use-analysis";
import { api } from "@/services/api";
import { SAMPLES } from "@/services/demo";

export const Route = createFileRoute("/url")({
  head: () => ({
    meta: [
      { title: "Link checker — CyberGuard" },
      { name: "description", content: "Check a suspicious link for phishing, fake login pages and look-alike domains without opening it." },
      { property: "og:title", content: "Link checker — CyberGuard" },
      { property: "og:description", content: "Paste a link and see if it's safe before you click." },
    ],
  }),
  component: UrlPage,
});

function UrlPage() {
  const [url, setUrl] = useState("");
  const { result, loading, run } = useAnalysis();
  const go = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (url.trim()) run(() => api.url(url), url);
  };
  return (
    <Page>
      <PageHeader icon={<Link2 />} title="Check a link" subtitle="Paste any web address. We inspect it safely — we never open the link in your browser." />
      <form onSubmit={go} className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/login" className="h-12 flex-1 font-mono" maxLength={2048} aria-label="URL to check" />
        <Button type="submit" variant="hero" size="xl" disabled={loading || !url.trim()}>
          {loading ? <Loader2 className="animate-spin" /> : <ScanSearch />} Analyze
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="text-muted-foreground">Examples:</span>
        <button className="font-mono text-primary hover:underline" onClick={() => setUrl(SAMPLES.url)}>suspicious</button>
        <button className="font-mono text-primary hover:underline" onClick={() => setUrl(SAMPLES.safeUrl)}>normal</button>
      </div>
      {result && <ResultView result={result} />}
    </Page>
  );
}
