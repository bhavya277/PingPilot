export type ConnectionStatus = "stable" | "unstable" | "critical";

export interface PingStats {
  target: string;
  target_ip?: string;
  min_ms: number;
  max_ms: number;
  avg_ms: number;
  median_ms: number;
  jitter_ms: number;
  packet_loss_percent: number;
  packets_sent: number;
  packets_received: number;
  samples: number[];
  method_used: string;
}

export interface GatewayInfo {
  ip: string;
  interface_name: string;
  latency_ms: number | null;
  packet_loss_percent: number;
  reachable: boolean;
  samples: number[];
}

export interface DnsInfo {
  test_domain: string;
  system_dns_server: string;
  latency_ms: number;
  resolved_ip: string | null;
  success: boolean;
  error_message?: string;
}

export interface TracerouteHop {
  hop: number;
  ip: string | null;
  host: string | null;
  latency_ms: number | null;
  timed_out: boolean;
}

export interface RouteInfo {
  available: boolean;
  target: string;
  total_hops: number;
  timeouts: number;
  hops: TracerouteHop[];
  error_message?: string;
}

export interface SpeedEstimate {
  tested: boolean;
  download_mbps: number | null;
  upload_mbps: number | null;
  latency_overhead_ms: number | null;
  test_method: string;
}

export interface AiAnalysisResult {
  overall_status: ConnectionStatus;
  primary_issue: string;
  confidence: "low" | "medium" | "high";
  evidence: string[];
  possible_causes: string[];
  recommended_actions: string[];
  what_not_to_do: string[];
  summary: string;
  model_used?: string;
  ai_available: boolean;
  raw_response?: string;
}

export interface DiagnosticResult {
  id: string;
  timestamp: string;
  game: string;
  target_host: string;
  target_ip?: string;
  target_region?: string;
  gateway: GatewayInfo;
  internet: PingStats;
  game_server?: PingStats;
  dns: DnsInfo;
  route: RouteInfo;
  speed?: SpeedEstimate;
  status: ConnectionStatus;
  status_reason: string;
  heuristic_primary_issue: string;
  ai_analysis?: AiAnalysisResult;
  is_demo: boolean;
  demo_scenario?: string;
}

export interface DiagnosticHistorySummary {
  id: string;
  timestamp: string;
  game: string;
  status: ConnectionStatus;
  avg_ping_ms: number;
  jitter_ms: number;
  packet_loss_percent: number;
  gateway_latency_ms: number | null;
  dns_latency_ms: number;
  primary_issue: string;
  is_demo: boolean;
}

export interface SystemInfo {
  os_name: string;
  hostname: string;
  local_ip: string;
  gateway_ip: string;
  active_interface: string;
  ollama_online: boolean;
  ollama_host: string;
  configured_model: string;
  available_models: string[];
}

export interface ProgressStep {
  step: string;
  message: string;
  percent: number;
  result?: DiagnosticResult;
}
