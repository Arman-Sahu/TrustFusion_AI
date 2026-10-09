import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Siren, Phone } from "lucide-react";
import { Page, PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scammed")({
  head: () => ({
    meta: [
      { title: "I think I got scammed — CyberGuard" },
      { name: "description", content: "Step-by-step emergency guidance if you clicked a scam link, shared an OTP, or sent money." },
      { property: "og:title", content: "I think I got scammed — CyberGuard" },
      { property: "og:description", content: "Clear, immediate steps to protect yourself after a scam." },
    ],
  }),
  component: Scammed,
});

const SCENARIOS: { id: string; label: string; steps: string[] }[] = [
  { id: "link", label: "I clicked a suspicious link", steps: ["Close the page immediately — don't enter anything.", "If a file downloaded, don't open it; delete it.", "Run your device's built-in security scan.", "If you typed any password on that page, change it on the official site.", "Watch your accounts for unusual activity over the next few days."] },
  { id: "qr", label: "I scanned a suspicious QR", steps: ["Close the opened page or payment app without confirming anything.", "If you approved a payment, call your bank or payment app right away.", "Check your UPI / wallet history for unknown transactions.", "Never scan a QR to 'receive' money — receiving never needs a scan or PIN."] },
  { id: "password", label: "I entered my password", steps: ["Stop using the suspicious website.", "Change the password using the official website/app.", "Sign out other active sessions.", "Enable MFA (two-step verification).", "Check account activity.", "Contact the official service provider if necessary.", "If you reuse that password elsewhere, change it there too."] },
  { id: "otp", label: "I shared an OTP", steps: ["Call your bank or the service immediately using the number on their official app/card.", "Ask them to block the card/account or the transaction.", "Change your account password and PIN.", "Check for new devices or payees added to your account.", "Report the fraud to your national cybercrime helpline (in India: 1930 / cybercrime.gov.in)."] },
  { id: "money", label: "I sent money", steps: ["Contact your bank or payment app right now — speed matters for reversals.", "Report the transaction as fraud and note the reference number.", "File a complaint with your national cybercrime authority (India: 1930).", "Keep screenshots of messages, numbers and receipts.", "Don't pay anyone who promises to 'recover' your money — that's often a second scam."] },
  { id: "impersonation", label: "Someone is impersonating someone I know", steps: ["Don't send money or codes.", "Contact the real person through a number you already have.", "Warn friends and family that the account is fake.", "Report the fake profile/number to the platform.", "If it's your account that was taken, follow the platform's account recovery steps."] },
  { id: "file", label: "I downloaded a suspicious file", steps: ["Don't open the file. Delete it and empty the trash/downloads.", "If you opened it, disconnect from the internet.", "Run a full antivirus / security scan.", "Change important passwords from a different, clean device.", "If it was an app (APK), uninstall it and revoke any permissions you granted."] },
];

function Scammed() {
  const [sel, setSel] = useState(SCENARIOS[0]!.id);
  const s = SCENARIOS.find((x) => x.id === sel)!;
  return (
    <Page>
      <PageHeader icon={<Siren />} title="Don't panic. Let's act fast." subtitle="Choose what happened. You'll get clear steps to limit the damage right now." />
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-2">
          {SCENARIOS.map((x) => (
            <button key={x.id} onClick={() => setSel(x.id)} className={cn("rounded-lg border px-4 py-3 text-left text-sm transition-colors", x.id === sel ? "border-sev-critical/60 bg-sev-critical/10 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold">{s.label}</h2>
          <ol className="mt-5 space-y-4">
            {s.steps.map((st, i) => (
              <li key={st} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sev-critical/15 font-mono text-sm font-semibold text-sev-critical">{i + 1}</span>
                <span className="pt-1">{st}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex gap-3 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            <Phone className="h-5 w-5 shrink-0 text-primary" />
            CyberGuard does not replace official emergency services, your bank, or law enforcement. If money or safety is at risk, contact them directly.
          </div>
        </div>
      </div>
    </Page>
  );
}
