import { createFileRoute } from "@tanstack/react-router";
import { analyzeImpersonation } from "@/engines/analyze";
import { analysisHandler, str } from "@/server/http";

type Body = Record<string, unknown>;

export const Route = createFileRoute("/api/analyze/impersonation")({
  server: {
    handlers: {
      POST: analysisHandler<Body>((b) =>
        analyzeImpersonation({
          claimed_identity: str(b["claimed_identity"], 200),
          sender: str(b["sender"], 200),
          organisation: str(b["organisation"], 200),
          requested_action: str(b["requested_action"], 500),
          message: str(b["message"]),
        }),
      ),
    },
  },
});
