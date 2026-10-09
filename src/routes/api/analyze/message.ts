import { createFileRoute } from "@tanstack/react-router";
import { analyzeMessage } from "@/engines/analyze";
import { analysisHandler, str } from "@/server/http";

export const Route = createFileRoute("/api/analyze/message")({
  server: { handlers: { POST: analysisHandler<{ message?: unknown }>((b) => analyzeMessage(str(b.message))) } },
});
