import asyncio
import platform
import re
from typing import List, Optional
from ..models.schemas import RouteInfo, TracerouteHop

WINDOWS_HOP_REGEX = re.compile(
    r"^\s*(\d+)\s+([<\d\s*]+(?:ms|\*))\s+([<\d\s*]+(?:ms|\*))\s+([<\d\s*]+(?:ms|\*))\s+([0-9a-fA-F.:]+|Request timed out\.)",
    re.IGNORECASE
)

MS_REGEX = re.compile(r"(\d+(?:\.\d+)?)\s*ms", re.IGNORECASE)

async def run_traceroute(target: str, max_hops: int = 12, timeout_ms: int = 800) -> RouteInfo:
    """
    Executes a fast, bounded traceroute without reverse DNS lookup (-d) for speed.
    Gracefully handles platforms, timeouts, and permission restrictions.
    Never hangs or causes backend failures.
    """
    os_name = platform.system().lower()
    hops: List[TracerouteHop] = []
    timeouts_count = 0

    if os_name == "windows":
        # -d: Do not resolve addresses to hostnames (fast)
        # -h: Maximum number of hops
        # -w: Timeout in milliseconds
        args = ["tracert", "-d", "-h", str(max_hops), "-w", str(timeout_ms), target]
    else:
        timeout_sec = max(1, timeout_ms // 1000)
        args = ["traceroute", "-n", "-m", str(max_hops), "-w", str(timeout_sec), target]

    try:
        proc = await asyncio.create_subprocess_exec(
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        # Max wallclock execution bounded to 15 seconds
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=16.0)
        output = stdout.decode("utf-8", errors="ignore")

        for line in output.splitlines():
            line = line.strip()
            if not line:
                continue

            # Look for lines starting with hop number
            parts = line.split()
            if parts and parts[0].isdigit():
                try:
                    hop_num = int(parts[0])
                except ValueError:
                    continue

                if "Request timed out" in line or (parts[-1] == "*" and "*" in parts):
                    timeouts_count += 1
                    hops.append(TracerouteHop(
                        hop=hop_num,
                        ip=None,
                        host=None,
                        latency_ms=None,
                        timed_out=True
                    ))
                    continue

                # Find IP (usually the last element if not timed out)
                ip = parts[-1] if ("." in parts[-1] or ":" in parts[-1]) else None
                
                # Extract latencies from this line
                ms_matches = MS_REGEX.findall(line)
                latencies = []
                for m in ms_matches:
                    try:
                        latencies.append(float(m))
                    except ValueError:
                        pass
                
                avg_latency = round(sum(latencies) / len(latencies), 2) if latencies else None

                hops.append(TracerouteHop(
                    hop=hop_num,
                    ip=ip,
                    host=ip,
                    latency_ms=avg_latency,
                    timed_out=False
                ))

        return RouteInfo(
            available=True,
            target=target,
            total_hops=len(hops),
            timeouts=timeouts_count,
            hops=hops
        )

    except asyncio.TimeoutError:
        return RouteInfo(
            available=True,
            target=target,
            total_hops=len(hops),
            timeouts=timeouts_count,
            hops=hops,
            error_message="Traceroute reached maximum execution time limit (bounded for safety)"
        )
    except Exception as e:
        return RouteInfo(
            available=False,
            target=target,
            total_hops=0,
            timeouts=0,
            hops=[],
            error_message=f"Traceroute unavailable on host system: {str(e)}"
        )
