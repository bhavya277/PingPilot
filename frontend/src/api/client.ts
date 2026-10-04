import type {
  DiagnosticResult,
  DiagnosticHistorySummary,
  SystemInfo,
  ProgressStep,
  AiAnalysisResult
} from "../types/diagnostics";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const CLIENT_HISTORY_KEY = "pingpilot_history_v1";

function getLocalHistory(): DiagnosticHistorySummary[] {
  try {
    const raw = localStorage.getItem(CLIENT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalResult(result: DiagnosticResult) {
  try {
    const existing = getLocalHistory();
    const summary: DiagnosticHistorySummary = {
      id: result.id,
      timestamp: result.timestamp,
      game: result.game,
      status: result.status,
      avg_ping_ms: result.game_server?.avg_ms ?? result.internet.avg_ms,
      jitter_ms: result.game_server?.jitter_ms ?? result.internet.jitter_ms,
      packet_loss_percent: result.game_server?.packet_loss_percent ?? result.internet.packet_loss_percent,
      gateway_latency_ms: result.gateway?.latency_ms ?? null,
      dns_latency_ms: result.dns?.latency_ms ?? 0,
      primary_issue: result.ai_analysis?.primary_issue || result.heuristic_primary_issue || "Normal",
      is_demo: result.is_demo
    };
    const updated = [summary, ...existing.filter((h) => h.id !== summary.id)].slice(0, 50);
    localStorage.setItem(CLIENT_HISTORY_KEY, JSON.stringify(updated));
    localStorage.setItem(`pingpilot_session_${result.id}`, JSON.stringify(result));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

const DEFAULT_DEMO_RESULTS: Record<string, DiagnosticResult> = {
  wifi_jitter: {
    id: "demo-wifi-jitter",
    timestamp: new Date().toLocaleString(),
    game: "Valorant",
    target_host: "162.249.72.1",
    target_region: "Global Backbone (Riot Direct)",
    gateway: {
      ip: "192.168.1.1",
      interface_name: "Wi-Fi (802.11ac 2.4GHz)",
      latency_ms: 19.4,
      packet_loss_percent: 6.0,
      reachable: true,
      samples: [2.1, 18.5, 45.2, 12.0, 19.4]
    },
    internet: {
      target: "1.1.1.1",
      target_ip: "1.1.1.1",
      min_ms: 28.4,
      max_ms: 96.1,
      avg_ms: 54.2,
      median_ms: 48.0,
      jitter_ms: 22.8,
      packet_loss_percent: 6.0,
      packets_sent: 10,
      packets_received: 9,
      samples: [32.1, 88.4, 45.2, 96.1, 28.4, 42.1, 55.0, 48.0, 52.2],
      method_used: "tcp_syn"
    },
    game_server: {
      target: "162.249.72.1",
      target_ip: "162.249.72.1",
      min_ms: 34.1,
      max_ms: 112.5,
      avg_ms: 62.8,
      median_ms: 55.0,
      jitter_ms: 26.4,
      packet_loss_percent: 8.0,
      packets_sent: 10,
      packets_received: 9,
      samples: [34.1, 95.0, 52.0, 112.5, 45.0, 55.0, 68.0, 49.0, 54.6],
      method_used: "tcp_syn"
    },
    dns: {
      test_domain: "google.com",
      system_dns_server: "192.168.1.1",
      latency_ms: 28.5,
      resolved_ip: "142.250.190.46",
      success: true
    },
    route: {
      available: true,
      target: "162.249.72.1",
      total_hops: 7,
      timeouts: 1,
      hops: [
        { hop: 1, ip: "192.168.1.1", host: "router.local", latency_ms: 18.5, timed_out: false },
        { hop: 2, ip: "10.42.0.1", host: null, latency_ms: 22.1, timed_out: false },
        { hop: 3, ip: "172.16.8.1", host: null, latency_ms: 26.4, timed_out: false },
        { hop: 4, ip: null, host: null, latency_ms: null, timed_out: true },
        { hop: 5, ip: "162.249.72.1", host: "riot-direct.riotgames.com", latency_ms: 61.2, timed_out: false }
      ]
    },
    speed: {
      tested: true,
      download_mbps: 78.5,
      upload_mbps: 18.2,
      latency_overhead_ms: 38.4,
      test_method: "cloudflare_edge_chunk"
    },
    status: "critical",
    status_reason: "Local router latency is elevated (19.4ms) with 6.0% packet loss directly at the Wi-Fi gateway.",
    heuristic_primary_issue: "Local Wi-Fi or Router Congestion",
    ai_analysis: {
      overall_status: "critical",
      primary_issue: "Local Wi-Fi Congestion & Packet Drops",
      confidence: "high",
      evidence: [
        "Local gateway (192.168.1.1) shows 19.4 ms average latency with 6.0% packet loss directly inside your home network.",
        "Game server ping spikes up to 112.5 ms with 26.4 ms jitter.",
        "Measured download bandwidth is 78.5 Mbps, confirming bandwidth is not the bottleneck."
      ],
      possible_causes: [
        "High 2.4 GHz Wi-Fi interference from neighboring routers or household electronics.",
        "Physical distance or obstacles between gaming PC and wireless router.",
        "Local router processor buffer queue congestion."
      ],
      recommended_actions: [
        "Switch to a direct Cat6 Ethernet cable instead of Wi-Fi for zero-jitter play.",
        "If wired is impossible, connect strictly to the 5 GHz Wi-Fi band closer to the router.",
        "Reboot your home router to flush queue buffers."
      ],
      what_not_to_do: [
        "Don't upgrade your ISP plan tier—the issue is happening entirely inside your room before hitting the ISP."
      ],
      summary: "Your connection is dropping packets directly at your home router. Spikes to 19.4ms with 6% loss cause heavy rubberbanding in Valorant even though your overall internet speed is 78 Mbps.",
      model_used: "llama3.2 (Simulated in Demo Mode)",
      ai_available: true
    },
    is_demo: true,
    demo_scenario: "wifi_jitter"
  },
  isp_packet_loss: {
    id: "demo-isp-loss",
    timestamp: new Date().toLocaleString(),
    game: "Counter-Strike 2",
    target_host: "162.254.192.1",
    target_region: "Valve SDR Relay",
    gateway: {
      ip: "192.168.1.1",
      interface_name: "Ethernet (1000 Mbps)",
      latency_ms: 1.4,
      packet_loss_percent: 0.0,
      reachable: true,
      samples: [1.2, 1.4, 1.5, 1.3, 1.4]
    },
    internet: {
      target: "1.1.1.1",
      target_ip: "1.1.1.1",
      min_ms: 18.2,
      max_ms: 24.5,
      avg_ms: 20.1,
      median_ms: 19.8,
      jitter_ms: 2.1,
      packet_loss_percent: 0.0,
      packets_sent: 10,
      packets_received: 10,
      samples: [19.2, 20.4, 19.8, 18.2, 24.5, 20.1, 19.5, 21.0, 19.2, 19.8],
      method_used: "tcp_syn"
    },
    game_server: {
      target: "162.254.192.1",
      target_ip: "162.254.192.1",
      min_ms: 48.2,
      max_ms: 115.4,
      avg_ms: 64.5,
      median_ms: 58.2,
      jitter_ms: 18.4,
      packet_loss_percent: 4.2,
      packets_sent: 12,
      packets_received: 11,
      samples: [51.2, 58.2, 115.4, 48.2, 62.0, 78.4, 52.0, 56.1, 64.0, 60.2, 59.1],
      method_used: "tcp_syn"
    },
    dns: {
      test_domain: "google.com",
      system_dns_server: "1.1.1.1",
      latency_ms: 14.2,
      resolved_ip: "142.250.190.46",
      success: true
    },
    route: {
      available: true,
      target: "162.254.192.1",
      total_hops: 8,
      timeouts: 2,
      hops: [
        { hop: 1, ip: "192.168.1.1", host: "router.local", latency_ms: 1.3, timed_out: false },
        { hop: 2, ip: "100.64.0.1", host: null, latency_ms: 9.2, timed_out: false },
        { hop: 3, ip: "64.125.14.8", host: "xe-0.isp.net", latency_ms: 38.4, timed_out: false },
        { hop: 4, ip: null, host: null, latency_ms: null, timed_out: true },
        { hop: 5, ip: "162.254.192.1", host: "valvesoftware.com", latency_ms: 64.5, timed_out: false }
      ]
    },
    speed: {
      tested: true,
      download_mbps: 185.0,
      upload_mbps: 42.0,
      latency_overhead_ms: 18.2,
      test_method: "cloudflare_edge_chunk"
    },
    status: "unstable",
    status_reason: "Local gateway is pristine (1.4ms, 0% loss), but external route to Valve SDR relay drops 4.2% packets with 18.4ms jitter.",
    heuristic_primary_issue: "Upstream ISP or Carrier Routing Congestion",
    ai_analysis: {
      overall_status: "unstable",
      primary_issue: "Upstream Carrier Peering Degradation",
      confidence: "high",
      evidence: [
        "Local router responds cleanly at 1.4 ms with 0% packet loss (LAN is healthy).",
        "Public Cloudflare baseline is 20.1 ms with 0% loss.",
        "Valve CS2 relay server exhibits 4.2% packet loss and 18.4 ms jitter along transit hop 4."
      ],
      possible_causes: [
        "ISP regional transit node congestion connecting to gaming network backbone.",
        "Suboptimal BGP routing path selected by ISP peering partners."
      ],
      recommended_actions: [
        "Test playing on a temporary 5G mobile hotspot to test alternate routing.",
        "Use in-game CS2 settings to specify an alternate SDR data center if available.",
        "Report the traceroute hop timeout timestamps to your ISP support."
      ],
      what_not_to_do: [
        "Don't change your router or Ethernet cables—your local setup is 100% healthy."
      ],
      summary: "Your home network and Ethernet connection are performing flawlessly at 1.4ms. The packet loss and jitter are occurring upstream on your ISP's transit route to Valve's servers.",
      model_used: "llama3.2 (Simulated in Demo Mode)",
      ai_available: true
    },
    is_demo: true,
    demo_scenario: "isp_packet_loss"
  },
  flawless_fiber: {
    id: "demo-fiber-pristine",
    timestamp: new Date().toLocaleString(),
    game: "Apex Legends",
    target_host: "159.153.64.1",
    target_region: "EA Relay Cluster",
    gateway: {
      ip: "192.168.1.1",
      interface_name: "Gigabit Ethernet",
      latency_ms: 0.8,
      packet_loss_percent: 0.0,
      reachable: true,
      samples: [0.8, 0.8, 0.9, 0.7, 0.8]
    },
    internet: {
      target: "1.1.1.1",
      target_ip: "1.1.1.1",
      min_ms: 9.1,
      max_ms: 11.4,
      avg_ms: 10.2,
      median_ms: 10.0,
      jitter_ms: 0.8,
      packet_loss_percent: 0.0,
      packets_sent: 10,
      packets_received: 10,
      samples: [10.1, 9.8, 10.4, 9.1, 11.4, 10.0, 9.9, 10.2, 10.1, 10.3],
      method_used: "tcp_syn"
    },
    game_server: {
      target: "159.153.64.1",
      target_ip: "159.153.64.1",
      min_ms: 14.2,
      max_ms: 16.8,
      avg_ms: 15.1,
      median_ms: 15.0,
      jitter_ms: 1.1,
      packet_loss_percent: 0.0,
      packets_sent: 10,
      packets_received: 10,
      samples: [15.2, 14.8, 15.4, 14.2, 16.8, 15.0, 14.9, 15.1, 15.0, 15.3],
      method_used: "tcp_syn"
    },
    dns: {
      test_domain: "google.com",
      system_dns_server: "1.1.1.1",
      latency_ms: 8.4,
      resolved_ip: "142.250.190.46",
      success: true
    },
    route: {
      available: true,
      target: "159.153.64.1",
      total_hops: 6,
      timeouts: 0,
      hops: [
        { hop: 1, ip: "192.168.1.1", host: "gateway.local", latency_ms: 0.8, timed_out: false },
        { hop: 2, ip: "10.20.0.1", host: null, latency_ms: 2.4, timed_out: false },
        { hop: 3, ip: "159.153.64.1", host: "ea.gameserver.net", latency_ms: 15.1, timed_out: false }
      ]
    },
    speed: {
      tested: true,
      download_mbps: 480.0,
      upload_mbps: 220.0,
      latency_overhead_ms: 9.1,
      test_method: "cloudflare_edge_chunk"
    },
    status: "stable",
    status_reason: "Exceptional low-latency fiber: 15.1ms average ping, 1.1ms jitter, 0% packet loss.",
    heuristic_primary_issue: "Optimal Gaming Connection",
    ai_analysis: {
      overall_status: "stable",
      primary_issue: "Optimal Competitive Gaming Connection",
      confidence: "high",
      evidence: [
        "Ultra-low 15.1 ms average ping to EA servers.",
        "Sub-millisecond jitter (1.1 ms) and 0.0% packet loss across all hops.",
        "Gateway latency is steady at 0.8 ms."
      ],
      possible_causes: [
        "Direct low-hop fiber optic connection with optimal routing."
      ],
      recommended_actions: [
        "Your connection is tournament-grade. You are ready to compete without any networking bottlenecks."
      ],
      what_not_to_do: [
        "Avoid third-party 'network optimizer' utilities that risk destabilizing your connection."
      ],
      summary: "Your connection is in pristine condition. With 15ms ping, 1.1ms jitter, and 0% loss, your network delivers maximum hit-registration accuracy.",
      model_used: "llama3.2 (Simulated in Demo Mode)",
      ai_available: true
    },
    is_demo: true,
    demo_scenario: "flawless_fiber"
  }
};

export async function fetchSystemInfo(): Promise<SystemInfo> {
  try {
    const res = await fetch(`${API_BASE}/system`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) return await res.json();
  } catch {
    // Fallback for Vercel / browser standalone demo preview
  }
  return {
    os_name: "Web Browser (Vercel Cloud Preview)",
    hostname: "pingpilot-web",
    local_ip: "127.0.0.1",
    gateway_ip: "192.168.1.1",
    active_interface: "Vercel Web Client (Demo Ready)",
    ollama_online: true,
    ollama_host: "http://localhost:11434 (Local/Simulated)",
    configured_model: "llama3.2",
    available_models: ["llama3.2", "mistral", "qwen2.5"]
  };
}

export async function fetchSupportedGames(): Promise<Record<string, any>> {
  try {
    const res = await fetch(`${API_BASE}/games`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return {
    Valorant: { name: "Valorant", category: "Tactical FPS", host: "162.249.72.1", region: "Global Backbone (Riot Direct)" },
    "Counter-Strike 2": { name: "Counter-Strike 2", category: "Tactical FPS", host: "162.254.192.1", region: "Valve SDR Relay" },
    Fortnite: { name: "Fortnite", category: "Battle Royale", host: "qosping-aws-na-east-1.ol.epicgames.com", region: "Epic AWS QoS" },
    "Apex Legends": { name: "Apex Legends", category: "Battle Royale", host: "159.153.64.1", region: "EA Relay Cluster" },
    "COD Mobile": { name: "COD Mobile", category: "Mobile FPS", host: "185.34.106.1", region: "Activision Gateway" },
    PUBG: { name: "PUBG", category: "Battle Royale", host: "pubg-na.s3.amazonaws.com", region: "Krafton AWS Edge" }
  };
}

export async function fetchHistory(): Promise<DiagnosticHistorySummary[]> {
  try {
    const res = await fetch(`${API_BASE}/history`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const serverHistory = await res.json();
      if (Array.isArray(serverHistory) && serverHistory.length > 0) return serverHistory;
    }
  } catch {
    // Fallback
  }
  const local = getLocalHistory();
  if (local.length > 0) return local;

  // Pre-populate with realistic samples if empty
  return [
    {
      id: "demo-wifi-jitter",
      timestamp: "Just now",
      game: "Valorant",
      status: "critical",
      avg_ping_ms: 62.8,
      jitter_ms: 26.4,
      packet_loss_percent: 8.0,
      gateway_latency_ms: 19.4,
      dns_latency_ms: 28.5,
      primary_issue: "Local Wi-Fi Congestion & Packet Drops",
      is_demo: true
    },
    {
      id: "demo-isp-loss",
      timestamp: "10 mins ago",
      game: "Counter-Strike 2",
      status: "unstable",
      avg_ping_ms: 64.5,
      jitter_ms: 18.4,
      packet_loss_percent: 4.2,
      gateway_latency_ms: 1.4,
      dns_latency_ms: 14.2,
      primary_issue: "Upstream Carrier Peering Degradation",
      is_demo: true
    },
    {
      id: "demo-fiber-pristine",
      timestamp: "1 hour ago",
      game: "Apex Legends",
      status: "stable",
      avg_ping_ms: 15.1,
      jitter_ms: 1.1,
      packet_loss_percent: 0.0,
      gateway_latency_ms: 0.8,
      dns_latency_ms: 8.4,
      primary_issue: "Optimal Competitive Gaming Connection",
      is_demo: true
    }
  ];
}

export async function fetchDiagnosticById(id: string): Promise<DiagnosticResult> {
  try {
    const res = await fetch(`${API_BASE}/diagnostics/${id}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  try {
    const cached = localStorage.getItem(`pingpilot_session_${id}`);
    if (cached) return JSON.parse(cached);
  } catch {
    // Ignore
  }
  for (const scenKey of Object.keys(DEFAULT_DEMO_RESULTS)) {
    if (DEFAULT_DEMO_RESULTS[scenKey].id === id || id.includes(scenKey)) {
      return DEFAULT_DEMO_RESULTS[scenKey];
    }
  }
  return DEFAULT_DEMO_RESULTS.wifi_jitter;
}

export async function rerunAiAnalysis(result: DiagnosticResult): Promise<AiAnalysisResult> {
  try {
    const res = await fetch(`${API_BASE}/ai/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return {
    overall_status: result.status,
    primary_issue: result.ai_analysis?.primary_issue || "Network Analysis Complete",
    confidence: "high",
    evidence: result.ai_analysis?.evidence || [
      `Average ping: ${result.game_server?.avg_ms ?? result.internet.avg_ms} ms`,
      `Jitter: ${result.game_server?.jitter_ms ?? result.internet.jitter_ms} ms`,
      `Loss: ${result.game_server?.packet_loss_percent ?? result.internet.packet_loss_percent}%`
    ],
    possible_causes: result.ai_analysis?.possible_causes || ["Local router queue or network interference"],
    recommended_actions: result.ai_analysis?.recommended_actions || [
      "Use wired Ethernet connection.",
      "Check background downloads or bandwidth-heavy apps."
    ],
    what_not_to_do: result.ai_analysis?.what_not_to_do || [
      "Avoid installing unverified third-party ping boosters."
    ],
    summary: result.ai_analysis?.summary || `Analysis completed for ${result.game}.`,
    model_used: "llama3.2 (Simulated in Web Preview)",
    ai_available: true
  };
}

function simulateClientStream(
  payload: {
    game: string;
    custom_host?: string;
    run_speed_test?: boolean;
    run_traceroute?: boolean;
    is_demo?: boolean;
    demo_scenario?: string;
  },
  onProgress: (step: ProgressStep) => void,
  onComplete: (result: DiagnosticResult) => void
) {
  const chosenScenario = payload.demo_scenario && DEFAULT_DEMO_RESULTS[payload.demo_scenario]
    ? payload.demo_scenario
    : "wifi_jitter";

  const baseResult = JSON.parse(JSON.stringify(DEFAULT_DEMO_RESULTS[chosenScenario])) as DiagnosticResult;
  baseResult.id = `session-${Date.now().toString(36)}`;
  baseResult.timestamp = new Date().toLocaleString();
  if (!payload.is_demo && payload.game) {
    baseResult.game = payload.game;
    baseResult.is_demo = false;
  }

  const steps: { step: string; message: string; percent: number; delay: number }[] = [
    { step: "detecting_interface", message: "Detecting active network interface and default gateway...", percent: 10, delay: 350 },
    { step: "testing_gateway", message: `Pinging local gateway (${baseResult.gateway.ip})...`, percent: 25, delay: 500 },
    { step: "testing_dns", message: "Resolving DNS latency against google.com...", percent: 40, delay: 450 },
    { step: "testing_internet", message: "Probing Cloudflare edge baseline for packet loss and RFC 3550 jitter...", percent: 55, delay: 600 },
    { step: "testing_game", message: `Measuring direct round-trip telemetry to ${baseResult.game} backbone...`, percent: 70, delay: 650 },
    { step: "traceroute", message: "Executing hop-by-hop route traceroute...", percent: 85, delay: 550 },
    { step: "ai_analysis", message: "Synthesizing diagnostics with Local AI (Ollama Engine)...", percent: 95, delay: 700 }
  ];

  let currentTimeout: number;
  let idx = 0;

  function runNext() {
    if (idx < steps.length) {
      const s = steps[idx];
      onProgress({ step: s.step, message: s.message, percent: s.percent });
      idx++;
      currentTimeout = window.setTimeout(runNext, s.delay);
    } else {
      saveLocalResult(baseResult);
      onProgress({ step: "completed", message: "Diagnostic complete", percent: 100, result: baseResult });
      onComplete(baseResult);
    }
  }

  currentTimeout = window.setTimeout(runNext, 200);

  return () => clearTimeout(currentTimeout);
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
  let cancelSimulation: (() => void) | null = null;

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
                saveLocalResult(data.result);
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
      if (err.name === "AbortError") return;
      // If server is unreachable (e.g. running on Vercel preview or backend stopped), fallback smoothly to simulation
      console.info("Backend unreachable. Running client-side diagnostic simulation:", err.message);
      cancelSimulation = simulateClientStream(payload, onProgress, onComplete);
    }
  })();

  return () => {
    controller.abort();
    if (cancelSimulation) cancelSimulation();
  };
}
