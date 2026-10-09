import type { Indicator } from "./types";

interface Rule {
  key: string;
  name: string;
  weight: number;
  description: string;
  patterns: RegExp[];
}

/** Text-feature rules. ML-ready: a classifier can supply additional indicators via the model registry. */
export const MESSAGE_RULES: Rule[] = [
  { key: "urgency", name: "Creates urgency", weight: 12, description: "It pressures you to act quickly so you don't stop and think.",
    patterns: [/\b(urgent|immediately|right now|asap|within \d+ ?(hours?|hrs?|minutes?|mins?)|today only|last chance|final (notice|warning)|act now|expires? (today|soon))\b/i] },
  { key: "threat", name: "Threatens consequences", weight: 15, description: "It threatens to block, suspend or penalise you to scare you.",
    patterns: [/\b(blocked|suspended|deactivated|terminated|closed|legal action|arrest|penalty|fine|frozen|locked)\b/i] },
  { key: "otp_request", name: "Asks for your OTP / code", weight: 30, description: "Legitimate organisations never ask you to share a one-time password.",
    patterns: [/\b(otp|one[- ]time (password|code|pin)|verification code|security code|6[- ]digit code)\b/i] },
  { key: "credential_request", name: "Asks for passwords or account details", weight: 25, description: "It asks for login details, PIN, CVV or card numbers.",
    patterns: [/\b(password|passcode|pin\b|cvv|card (number|details)|login details|username and password|net ?banking|aadhaar|ssn|social security)\b/i] },
  { key: "payment_request", name: "Requests money or payment", weight: 18, description: "It asks you to pay, transfer money or buy gift cards.",
    patterns: [/\b(pay(ment)?|transfer|send money|upi|gift ?cards?|bitcoin|crypto|processing fee|small fee|deposit|refund)\b/i] },
  { key: "prize", name: "Too-good-to-be-true reward", weight: 18, description: "It promises a prize, lottery or cashback you didn't expect.",
    patterns: [/\b(won|winner|congratulations|lottery|prize|jackpot|cash ?back|reward|free (iphone|gift)|lucky draw|selected)\b/i] },
  { key: "authority_impersonation", name: "Claims to be an official organisation", weight: 15, description: "It claims to be from a bank, government, delivery company or tech support.",
    patterns: [/\b(bank|rbi|irs|income tax|police|customs|government|kyc|customer care|support team|microsoft|apple|amazon|paypal|courier|delivery|fedex|dhl|electricity (board|bill))\b/i] },
  { key: "link_click", name: "Pushes you to click a link", weight: 8, description: "It wants you to click or tap a link to 'fix' the problem.",
    patterns: [/\b(click (here|the link|below)|tap (here|the link)|visit the link|open the link|follow the link)\b/i] },
  { key: "secrecy", name: "Asks you to keep it secret", weight: 12, description: "Scammers ask you not to tell anyone so nobody can warn you.",
    patterns: [/\b(don'?t tell|keep (this|it) (secret|confidential|between us)|do not share with anyone)\b/i] },
  { key: "remote_access", name: "Asks to install an app / remote access", weight: 20, description: "It asks you to install software like AnyDesk or TeamViewer, which gives control of your device.",
    patterns: [/\b(anydesk|teamviewer|quick ?support|install (this|the) app|download (this|the) (app|apk)|\.apk\b)\b/i] },
  { key: "family_emergency", name: "Unexpected emergency from a 'contact'", weight: 15, description: "A 'friend or family member' suddenly needs money — a common impersonation scam.",
    patterns: [/\b(hi (mum|mom|dad)|new number|lost my phone|in trouble|hospital|accident).{0,80}\b(money|send|pay|transfer)\b/i] },
  { key: "generic_greeting", name: "Generic greeting", weight: 5, description: "It doesn't use your name, suggesting a mass-sent message.",
    patterns: [/^\s*(dear (customer|user|sir|madam|valued|account holder)|hello (customer|user))/i] },
];

export function analyzeMessageFeatures(text: string): Indicator[] {
  const ind: Indicator[] = [];
  for (const r of MESSAGE_RULES) {
    const match = r.patterns.map((p) => text.match(p)).find(Boolean);
    if (match) ind.push({ key: r.key, name: r.name, weight: r.weight, description: `${r.description} (found: "${match[0].slice(0, 40)}")` });
  }
  const letters = text.replace(/[^a-z]/gi, "");
  const caps = letters.replace(/[^A-Z]/g, "").length;
  if (letters.length > 30 && caps / letters.length > 0.5)
    ind.push({ key: "shouting", name: "Excessive capital letters", weight: 5, description: "Lots of CAPITALS is used to create panic or excitement." });
  if ((text.match(/!/g) ?? []).length >= 3)
    ind.push({ key: "exclaim", name: "Excessive exclamation marks", weight: 4, description: "Heavy use of '!' is typical of scam messages." });
  return ind;
}
