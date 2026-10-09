import { AnalysisInputError } from "@/engines/analyze";

const MAX_BODY = 16 * 1024;
const WINDOW_MS = 60_000;
const LIMIT = 30;
const hits = new Map<string, number[]>();

function rateLimited(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > LIMIT;
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });

/** Wraps an analysis handler with size limits, rate limiting and safe errors. */
export function analysisHandler<T>(run: (body: T) => unknown) {
  return async ({ request }: { request: Request }) => {
    if (rateLimited(request)) return json({ error: "Too many checks in a short time. Please wait a minute and try again." }, 429);
    const len = Number(request.headers.get("content-length") ?? 0);
    if (len > MAX_BODY) return json({ error: "That input is too large to analyse." }, 413);
    let body: T;
    try {
      const text = await request.text();
      if (text.length > MAX_BODY) return json({ error: "That input is too large to analyse." }, 413);
      body = JSON.parse(text) as T;
    } catch {
      return json({ error: "We couldn't read that request." }, 400);
    }
    try {
      return json(run(body));
    } catch (e) {
      if (e instanceof AnalysisInputError) return json({ error: e.message }, 400);
      console.error("analysis failed", e);
      return json({ error: "Our analysis engine had a problem. Please try again." }, 500);
    }
  };
}

export const str = (v: unknown, max = 5000) => (typeof v === "string" ? v.slice(0, max) : "");
