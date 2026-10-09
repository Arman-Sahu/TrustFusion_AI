import { analyzeImpersonation, analyzeMessage, analyzeQr, analyzeUrl } from "@/engines/analyze";
import { history, sessionId, type HistoryEntry } from "./history";

export const SAMPLES = {
  message:
    "URGENT: Dear Customer, your SBI account will be BLOCKED within 24 hours due to incomplete KYC. Click here to verify: http://sbi-kyc-verify.xyz/login and share the OTP sent to your phone.",
  url: "http://paypa1-secure-login.account-verify.top/signin?redirect=https://paypal.com",
  safeUrl: "https://www.wikipedia.org",
  impersonation: {
    claimed_identity: "Bank officer",
    organisation: "HDFC Bank",
    sender: "+91 98765 43210",
    requested_action: "Share OTP",
    message: "Hello, I am from your bank. Send your OTP immediately or your account will be blocked.",
  },
  qr: "https://amaz0n-rewards.click/claim?gift=iphone&login=1",
};

/** Seed history with real engine output (not hard-coded results). */
export function loadDemoData() {
  const sid = sessionId();
  const now = Date.now();
  const runs = [
    analyzeMessage(SAMPLES.message),
    analyzeUrl(SAMPLES.url),
    analyzeUrl(SAMPLES.safeUrl),
    analyzeImpersonation(SAMPLES.impersonation),
    analyzeQr(SAMPLES.qr),
    analyzeMessage("Congratulations! You WON a free iPhone in our lucky draw!!! Pay a small processing fee of Rs 99 via UPI to claim today only."),
    analyzeMessage("Hi, are we still meeting for lunch tomorrow at 1pm?"),
    analyzeUrl("https://github.com/login"),
    analyzeQr("upi://pay?pa=refund.desk@ybl&pn=Refund&am=4999"),
    analyzeMessage("Your parcel could not be delivered. Update your address: bit.ly/dhl-redeliver"),
  ];
  const items: HistoryEntry[] = runs.map((r, i) => ({
    ...r,
    session_id: sid,
    demo: true,
    created_at: new Date(now - i * 1000 * 60 * 60 * 9).toISOString(),
  }));
  history.addMany(items);
}
