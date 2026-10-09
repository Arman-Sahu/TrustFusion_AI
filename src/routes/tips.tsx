import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, KeyRound, Link2, QrCode, Smartphone, UserCheck, Wallet, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/tips")({
  head: () => ({
    meta: [
      { title: "Cyber safety tips — CyberGuard" },
      { name: "description", content: "Simple everyday habits to protect yourself from phishing, OTP scams, QR fraud and impersonation." },
      { property: "og:title", content: "Cyber safety tips — CyberGuard" },
      { property: "og:description", content: "Easy habits that stop most online scams." },
    ],
  }),
  component: Tips,
});

const TIPS = [
  { icon: KeyRound, title: "Never share an OTP", body: "No bank, delivery company or government office will ever ask for your one-time code." },
  { icon: Link2, title: "Check the real address", body: "Look closely at the domain. 'paypa1.com' or 'sbi-verify.xyz' are not the real sites." },
  { icon: QrCode, title: "QR codes can lie", body: "You never need to scan a QR or enter a PIN to receive money." },
  { icon: Wallet, title: "Slow down on payments", body: "Urgency is a scammer's best tool. Pause, then verify through an official channel." },
  { icon: UserCheck, title: "Verify 'new numbers'", body: "If a friend or relative messages from a new number asking for money, call their old number." },
  { icon: Smartphone, title: "Don't install remote apps", body: "Apps like AnyDesk give strangers full control of your phone or computer." },
  { icon: ShieldCheck, title: "Turn on two-step login", body: "Multi-factor authentication stops most account takeovers, even if your password leaks." },
  { icon: BookOpen, title: "Use unique passwords", body: "A password manager makes it easy to never reuse a password." },
];

function Tips() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader icon={<BookOpen />} title="Everyday safety tips" subtitle="Eight habits that stop most scams before they start." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TIPS.map((t) => (
          <div key={t.title} className="glass rounded-xl p-5">
            <t.icon className="h-7 w-7 text-primary" />
            <h3 className="mt-3 font-semibold">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
