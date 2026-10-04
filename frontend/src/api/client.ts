import type {
  DiagnosticResult,
  DiagnosticHistorySummary,
  SystemInfo,
  ProgressStep,
  AiAnalysisResult
} from "../types/diagnostics";

const API_BASE = "http://127.0.0.1:8000/api";

export async function fetchSystemInfo(): Promise<SystemInfo> {
  const res = await fetch(`${API_BASE}/system`);
  if (!res.ok) throw new Error("Failed to fetch system info");
  return res.json();
}

export async function fetchSupportedGames(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/games`);
  if (!res.ok) throw new Error("Failed to fetch games list");
  return res.json();
}

export async function fetchHistory(): Promise<DiagnosticHistorySummary[]> {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error("Failed to fetch diagnostic history");
  return res.json();
}

export async function fetchDiagnosticById(id: string): Promise<DiagnosticResult> {
  const res = await fetch(`${API_BASE}/diagnostics/${id}`);
  if (!res.ok) throw new Error("Failed to fetch diagnostic session");
  return res.json();
}

export async function rerunAiAnalysis(result: DiagnosticResult): Promise<AiAnalysisResult> {
  const res = await fetch(`${API_BASE}/ai/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result)
  });
  if (!res.ok) throw new Error("Failed to generate AI analysis");
  return res.json();
}

export function streamDiagnosticSession(
  payload: {
    game: string;
    custom_host?: string;
    run_speed_test?: boolean;
    run_traceroute?: boolean;
    is_demo?: boolean;
    demo_scenario?: string;
  },
  onProgress: (step: ProgressStep) => void,
  onComplete: (result: DiagnosticResult) => void,
  onError: (error: string) => void
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${API_BASE}/diagnostics/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Diagnostics server error (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream reader not supported in browser");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.step === "error") {
                onError(data.message || "Diagnostic error occurred");
                return;
              }
              onProgress(data);
              if (data.step === "completed" && data.result) {
                onComplete(data.result);
                return;
              }
            } catch (err) {
              console.error("Failed to parse SSE line:", err);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        onError(err.message || "Connection to diagnostic engine lost");
      }
    }
  })();

  return () => controller.abort();
}
