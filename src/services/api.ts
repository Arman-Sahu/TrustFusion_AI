import type { AnalysisResult, EngineState } from "@/engines/types";

export class ApiError extends Error {}

async function post(path: string, body: unknown): Promise<AnalysisResult> {
  let res: Response;
  try {
    res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new ApiError("We couldn't reach CyberGuard. Check your internet connection and try again.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error ?? "Something went wrong. Please try again.");
  return data as AnalysisResult;
}

export const api = {
  url: (url: string) => post("/api/analyze/url", { url }),
  message: (message: string) => post("/api/analyze/message", { message }),
  qr: (content: string) => post("/api/analyze/qr", { content }),
  impersonation: (b: { claimed_identity?: string; sender?: string; organisation?: string; requested_action?: string; message: string }) =>
    post("/api/analyze/impersonation", b),
  health: async () => {
    const r = await fetch("/api/health");
    if (!r.ok) throw new ApiError("Health check failed");
    return (await r.json()) as { status: string; time: string; engines: { id: string; label: string; engine: string; state: EngineState; note: string }[] };
  },
};
