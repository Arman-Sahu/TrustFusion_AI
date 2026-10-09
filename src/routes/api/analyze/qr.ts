import { createFileRoute } from "@tanstack/react-router";
import { analyzeQr } from "@/engines/analyze";
import { analysisHandler, str } from "@/server/http";

export const Route = createFileRoute("/api/analyze/qr")({
  server: { handlers: { POST: analysisHandler<{ content?: unknown }>((b) => analyzeQr(str(b.content, 4096))) } },
});
