import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Link2, Loader2, MessageSquareWarning, QrCode, ScanSearch, Siren, UserX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResultView } from "@/components/ResultView";
import { useAnalysis } from "@/hooks/use-analysis";
import { api } from "@/services/api";
import { SAMPLES } from "@/services/demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CyberGuard — Stay safe before you click" },
      { name: "description", content: "Check suspicious links, QR codes and messages for phishing and scams in seconds, with plain-language explanations." },
      { property: "og:title", content: "CyberGuard — Stay safe before you click" },
      { property: "og:description", content: "AI-ready cyber safety for everyone: check links, QR codes and messages before you trust them." },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { to: "/url", icon: Link2, title: "Check URL", desc: "Spot fake login pages and look-alike domains." },
  { to: "/qr", icon: QrCode, title: "Scan QR", desc: "See where a QR code really goes before opening it." },
  { to: "/message", icon: MessageSquareWarning, title: "Check Message", desc: "Detect phishing SMS, WhatsApp and email scams." },
  { to: "/impersonation", icon: UserX, title: "Check Impersonation", desc: "Is it really your bank, boss or family?" },
] as const;

function looksLikeUrl(s: string) {
  const t = s.trim();
  return !/\s/.test(t) && /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(t);
}

function Home() {
  const [text, setText] = useState("");
  const { result, loading, run } = useAnalysis();
  const analyze = () => {
    if (!text.trim()) return;
    run(() => (looksLikeUrl(text) ? api.url(text) : api.message(text)));
  };

  return (
    <div className="grid-bg">
      <section className="mx-auto max-w-4xl px-4 pb-10 pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
          <ScanSearch className="h-3.5 w-3.5" /> Free scam checker for everyone
        </span>
        <h1 className="mt-6 text-5xl font-bold leading-tight sm:text-6xl">
          Stay Safe <span className="text-primary">Before You Click.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          CyberGuard uses AI-powered threat analysis to help you identify phishing, malicious links, QR scams and digital impersonation.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="hero" size="xl"><Link to="/url"><Link2 /> Check a Link</Link></Button>
          <Button asChild variant="surface" size="xl"><Link to="/qr"><QrCode /> Scan QR Code</Link></Button>
          <Button asChild variant="surface" size="xl"><Link to="/message"><MessageSquareWarning /> Check a Message</Link></Button>
        </div>
        <Button asChild variant="emergency" className="mt-4"><Link to="/scammed"><Siren /> I Think I Got Scammed</Link></Button>
      </section>

      <section className="mx-auto max-w-4xl px-4">
        <div className="glass glow rounded-2xl p-4 sm:p-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a suspicious link or message here..."
            className="min-h-32 resize-none border-0 bg-transparent text-base focus-visible:ring-0"
            maxLength={5000}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) analyze(); }}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" onClick={() => setText(SAMPLES.message)}><Sparkles /> Try a scam SMS</Button>
              <Button size="sm" variant="ghost" onClick={() => setText(SAMPLES.url)}><Sparkles /> Try a fake link</Button>
            </div>
            <Button variant="hero" size="lg" onClick={analyze} disabled={loading || !text.trim()}>
              {loading ? <Loader2 className="animate-spin" /> : <ScanSearch />} Analyze Now
            </Button>
          </div>
        </div>
        {result && <ResultView result={result} />}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          CyberGuard checks suspicious digital content and explains what makes it risky.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} className="glass group rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-primary/60">
            <f.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-semibold group-hover:text-primary">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
