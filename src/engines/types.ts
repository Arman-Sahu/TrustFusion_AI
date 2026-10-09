export type Severity = "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type InputType = "url" | "message" | "qr" | "impersonation";
export type Classification =
  | "SAFE"
  | "SUSPICIOUS"
  | "PHISHING"
  | "QR_PHISHING"
  | "OTP_SCAM"
  | "PAYMENT_SCAM"
  | "PRIZE_SCAM"
  | "IMPERSONATION"
  | "MALICIOUS_URL";

export interface Indicator {
  /** Stable key used to avoid double-counting across engines */
  key: string;
  name: string;
  weight: number;
  description: string;
}

export interface AnalysisResult {
  id: string;
  input_type: InputType;
  risk_score: number;
  severity: Severity;
  classification: Classification;
  confidence: number;
  indicators: Indicator[];
  explanation: string;
  recommendations: string[];
  engine: "hybrid" | "heuristic";
  engine_note: string;
  created_at: string;
  /** Extra context, e.g. decoded QR content or analysed URL */
  subject?: string | undefined;
  extracted_urls?: string[] | undefined;
}

export type EngineState = "ACTIVE" | "FALLBACK" | "NOT_CONFIGURED";
