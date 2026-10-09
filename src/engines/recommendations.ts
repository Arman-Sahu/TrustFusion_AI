import type { Classification, Indicator, Severity } from "./types";

export function recommendFor(c: Classification, sev: Severity, indicators: Indicator[]): string[] {
  const has = (k: string) => indicators.some((i) => i.key === k);
  if (sev === "SAFE")
    return [
      "No major warning signs found — still stay alert.",
      "Only enter personal details on websites you reached yourself.",
      "If anything feels off, verify through the official app or website.",
    ];
  const recs = new Set<string>();
  switch (c) {
    case "OTP_SCAM":
      ["Never share an OTP or verification code with anyone.", "Contact the organisation through its official app or number.", "Block and report the sender."].forEach((r) => recs.add(r));
      break;
    case "QR_PHISHING":
      ["Do not open the QR destination.", "Do not enter payment or login information.", "Close the page if you already opened it."].forEach((r) => recs.add(r));
      break;
    case "PAYMENT_SCAM":
      ["Do not send money or buy gift cards.", "Verify the request by calling the person/company on a number you already know.", "If you paid, contact your bank immediately."].forEach((r) => recs.add(r));
      break;
    case "PRIZE_SCAM":
      ["Ignore the 'prize' — you can't win something you never entered.", "Never pay a fee to claim a reward.", "Delete and report the message."].forEach((r) => recs.add(r));
      break;
    case "IMPERSONATION":
      ["Do not act on the request.", "Verify identity through an official channel you look up yourself.", "Report the impersonation to the real organisation."].forEach((r) => recs.add(r));
      break;
    default:
      ["Do not click the link.", "Do not enter passwords or card details.", "Report the message or website."].forEach((r) => recs.add(r));
  }
  if (has("credential_request") || has("login_page")) recs.add("If you already entered a password, change it now and enable two-factor authentication (MFA).");
  if (has("remote_access")) recs.add("Do not install any app the sender recommends. Uninstall it if you did.");
  if (has("otp_request") && c !== "OTP_SCAM") recs.add("Never share your OTP.");
  if (sev === "CRITICAL" || sev === "HIGH") recs.add("Use the 'I think I got scammed' guide if you already interacted.");
  return [...recs].slice(0, 6);
}
