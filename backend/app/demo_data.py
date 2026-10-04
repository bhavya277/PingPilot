import uuid
from datetime import datetime
from typing import Dict, Any, List
from .models.schemas import (
    DiagnosticResult, GatewayInfo, PingStats, DnsInfo, 
    RouteInfo, TracerouteHop, SpeedEstimate, AiAnalysisResult
)

DEMO_SCENARIOS = {
    "wifi_jitter": {
        "title": "Local Wi-Fi Congestion (Packet Drops at Gateway)",
        "game": "Valorant",
        "target_host": "162.249.72.1",
        "target_region": "Global Backbone (Riot Direct)",
        "gateway": GatewayInfo(
            ip="192.168.1.1",
            interface_name="Wi-Fi (802.11ac 2.4GHz)",
            latency_ms=19.4,
            packet_loss_percent=6.0,
            reachable=True,
            samples=[2.1, 18.5, 45.2, 12.0, 19.4]
        ),
        "internet": PingStats(
            target="1.1.1.1",
            target_ip="1.1.1.1",
            min_ms=28.4,
            max_ms=96.1,
            avg_ms=54.2,
            median_ms=48.0,
            jitter_ms=22.8,
            packet_loss_percent=6.0,
            packets_sent=10,
            packets_received=9,
            samples=[32.1, 88.4, 45.2, 96.1, 28.4, 42.1, 55.0, 48.0, 52.2]
        ),
        "game_server": PingStats(
            target="162.249.72.1",
            target_ip="162.249.72.1",
            min_ms=34.1,
            max_ms=112.5,
            avg_ms=62.8,
            median_ms=55.0,
            jitter_ms=26.4,
            packet_loss_percent=8.0,
            packets_sent=10,
            packets_received=9,
            samples=[34.1, 95.0, 52.0, 112.5, 45.0, 55.0, 68.0, 49.0, 54.6]
        ),
        "dns": DnsInfo(
            test_domain="google.com",
            system_dns_server="192.168.1.1",
            latency_ms=28.5,
            resolved_ip="142.250.190.46",
            success=True
        ),
        "route": RouteInfo(
            available=True,
            target="162.249.72.1",
            total_hops=7,
            timeouts=1,
            hops=[
                TracerouteHop(hop=1, ip="192.168.1.1", latency_ms=18.5, timed_out=False),
                TracerouteHop(hop=2, ip="10.42.0.1", latency_ms=22.1, timed_out=False),
                TracerouteHop(hop=3, ip="172.16.8.1", latency_ms=26.4, timed_out=False),
                TracerouteHop(hop=4, ip="None", latency_ms=None, timed_out=True),
                TracerouteHop(hop=5, ip="162.249.72.1", latency_ms=61.2, timed_out=False),
            ]
        ),
        "speed": SpeedEstimate(
            tested=True,
            download_mbps=78.5,
            upload_mbps=18.2,
            latency_overhead_ms=38.4,
            test_method="cloudflare_edge_chunk"
        ),
        "status": "critical",
        "status_reason": "Local router latency is elevated (19.4ms) with 6.0% packet loss directly at the Wi-Fi gateway.",
        "heuristic_primary_issue": "Local Wi-Fi or Router Congestion",
        "ai_analysis": AiAnalysisResult(
            overall_status="critical",
            primary_issue="Local Wi-Fi Congestion & Packet Drops",
            confidence="high",
            evidence=[
                "Local gateway (192.168.1.1) shows 19.4 ms average latency with 6.0% packet loss directly inside your home network.",
                "Game server ping spikes up to 112.5 ms with 26.4 ms jitter.",
                "Measured download bandwidth is 78.5 Mbps, confirming bandwidth is not the culprit."
            ],
            possible_causes=[
                "High 2.4 GHz Wi-Fi interference from neighboring routers or household electronics.",
                "Physical distance or obstacles between gaming PC and wireless router.",
                "Local router processor bufferbloat from other devices on the LAN."
            ],
            recommended_actions=[
                "Switch to a direct Cat6 Ethernet cable instead of Wi-Fi for immediate zero-jitter play.",
                "If wired is impossible, connect strictly to the 5 GHz Wi-Fi band and move closer to the router.",
                "Reboot the home router to flush internal queue buffers."
            ],
            what_not_to_do=[
                "Don't call your ISP or pay for a higher Mbps tier—the packet loss is occurring right inside your room before reaching the ISP."
            ],
            summary="Your connection is dropping packets right at your home router. The local gateway is spiking to 19.4ms with 6% loss, causing heavy rubberbanding in Valorant even though your overall internet speed is 78 Mbps.",
            model_used="llama3.2 (Simulated in Demo Mode)",
            ai_available=True
        )
    },
    "isp_packet_loss": {
        "title": "Upstream ISP Peering Congestion (Local Network Healthy)",
        "game": "Counter-Strike 2",
        "target_host": "162.254.192.1",
        "target_region": "Valve SDR Relay",
        "gateway": GatewayInfo(
            ip="192.168.1.1",
            interface_name="Ethernet (1000 Mbps)",
            latency_ms=1.4,
            packet_loss_percent=0.0,
            reachable=True,
            samples=[1.2, 1.4, 1.5, 1.3, 1.4]
        ),
        "internet": PingStats(
            target="1.1.1.1",
            target_ip="1.1.1.1",
            min_ms=18.2,
            max_ms=24.5,
            avg_ms=20.1,
            median_ms=19.8,
            jitter_ms=2.1,
            packet_loss_percent=0.0,
            packets_sent=10,
            packets_received=10,
            samples=[19.2, 20.4, 19.8, 18.2, 24.5, 20.1, 19.5, 21.0, 19.2, 19.8]
        ),
        "game_server": PingStats(
            target="162.254.192.1",
            target_ip="162.254.192.1",
            min_ms=48.2,
            max_ms=115.4,
            avg_ms=64.5,
            median_ms=58.2,
            jitter_ms=18.4,
            packet_loss_percent=4.2,
            packets_sent=12,
            packets_received=11,
            samples=[51.2, 58.2, 115.4, 48.2, 62.0, 78.4, 52.0, 56.1, 64.0, 60.2, 59.1]
        ),
        "dns": DnsInfo(
            test_domain="google.com",
            system_dns_server="1.1.1.1",
            latency_ms=14.2,
            resolved_ip="142.250.190.46",
            success=True
        ),
        "route": RouteInfo(
            available=True,
            target="162.254.192.1",
            total_hops=8,
            timeouts=2,
            hops=[
                TracerouteHop(hop=1, ip="192.168.1.1", latency_ms=1.3, timed_out=False),
                TracerouteHop(hop=2, ip="100.64.0.1", latency_ms=9.2, timed_out=False),
                TracerouteHop(hop=3, ip="64.125.14.8", latency_ms=38.4, timed_out=False),
                TracerouteHop(hop=4, ip="None", latency_ms=None, timed_out=True),
                TracerouteHop(hop=5, ip="162.254.192.1", latency_ms=64.5, timed_out=False),
            ]
        ),
        "speed": SpeedEstimate(
            tested=True,
            download_mbps=185.0,
            upload_mbps=42.0,
            latency_overhead_ms=18.2,
            test_method="cloudflare_edge_chunk"
        ),
        "status": "unstable",
        "status_reason": "Local gateway is pristine (1.4ms, 0% loss), but external route to Valve SDR relay drops 4.2% packets with 18.4ms jitter.",
        "heuristic_primary_issue": "Upstream ISP or Carrier Routing Congestion",
        "ai_analysis": AiAnalysisResult(
            overall_status="unstable",
            primary_issue="Upstream Carrier Peering Degradation",
            confidence="high",
            evidence=[
                "Local router responds cleanly at 1.4 ms with 0% packet loss (Home setup is 100% verified healthy).",
                "Public Cloudflare baseline is 20.1 ms with 0% loss.",
                "Valve CS2 relay server exhibits 4.2% packet loss and 18.4 ms jitter along hop 4."
            ],
            possible_causes=[
                "ISP regional transit node congestion connecting to the gaming network backbone.",
                "Suboptimal BGP routing path selected by ISP peering partners."
            ],
            recommended_actions=[
                "Test playing a match on a temporary 5G mobile hotspot to bypass your fixed ISP's degraded route.",
                "Use in-game CS2 settings to specify an alternate SDR data center if available.",
                "Provide the traceroute hop timeout timestamps to your ISP support."
            ],
            what_not_to_do=[
                "Don't change your router, replace Ethernet cables, or tweak Windows network adapters—your local LAN is completely healthy."
            ],
            summary="Your home network and Ethernet cable are performing flawlessly at 1.4ms. The packet loss and jitter are occurring further upstream on your ISP's transit route to Valve's servers.",
            model_used="llama3.2 (Simulated in Demo Mode)",
            ai_available=True
        )
    },
    "flawless_fiber": {
        "title": "Tournament-Ready Fiber Connection",
        "game": "Apex Legends",
        "target_host": "159.153.64.1",
        "target_region": "EA Relay Cluster",
        "gateway": GatewayInfo(
            ip="192.168.1.1",
            interface_name="Gigabit Ethernet",
            latency_ms=0.8,
            packet_loss_percent=0.0,
            reachable=True,
            samples=[0.8, 0.8, 0.9, 0.7, 0.8]
        ),
        "internet": PingStats(
            target="1.1.1.1",
            target_ip="1.1.1.1",
            min_ms=9.1,
            max_ms=11.4,
            avg_ms=10.2,
            median_ms=10.0,
            jitter_ms=0.8,
            packet_loss_percent=0.0,
            packets_sent=10,
            packets_received=10,
            samples=[10.1, 9.8, 10.4, 9.1, 11.4, 10.0, 9.9, 10.2, 10.1, 10.3]
        ),
        "game_server": PingStats(
            target="159.153.64.1",
            target_ip="159.153.64.1",
            min_ms=14.2,
            max_ms=16.8,
            avg_ms=15.1,
            median_ms=15.0,
            jitter_ms=1.1,
            packet_loss_percent=0.0,
            packets_sent=10,
            packets_received=10,
            samples=[15.2, 14.8, 15.4, 14.2, 16.8, 15.0, 14.9, 15.1, 15.0, 15.3]
        ),
        "dns": DnsInfo(
            test_domain="google.com",
            system_dns_server="1.1.1.1",
            latency_ms=8.4,
            resolved_ip="142.250.190.46",
            success=True
        ),
        "route": RouteInfo(
            available=True,
            target="159.153.64.1",
            total_hops=6,
            timeouts=0,
            hops=[
                TracerouteHop(hop=1, ip="192.168.1.1", latency_ms=0.8, timed_out=False),
                TracerouteHop(hop=2, ip="10.20.0.1", latency_ms=2.4, timed_out=False),
                TracerouteHop(hop=3, ip="159.153.64.1", latency_ms=15.1, timed_out=False),
            ]
        ),
        "speed": SpeedEstimate(
            tested=True,
            download_mbps=480.0,
            upload_mbps=220.0,
            latency_overhead_ms=9.1,
            test_method="cloudflare_edge_chunk"
        ),
        "status": "stable",
        "status_reason": "Exceptional low-latency fiber: 15.1ms average ping, 1.1ms jitter, 0% packet loss.",
        "heuristic_primary_issue": "Optimal Gaming Connection",
        "ai_analysis": AiAnalysisResult(
            overall_status="stable",
            primary_issue="Optimal Competitive Gaming Connection",
            confidence="high",
            evidence=[
                "Ultra-low 15.1 ms average ping to EA servers.",
                "Sub-millisecond jitter (1.1 ms) and 0.0% packet loss across all hops.",
                "Gateway latency is steady at 0.8 ms."
            ],
            possible_causes=[
                "Direct low-hop fiber optic connection with optimal routing."
            ],
            recommended_actions=[
                "Your connection is tournament-grade. You are ready to compete without any networking bottlenecks."
            ],
            what_not_to_do=[
                "Avoid third-party 'network optimizer' or 'TCP booster' utilities that risk destabilizing your connection."
            ],
            summary="Your connection is in pristine condition. With 15ms ping, 1.1ms jitter, and 0% loss, your network delivers maximum hit-registration accuracy.",
            model_used="llama3.2 (Simulated in Demo Mode)",
            ai_available=True
        )
    }
}

def get_demo_result(scenario_key: str = "wifi_jitter") -> DiagnosticResult:
    scenario = DEMO_SCENARIOS.get(scenario_key, DEMO_SCENARIOS["wifi_jitter"])
    
    return DiagnosticResult(
        id=f"demo-{uuid.uuid4().hex[:8]}",
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        game=scenario["game"],
        target_host=scenario["target_host"],
        target_region=scenario.get("target_region"),
        gateway=scenario["gateway"],
        internet=scenario["internet"],
        game_server=scenario["game_server"],
        dns=scenario["dns"],
        route=scenario["route"],
        speed=scenario["speed"],
        status=scenario["status"],
        status_reason=scenario["status_reason"],
        heuristic_primary_issue=scenario["heuristic_primary_issue"],
        ai_analysis=scenario["ai_analysis"],
        is_demo=True,
        demo_scenario=scenario_key
    )
