import type { EngineState, Indicator } from "./types";

/**
 * Pluggable model interfaces. Each returns extra indicators (evidence) or null
 * when not configured. The rule-based engines remain the fallback.
 */
export interface ThreatModel<I> {
  id: string;
  label: string;
  intended: string;
  isConfigured(): boolean;
  predict(input: I): Promise<Indicator[] | null>;
}

const env = (k: string) => (typeof process !== "undefined" ? process.env?.[k] : undefined);

export const urlThreatModel: ThreatModel<string> = {
  id: "url", label: "URL detection", intended: "XGBoost / Random Forest",
  isConfigured: () => false,
  predict: async () => null,
};
export const messageThreatModel: ThreatModel<string> = {
  id: "message", label: "Message detection", intended: "DistilBERT / BERT classifier",
  isConfigured: () => false,
  predict: async () => null,
};
export const behaviorAnomalyModel: ThreatModel<unknown> = {
  id: "behavior", label: "Behaviour detection", intended: "Isolation Forest",
  isConfigured: () => false,
  predict: async () => null,
};

export function engineStatus(): {
  id: string; label: string; engine: string; state: EngineState; note: string;
}[] {
  const ti = !!env("THREAT_INTELLIGENCE_API_KEY");
  const llm = !!env("LLM_API_KEY");
  return [
    { id: "url", label: "URL detection", engine: "Hybrid ML-ready heuristic engine", state: "FALLBACK", note: `Local heuristics active. ${urlThreatModel.intended} model not connected.` },
    { id: "message", label: "Message detection", engine: "NLP hybrid rule engine", state: "FALLBACK", note: `Rules + text features active. ${messageThreatModel.intended} not connected.` },
    { id: "qr", label: "QR detection", engine: "jsQR decoder + URL analysis", state: "ACTIVE", note: "Decoded in your browser, then sent to the URL engine." },
    { id: "behavior", label: "Behaviour detection", engine: "Isolation Forest-ready", state: "NOT_CONFIGURED", note: "No behavioural model connected." },
    { id: "explain", label: "Explanation", engine: "LLM-compatible template engine", state: llm ? "ACTIVE" : "FALLBACK", note: llm ? "LLM key present." : "Evidence-based templates active." },
    { id: "intel", label: "Threat intelligence", engine: "External reputation API", state: ti ? "ACTIVE" : "NOT_CONFIGURED", note: ti ? "API key present." : "No reputation lookups — results are local heuristic analysis." },
  ];
}
