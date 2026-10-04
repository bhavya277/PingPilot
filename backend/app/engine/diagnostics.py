import asyncio
import uuid
import socket
from datetime import datetime
from typing import AsyncGenerator, Dict, Any, Optional

from ..config import settings
from ..models.schemas import DiagnosticRunRequest, DiagnosticResult, PingStats, RouteInfo
from .ping import measure_ping
from .gateway import detect_default_gateway, test_gateway
from .dns_test import test_dns_resolution
from .traceroute import run_traceroute
from .speed_test import estimate_speed
from .heuristics import evaluate_heuristics
from ..ai.ollama_client import analyze_with_ollama
from ..demo_data import get_demo_result
from ..db.repository import save_diagnostic

async def execute_diagnostics_stream(req: DiagnosticRunRequest) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Executes real network diagnostics step-by-step and yields real-time progress events.
    Each progress event corresponds to an actual network operation.
    """
    if req.is_demo:
        yield {"step": "demo_init", "message": "Loading demo scenario data...", "percent": 20}
        await asyncio.sleep(0.3)
        yield {"step": "demo_eval", "message": "Simulating local AI reasoning...", "percent": 70}
        await asyncio.sleep(0.4)
        result = get_demo_result(req.demo_scenario or "wifi_jitter")
        if req.game:
            result.game = req.game
        await save_diagnostic(result)
        yield {"step": "completed", "message": "Diagnosis complete (Demo Mode)", "percent": 100, "result": result.model_dump()}
        return

    # Real execution:
    diag_id = f"diag-{uuid.uuid4().hex[:8]}"
    start_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Step 1: Detect Network Interface
    yield {"step": "detecting_interface", "message": "Detecting active network adapter...", "percent": 10}
    gw_ip, iface = await detect_default_gateway()

    # Step 2: Test Local Gateway (Router)
    yield {"step": "testing_gateway", "message": f"Testing local router ({gw_ip or 'Default Gateway'})...", "percent": 25}
    gateway_info = await test_gateway()

    # Step 3: Measuring Internet Latency (Public reference e.g. 1.1.1.1)
    yield {"step": "measuring_internet", "message": f"Measuring internet baseline ({settings.PUBLIC_REFERENCE_HOST})...", "percent": 40}
    internet_stats = await measure_ping(settings.PUBLIC_REFERENCE_HOST, count=settings.PING_SAMPLES_COUNT)

    # Step 4: Measuring Game Server Target
    target_host = req.custom_host
    target_region = None
    target_port = req.custom_port or 443

    if not target_host:
        preset = settings.GAME_PRESETS.get(req.game, settings.GAME_PRESETS["Valorant"])
        target_host = preset["host"]
        target_region = preset.get("region")
        target_port = preset.get("port", 443)

    yield {"step": "measuring_game_server", "message": f"Testing {req.game} server latency & jitter ({target_host})...", "percent": 55}
    game_stats = await measure_ping(target_host, count=settings.PING_SAMPLES_COUNT, fallback_port=target_port)

    # Step 5: Testing DNS Resolution
    yield {"step": "testing_dns", "message": f"Testing DNS query response time...", "percent": 70}
    dns_info = await test_dns_resolution(settings.DNS_TEST_DOMAIN)

    # Step 6: Route Analysis / Traceroute (optional toggle)
    route_info = RouteInfo(available=False, target=target_host, hops=[])
    if req.run_traceroute:
        yield {"step": "checking_route", "message": f"Analyzing network hops to {target_host}...", "percent": 82}
        route_info = await run_traceroute(target_host, max_hops=settings.TRACEROUTE_MAX_HOPS)

    # Step 7: Bandwidth / Speed Estimation
    speed_info = None
    if req.run_speed_test:
        yield {"step": "testing_speed", "message": "Probing download bandwidth...", "percent": 90}
        speed_info = await estimate_speed()

    # Step 8: Deterministic Heuristic Evaluation
    heuristic_data = evaluate_heuristics(
        gateway=gateway_info,
        internet=internet_stats,
        game_server=game_stats,
        dns=dns_info,
        speed=speed_info
    )

    # Step 9: Send to Local Ollama AI Model
    yield {"step": "generating_ai", "message": f"Querying local AI model ({settings.OLLAMA_MODEL})...", "percent": 95}
    
    diagnostic_dict = {
        "game": req.game,
        "target_host": target_host,
        "gateway": {
            "ip": gateway_info.ip,
            "latency_ms": gateway_info.latency_ms,
            "packet_loss_percent": gateway_info.packet_loss_percent,
            "reachable": gateway_info.reachable
        },
        "internet": {
            "avg_ms": internet_stats.avg_ms,
            "min_ms": internet_stats.min_ms,
            "max_ms": internet_stats.max_ms,
            "jitter_ms": internet_stats.jitter_ms,
            "packet_loss_percent": internet_stats.packet_loss_percent
        },
        "game_server": {
            "avg_ms": game_stats.avg_ms,
            "min_ms": game_stats.min_ms,
            "max_ms": game_stats.max_ms,
            "jitter_ms": game_stats.jitter_ms,
            "packet_loss_percent": game_stats.packet_loss_percent
        },
        "dns": {
            "latency_ms": dns_info.latency_ms,
            "success": dns_info.success
        },
        "route": {
            "total_hops": route_info.total_hops,
            "timeouts": route_info.timeouts
        },
        "speed": {
            "download_mbps": speed_info.download_mbps if speed_info else None
        }
    }

    ai_result = await analyze_with_ollama(diagnostic_dict, heuristic_data)

    final_result = DiagnosticResult(
        id=diag_id,
        timestamp=start_time,
        game=req.game,
        target_host=target_host,
        target_ip=game_stats.target_ip,
        target_region=target_region,
        gateway=gateway_info,
        internet=internet_stats,
        game_server=game_stats,
        dns=dns_info,
        route=route_info,
        speed=speed_info,
        status=heuristic_data["status"],
        status_reason=heuristic_data["status_reason"],
        heuristic_primary_issue=heuristic_data["primary_issue"],
        ai_analysis=ai_result,
        is_demo=False
    )

    # Persist in local SQLite
    await save_diagnostic(final_result)

    yield {
        "step": "completed",
        "message": "Diagnosis complete!",
        "percent": 100,
        "result": final_result.model_dump()
    }
