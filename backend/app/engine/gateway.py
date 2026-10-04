import asyncio
import platform
import re
import socket
from typing import Optional, Tuple
from ..models.schemas import GatewayInfo
from .ping import measure_ping

async def detect_default_gateway() -> Tuple[Optional[str], str]:
    """
    Detects the local default gateway IP and interface name.
    Works reliably on Windows, Linux, and macOS.
    """
    os_name = platform.system().lower()
    gateway_ip = None
    interface_name = "Default Network Adapter"

    if os_name == "windows":
        try:
            # Route print 0.0.0.0 gives the default gateway IP directly
            proc = await asyncio.create_subprocess_exec(
                "route", "print", "0.0.0.0",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=3.0)
            output = stdout.decode("utf-8", errors="ignore")
            
            # Format: Network Destination Netmask Gateway Interface Metric
            # 0.0.0.0          0.0.0.0      192.168.1.1     192.168.1.100     25
            for line in output.splitlines():
                parts = line.strip().split()
                if len(parts) >= 4 and parts[0] == "0.0.0.0" and parts[1] == "0.0.0.0":
                    gateway_ip = parts[2]
                    interface_name = f"Interface {parts[3]}"
                    break
        except Exception:
            pass

        # Fallback to ipconfig if route print did not find it
        if not gateway_ip:
            try:
                proc = await asyncio.create_subprocess_exec(
                    "ipconfig",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=3.0)
                output = stdout.decode("utf-8", errors="ignore")
                gw_regex = re.compile(r"Default Gateway[ .]*:\s*([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)", re.IGNORECASE)
                match = gw_regex.search(output)
                if match:
                    gateway_ip = match.group(1)
            except Exception:
                pass
    else:
        # Linux / Unix: ip route show default
        try:
            proc = await asyncio.create_subprocess_exec(
                "ip", "route", "show", "default",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=3.0)
            output = stdout.decode("utf-8", errors="ignore")
            # default via 192.168.1.1 dev eth0
            parts = output.strip().split()
            if "via" in parts:
                idx = parts.index("via")
                if idx + 1 < len(parts):
                    gateway_ip = parts[idx + 1]
            if "dev" in parts:
                idx = parts.index("dev")
                if idx + 1 < len(parts):
                    interface_name = parts[idx + 1]
        except Exception:
            pass

    return gateway_ip, interface_name

async def test_gateway() -> GatewayInfo:
    """
    Identifies and measures latency and packet loss to the local default gateway.
    Crucial for differentiating local Wi-Fi/router issues from ISP/upstream issues.
    """
    gateway_ip, interface_name = await detect_default_gateway()
    
    if not gateway_ip:
        # If not detected, try common router IP 192.168.1.1 or 192.168.0.1
        gateway_ip = "192.168.1.1"

    # Ping gateway with 5 samples
    ping_result = await measure_ping(gateway_ip, count=5, timeout_ms=1000, fallback_port=80)
    
    reachable = ping_result.packets_received > 0
    avg_latency = ping_result.avg_ms if reachable else None

    return GatewayInfo(
        ip=gateway_ip,
        interface_name=interface_name,
        latency_ms=avg_latency,
        packet_loss_percent=ping_result.packet_loss_percent,
        reachable=reachable,
        samples=ping_result.samples
    )
