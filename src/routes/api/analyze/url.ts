import { createFileRoute } from "@tanstack/react-router";
import { analyzeUrl } from "@/engines/analyze";
import { analysisHandler, str } from "@/server/http";

export const Route = createFileRoute("/api/analyze/url")({
  server: { handlers: { POST: analysisHandler<{ url?: unknown }>((b) => analyzeUrl(str(b.url, 2048))) } },
});
