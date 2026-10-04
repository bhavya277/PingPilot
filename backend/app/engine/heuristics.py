from typing import Tuple, Dict, Any, List
from ..models.schemas import PingStats, GatewayInfo, DnsInfo, SpeedEstimate

"""
DETERMINISTIC HEURISTIC THRESHOLDS FOR GAMING CONNECTIVITY:

Ping (Latency to target/edge):
  - Excellent:   < 40 ms
  - Acceptable:  40 - 80 ms
  - Problematic: > 80 ms

Jitter (RFC 3550 variance):
  - Excellent:   < 10 ms
  - Acceptable:  10 - 20 ms
  - Problematic: > 20 ms

Packet Loss:
  - Excellent:   < 1.0 %
  - Acceptable:  1.0 - 2.0 %
  - Problematic: >= 2.0 %

Gateway (Local Router):
  - Healthy:     < 5 ms, 0% loss
  - Degraded:    5 - 15 ms or > 0% loss
  - Problematic: > 15 ms or > 2% loss
"""

def evaluate_heuristics(
    gateway: GatewayInfo,
    internet: PingStats,
    game_server: PingStats = None,
    dns: DnsInfo = None,
    speed: SpeedEstimate = None
) -> Dict[str, Any]:
    # Use game_server if available and tested, otherwise internet baseline
    active_target = game_server if (game_server and game_server.packets_received > 0) else internet
    
    avg_ping = active_target.avg_ms
    jitter = active_target.jitter_ms
    loss = active_target.packet_loss_percent
    
    gw_loss = gateway.packet_loss_percent
    gw_latency = gateway.latency_ms if gateway.latency_ms is not None else 0.0

    # 1. Determine overall status
    is_critical = loss >= 5.0 or (loss >= 2.0 and jitter >= 25.0) or avg_ping > 130.0 or gw_loss >= 5.0
    is_unstable = (
        not is_critical and (
            loss >= 1.5 or 
            jitter > 18.0 or 
            avg_ping > 80.0 or 
            gw_loss > 0.0 or 
            gw_latency > 15.0 or
            (dns and dns.latency_ms > 100.0)
        )
    )

    if is_critical:
        status = "critical"
    elif is_unstable:
        status = "unstable"
    else:
        status = "stable"

    # 2. Root-cause classification
    evidence: List[str] = []
    causes: List[str] = []
    actions: List[str] = []
    what_not_to_do: List[str] = []
    primary_issue = "Normal Gaming Connection"
    status_reason = "All metrics within optimal gaming thresholds."

    # Pattern A: Local Network / Wi-Fi / Router Issue
    if gw_loss > 0 or gw_latency > 10.0:
        primary_issue = "Local Wi-Fi or Router Congestion"
        status_reason = f"Local router latency is elevated ({gw_latency:.1f}ms) with {gw_loss:.1f}% packet loss at the gateway."
        evidence.append(f"Gateway hop ({gateway.ip}) has {gw_latency:.1f}ms latency and {gw_loss:.1f}% packet loss.")
        causes.append("Wi-Fi interference, distance from access point, or local router bufferbloat.")
        causes.append("Local LAN saturation from another device streaming or downloading.")
        actions.append("Switch to a direct Ethernet cable instead of Wi-Fi.")
        actions.append("If on Wi-Fi, test the 5 GHz band instead of 2.4 GHz.")
        actions.append("Restart your local router/modem to clear transient routing buffers.")
        what_not_to_do.append("Don't call your ISP yet—the measurements prove packet drops are happening right inside your home network before reaching the ISP.")

    # Pattern B: Upstream / ISP Routing & Peering Issue
    elif (loss >= 2.0 or jitter >= 20.0 or avg_ping > 90.0) and (gw_latency <= 5.0 and gw_loss == 0):
        primary_issue = "Upstream ISP or Carrier Routing Congestion"
        status_reason = f"Local router is healthy ({gw_latency:.1f}ms, 0% loss), but external route shows {loss:.1f}% loss and {jitter:.1f}ms jitter."
        evidence.append(f"Local gateway responds at ~{gw_latency:.1f}ms with 0% loss (Local network is healthy).")
        evidence.append(f"External connection drops {loss:.1f}% of packets with {jitter:.1f}ms jitter.")
        causes.append("ISP routing congestion or suboptimal transit node between your ISP and the game's datacenter.")
        causes.append("Upstream line degradation or regional carrier node overload.")
        actions.append("Test running the game on a temporary mobile 5G hotspot to verify if the issue is ISP-specific.")
        actions.append("Check if your game client supports selecting an alternative server region with cleaner routing.")
        actions.append("If loss persists across multiple games, contact your ISP with traceroute evidence.")
        what_not_to_do.append("Don't upgrade your router or replace local cables; the test proves your local home network is completely stable.")

    # Pattern C: Latency Jitter / Bufferbloat with low packet loss
    elif jitter > 18.0 and loss < 2.0:
        primary_issue = "Micro-Stutter Latency Variance (Jitter)"
        status_reason = f"Average ping is acceptable ({avg_ping:.1f}ms), but delay variance ({jitter:.1f}ms jitter) causes frame stutters."
        evidence.append(f"Ping fluctuates between {active_target.min_ms:.1f}ms and {active_target.max_ms:.1f}ms.")
        evidence.append(f"Jitter is {jitter:.1f}ms (ideal is <10ms for competitive gaming).")
        causes.append("Active background uploads/downloads saturating line capacity (bufferbloat).")
        causes.append("Periodic background Windows updates, cloud sync, or discord video streams.")
        actions.append("Close background launchers (Steam, Epic, Torrent clients, OneDrive/Google Drive sync).")
        actions.append("Enable QoS (Quality of Service) on your router to prioritize gaming packets.")
        actions.append("Lock frame rate or network tickrate in game settings if available.")
        what_not_to_do.append("Don't confuse average ping with stability. Even with 45ms average ping, high jitter will cause rubberbanding.")

    # Pattern D: DNS Resolution Delay
    elif dns and dns.latency_ms > 85.0:
        primary_issue = "Elevated DNS Resolution Delay"
        status_reason = f"DNS lookup took {dns.latency_ms:.1f}ms. In-game ping is fine, but matchmaking and login can feel sluggish."
        evidence.append(f"DNS lookup for {dns.test_domain} took {dns.latency_ms:.1f}ms.")
        causes.append("Slow or unoptimized ISP default DNS recursive resolver.")
        actions.append("Configure fast gaming DNS servers on your network adapter (e.g. Cloudflare 1.1.1.1 or Google 8.8.8.8).")
        what_not_to_do.append("Don't expect changing DNS to lower your in-game ping—DNS only affects domain name lookups and matchmaking startup.")

    # Pattern E: High Bandwidth but Poor Latency
    if speed and speed.download_mbps and speed.download_mbps > 50.0 and (status in ["unstable", "critical"]):
        what_not_to_do.append(f"Don't buy a faster internet speed plan. Your measured download speed is already {speed.download_mbps:.0f} Mbps. Gaming requires low latency and zero loss, not massive bandwidth.")

    # Stable connection defaults
    if status == "stable":
        primary_issue = "Optimal Gaming Connection"
        status_reason = f"Ping ({avg_ping:.1f}ms), jitter ({jitter:.1f}ms), and loss ({loss:.1f}%) are well within competitive thresholds."
        evidence.append(f"Ping is {avg_ping:.1f}ms with low jitter ({jitter:.1f}ms).")
        evidence.append(f"Zero packet loss detected to gateway and target.")
        causes.append("Clean routing, healthy local network, and low congestion.")
        actions.append("Your connection is tournament-ready. No action needed.")
        what_not_to_do.append("Avoid installing so-called 'ping booster' optimizer software, which often causes background conflicts.")

    return {
        "status": status,
        "status_reason": status_reason,
        "primary_issue": primary_issue,
        "evidence": evidence,
        "possible_causes": causes,
        "recommended_actions": actions[:5],
        "what_not_to_do": what_not_to_do[:3],
        "confidence": "high" if active_target.packets_received >= 8 else "medium"
    }
