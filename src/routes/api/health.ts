import { createFileRoute } from "@tanstack/react-router";
import { engineStatus } from "@/engines/models";
import { json } from "@/server/http";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => json({ status: "ok", time: new Date().toISOString(), engines: engineStatus() }),
    },
  },
});
