import { useState } from "react";
import { toast } from "sonner";
import type { AnalysisResult } from "@/engines/types";
import { history } from "@/services/history";

/** Runs an analysis, handles friendly errors, and saves the result to history. */
export function useAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<AnalysisResult>, savedInput?: string) {
    setLoading(true);
    setError(null);
    try {
      const r = await fn();
      setResult(r);
      history.save(r, savedInput);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      setResult(null);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }
  return { result, loading, error, run, reset: () => setResult(null) };
}
