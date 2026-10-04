import asyncio
import time
import socket
from typing import Optional
from ..models.schemas import DnsInfo

async def test_dns_resolution(domain: str = "google.com") -> DnsInfo:
    """
    Measures DNS resolution latency and records resolved IP.
    Tests name resolution time which affects matchmaking and server discovery.
    """
    start_time = time.perf_counter()
    resolved_ip: Optional[str] = None
    success = False
    error_msg = None

    try:
        # Run socket gethostbyname asynchronously in thread pool
        loop = asyncio.get_event_loop()
        resolved_ip = await loop.run_in_executor(None, socket.gethostbyname, domain)
        success = True
    except Exception as e:
        error_msg = str(e)

    duration_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

    return DnsInfo(
        test_domain=domain,
        system_dns_server="System Default Resolver",
        latency_ms=duration_ms,
        resolved_ip=resolved_ip,
        success=success,
        error_message=error_msg
    )
