from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class PingStats(BaseModel):
    target: str
    target_ip: Optional[str] = None
    min_ms: float = 0.0
    max_ms: float = 0.0
    avg_ms: float = 0.0
    median_ms: float = 0.0
    jitter_ms: float = 0.0
    packet_loss_percent: float = 0.0
    packets_sent: int = 0
    packets_received: int = 0
    samples: List[float] = Field(default_factory=list)
    method_used: str = "icmp" # "icmp" or "tcp_handshake_fallback"

class GatewayInfo(BaseModel):
    ip: str = "Unknown"
    interface_name: str = "Unknown"
    latency_ms: Optional[float] = None
    packet_loss_percent: float = 0.0
    reachable: bool = False
    samples: List[float] = Field(default_factory=list)

class DnsInfo(BaseModel):
    test_domain: str = "google.com"
    system_dns_server: str = "Default"
    latency_ms: float = 0.0
    resolved_ip: Optional[str] = None
    success: bool = True
    error_message: Optional[str] = None

class TracerouteHop(BaseModel):
    hop: int
    ip: Optional[str] = None
    host: Optional[str] = None
    latency_ms: Optional[float] = None
    timed_out: bool = False

class RouteInfo(BaseModel):
    available: bool = True
    target: str
    total_hops: int = 0
    timeouts: int = 0
    hops: List[TracerouteHop] = Field(default_factory=list)
    error_message: Optional[str] = None

class SpeedEstimate(BaseModel):
    tested: bool = False
    download_mbps: Optional[float] = None
    upload_mbps: Optional[float] = None
    latency_overhead_ms: Optional[float] = None
    test_method: str = "http_chunk_stream"

class AiAnalysisResult(BaseModel):
    overall_status: Literal["stable", "unstable", "critical"]
    primary_issue: str
    confidence: Literal["low", "medium", "high"]
    evidence: List[str]
    possible_causes: List[str]
    recommended_actions: List[str]
    what_not_to_do: List[str]
    summary: str
    model_used: Optional[str] = None
    ai_available: bool = True
    raw_response: Optional[str] = None

class DiagnosticRunRequest(BaseModel):
    game: str = "Valorant"
    custom_host: Optional[str] = None
    custom_port: Optional[int] = 443
    run_speed_test: bool = True
    run_traceroute: bool = True
    is_demo: bool = False
    demo_scenario: Optional[str] = None

class SystemInfoResponse(BaseModel):
    os_name: str
    hostname: str
    local_ip: str
    gateway_ip: str
    active_interface: str
    ollama_online: bool
    ollama_host: str
    configured_model: str
    available_models: List[str] = Field(default_factory=list)

class DiagnosticResult(BaseModel):
    id: str
    timestamp: str
    game: str
    target_host: str
    target_ip: Optional[str] = None
    target_region: Optional[str] = None
    gateway: GatewayInfo
    internet: PingStats
    game_server: Optional[PingStats] = None
    dns: DnsInfo
    route: RouteInfo
    speed: Optional[SpeedEstimate] = None
    status: Literal["stable", "unstable", "critical"]
    status_reason: str
    heuristic_primary_issue: str
    ai_analysis: Optional[AiAnalysisResult] = None
    is_demo: bool = False
    demo_scenario: Optional[str] = None

class DiagnosticHistorySummary(BaseModel):
    id: str
    timestamp: str
    game: str
    status: Literal["stable", "unstable", "critical"]
    avg_ping_ms: float
    jitter_ms: float
    packet_loss_percent: float
    gateway_latency_ms: Optional[float]
    dns_latency_ms: float
    primary_issue: str
    is_demo: bool
