import type { Indicator } from "./types";

const BRANDS = [
  "paypal", "google", "apple", "microsoft", "amazon", "netflix", "facebook", "instagram",
  "whatsapp", "sbi", "hdfc", "icici", "axis", "paytm", "phonepe", "flipkart", "bankofamerica",
  "chase", "wellsfargo", "dhl", "fedex", "ups", "irs", "outlook", "office365", "linkedin",
];
const OFFICIAL: Record<string, string[]> = {
  paypal: ["paypal.com"], google: ["google.com"], apple: ["apple.com", "icloud.com"],
  microsoft: ["microsoft.com", "live.com"], amazon: ["amazon.com", "amazon.in"],
  netflix: ["netflix.com"], facebook: ["facebook.com"], instagram: ["instagram.com"],
  whatsapp: ["whatsapp.com"], sbi: ["sbi.co.in", "onlinesbi.sbi"], hdfc: ["hdfcbank.com"],
  icici: ["icicibank.com"], axis: ["axisbank.com"], paytm: ["paytm.com"], phonepe: ["phonepe.com"],
  github: ["github.com"], wikipedia: ["wikipedia.org"], flipkart: ["flipkart.com"], linkedin: ["linkedin.com"], outlook: ["outlook.com", "live.com"],
};
const SUSPICIOUS_KEYWORDS = [
  "login", "signin", "verify", "verification", "secure", "account", "update", "confirm",
  "banking", "password", "wallet", "unlock", "suspend", "kyc", "reward", "bonus", "free", "gift",
];
const RISKY_TLDS = ["zip", "mov", "xyz", "top", "click", "gq", "tk", "ml", "cf", "ga", "work", "rest", "country", "icu", "cam", "live", "buzz"];
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "rb.gy", "ow.ly", "shorturl.at"];
const HOMOGLYPHS: Record<string, string> = { "0": "o", "1": "l", "3": "e", "5": "s", "rn": "m", "vv": "w" };

export function normalizeUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 2048 || /\s/.test(trimmed)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  try {
    const u = new URL(withScheme);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    if (!u.hostname.includes(".") && !/^\d+$/.test(u.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}

export function extractUrls(text: string): string[] {
  const re = /\b((?:https?:\/\/|www\.)[^\s<>"']+|[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|in|net|org|co|io|xyz|top|click|info|ly|me|tk|ml|gq|live|zip|app|site|online)(?:\/[^\s<>"']*)?)/gi;
  return [...new Set((text.match(re) ?? []).map((u) => u.replace(/[.,!?)]+$/, "")))].slice(0, 10);
}

function deHomoglyph(s: string) {
  let out = s;
  for (const [k, v] of Object.entries(HOMOGLYPHS)) out = out.split(k).join(v);
  return out;
}

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]) as number[][];
  for (let j = 1; j <= b.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length]![b.length]!;
}

/** Local heuristic URL feature extraction. Never fetches the URL. */
export function analyzeUrlFeatures(raw: string): { url: URL; indicators: Indicator[] } | null {
  const url = normalizeUrl(raw);
  if (!url) return null;
  const ind: Indicator[] = [];
  const host = url.hostname.toLowerCase();
  const full = url.href.toLowerCase();
  const labels = host.split(".");
  const tld = labels[labels.length - 1] ?? "";
  const registrable = labels.slice(-2).join(".");

  if (url.protocol !== "https:")
    ind.push({ key: "no_https", name: "No secure connection (HTTPS)", weight: 10, description: "The link doesn't use HTTPS, so data you enter isn't encrypted." });
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("["))
    ind.push({ key: "ip_host", name: "IP address instead of a name", weight: 25, description: "Real companies use domain names. Raw IP addresses are a common phishing trick." });
  if (full.length > 100)
    ind.push({ key: "long_url", name: "Unusually long link", weight: 8, description: `The link is ${full.length} characters long, which can hide its real destination.` });
  if (labels.length > 4)
    ind.push({ key: "many_subdomains", name: "Too many subdomains", weight: 12, description: `"${host}" has ${labels.length - 2} subdomains — often used to make a fake site look official.` });
  if (url.username || full.includes("@"))
    ind.push({ key: "at_symbol", name: "Hidden destination (@ symbol)", weight: 20, description: "An @ in a link can make the browser go somewhere other than what it looks like." });
  if (host.startsWith("xn--") || host.includes(".xn--"))
    ind.push({ key: "punycode", name: "Look-alike characters (punycode)", weight: 25, description: "The domain uses special characters that can imitate a real brand's name." });
  if ((host.match(/-/g) ?? []).length >= 3)
    ind.push({ key: "hyphens", name: "Many hyphens in domain", weight: 8, description: "Domains with lots of hyphens are frequently throwaway scam sites." });
  if (RISKY_TLDS.includes(tld))
    ind.push({ key: "risky_tld", name: `High-risk ending ".${tld}"`, weight: 15, description: `".${tld}" domains are cheap and often abused by scammers.` });
  if (SHORTENERS.includes(registrable) || SHORTENERS.includes(host))
    ind.push({ key: "shortener", name: "Link shortener hides destination", weight: 12, description: "Shortened links hide where you'll really end up." });
  if (/[?&](url|redirect|next|goto|return|dest)=https?/i.test(url.search))
    ind.push({ key: "redirect", name: "Redirects to another site", weight: 10, description: "The link contains a redirect to a different address." });
  if (/%[0-9a-f]{2}/i.test(url.pathname) && (url.pathname.match(/%/g) ?? []).length > 3)
    ind.push({ key: "encoded", name: "Heavily encoded characters", weight: 8, description: "Encoded characters can disguise what the link really contains." });

  const kw = SUSPICIOUS_KEYWORDS.filter((k) => full.includes(k));
  if (kw.length)
    ind.push({ key: "suspicious_keywords", name: "Suspicious words in link", weight: Math.min(15, 5 + kw.length * 3), description: `Contains: ${kw.slice(0, 5).join(", ")}.` });
  if (/(login|signin|sign-in|logon|password|verify|account|kyc)/.test(url.pathname + url.search))
    ind.push({ key: "login_page", name: "Login / credential page", weight: 12, description: "The page appears to ask you to log in or enter account details." });

  // Brand impersonation & look-alikes
  const hostNoTld = labels.slice(0, -1).join(".");
  const plain = deHomoglyph(hostNoTld.replace(/[-.]/g, ""));
  for (const brand of BRANDS) {
    const official = OFFICIAL[brand] ?? [`${brand}.com`];
    const isOfficial = official.some((d) => host === d || host.endsWith(`.${d}`));
    if (isOfficial) continue;
    if (plain.includes(brand)) {
      ind.push({ key: "brand_impersonation", name: `Pretends to be ${brand}`, weight: 25, description: `The address mentions "${brand}" but isn't ${brand}'s official website (${official[0]}).` });
      break;
    }
    const core = labels[labels.length - 2] ?? "";
    if (core.length >= 4 && levenshtein(deHomoglyph(core), brand) === 1) {
      ind.push({ key: "lookalike_domain", name: `Look-alike of ${brand}`, weight: 25, description: `"${core}" is one letter away from "${brand}" — a classic typo-squatting trick.` });
      break;
    }
  }

  const officialMatch = Object.values(OFFICIAL).flat().some((d) => host === d || host.endsWith(`.${d}`));
  if (officialMatch && url.protocol === "https:")
    ind.push({ key: "trusted_domain", name: "Known official domain", weight: -15, description: "This matches a well-known official website." });

  return { url, indicators: ind };
}
