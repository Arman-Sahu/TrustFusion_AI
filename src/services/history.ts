import { useSyncExternalStore } from "react";
import type { AnalysisResult } from "@/engines/types";

export interface HistoryEntry extends AnalysisResult {
  session_id: string;
  /** Raw input is only stored when the user explicitly opts in. */
  saved_input?: string | undefined;
  demo?: boolean;
}

const KEY = "cyberguard.history.v1";
const SESSION = "cyberguard.session";
const listeners = new Set<() => void>();
let cache: HistoryEntry[] | null = null;
const EMPTY: HistoryEntry[] = [];

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    cache = [];
  }
  return cache!;
}
function write(list: HistoryEntry[]) {
  cache = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 500)));
  } catch {
    /* storage full / unavailable */
  }
  listeners.forEach((l) => l());
}

export function sessionId() {
  let s = localStorage.getItem(SESSION);
  if (!s) {
    s = `anon-${crypto.randomUUID().slice(0, 8)}`;
    localStorage.setItem(SESSION, s);
  }
  return s;
}

export const history = {
  list: read,
  get: (id: string) => read().find((h) => h.id === id),
  save(r: AnalysisResult, savedInput?: string) {
    write([{ ...r, session_id: sessionId(), saved_input: savedInput }, ...read().filter((h) => h.id !== r.id)]);
  },
  remove: (id: string) => write(read().filter((h) => h.id !== id)),
  clear: () => write([]),
  addMany: (items: HistoryEntry[]) => write([...items, ...read()].sort((a, b) => b.created_at.localeCompare(a.created_at))),
};

export function useHistory() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}

export function computeStats(list: HistoryEntry[]) {
  const by = (f: (h: HistoryEntry) => boolean) => list.filter(f).length;
  return {
    total: list.length,
    safe: by((h) => h.severity === "SAFE"),
    threats: by((h) => ["MEDIUM", "HIGH", "CRITICAL"].includes(h.severity)),
    critical: by((h) => h.severity === "CRITICAL"),
    phishing: by((h) => ["PHISHING", "QR_PHISHING"].includes(h.classification)),
    qr: by((h) => h.input_type === "qr"),
    url: by((h) => h.input_type === "url"),
    message: by((h) => h.input_type === "message"),
    impersonation: by((h) => h.input_type === "impersonation"),
  };
}
