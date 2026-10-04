import asyncio
import platform
import re
import socket
import statistics
import time
from typing import List, Tuple, Optional
from ..models.schemas import PingStats

"""
JITTER CALCULATION METHODOLOGY (RFC 3550 Standard):
In network communications and gaming, packet jitter is the statistical variance in packet transit delay.
PingPilot computes jitter using the standard RFC 3550 mean absolute difference of consecutive packet delays:

    Jitter = (1 / (N - 1)) * Sum_{i=1}^{N-1} |Delay_i - Delay_{i-1}|

Where:
- N is the number of successfully received ping samples (N >= 2).
- Delay_i is the round-trip latency measured for packet i in milliseconds.

If only 1 packet is received, jitter is 0.0 ms.
If packet loss is 100%, jitter is marked 0.0 ms.
"""

WINDOWS_PING_REGEX = re.compile(r"(?:time[=<]\s*(\d+(?:\.\d+)?)\s*ms)|(?:<1ms)", re.IGNORECASE)
LINUX_PING_REGEX = re.compile(r"time=(\d+(?:\.\d+)?)\s*ms", re.IGNORECASE)

async def run_icmp_ping(target: str, count: int = 10, timeout_ms: int = 1500) -> Tuple[List[float], int, int]:
    """
    Executes native OS ping with safe argument arrays (no shell=True) to avoid command injection.
    Returns (samples_list_ms, packets_sent, packets_received).
    """
    os_name = platform.system().lower()
    
    if os_name == "windows":
        args = ["ping", "-n", str(count), "-w", str(timeout_ms), target]
    else:
        timeout_sec = max(1, timeout_ms // 1000)
        args = ["ping", "-c", str(count), "-W", str(timeout_sec), target]
        
    try:
        proc = await asyncio.create_subprocess_exec(
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=max(15, count * (timeout_ms / 1000) + 5))
        output = stdout.decode("utf-8", errors="ignore")
    except Exception:
        return [], count, 0

    samples: List[float] = []
    
    for line in output.splitlines():
        if os_name == "windows":
            if "<1ms" in line.lower() or "time<1ms" in line.lower():
                samples.append(0.8)
                continue
            match = WINDOWS_PING_REGEX.search(line)
            if match and match.group(1):
                try:
                    samples.append(float(match.group(1)))
                except ValueError:
                    pass
        else:
            match = LINUX_PING_REGEX.search(line)
            if match and match.group(1):
                try:
                    samples.append(float(match.group(1)))
                except ValueError:
                    pass

    packets_sent = count
    packets_received = len(samples)
    return samples, packets_sent, packets_received

async def run_tcp_ping(target: str, port: int = 443, count: int = 8, timeout_sec: float = 1.2) -> Tuple[List[float], int, int]:
    """
    TCP Handshake Ping Fallback:
    Used when ICMP is blocked by strict local firewalls or NAT.
    Measures TCP SYN-ACK round-trip time directly.
    """
    samples: List[float] = []
    packets_sent = count

    for _ in range(count):
        start = time.perf_counter()
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout_sec)
        try:
            # We connect to measure round-trip SYN/ACK
            await asyncio.get_event_loop().run_in_executor(None, sock.connect, (target, port))
            latency = (time.perf_counter() - start) * 1000.0
            samples.append(round(latency, 2))
        except (socket.timeout, ConnectionRefusedError, OSError):
            # A connection refused still indicates packet arrival (RST response)
            latency = (time.perf_counter() - start) * 1000.0
            if latency < (timeout_sec * 1000.0):
                samples.append(round(latency, 2))
        finally:
            try:
                sock.close()
            except Exception:
                pass
        await asyncio.sleep(0.08)

    packets_received = len(samples)
    return samples, packets_sent, packets_received

def calculate_rfc3550_jitter(samples: List[float]) -> float:
    """
    Calculates RFC 3550 mean absolute difference of consecutive packet delays.
    """
    if len(samples) < 2:
        return 0.0
    differences = [abs(samples[i] - samples[i - 1]) for i in range(1, len(samples))]
    return round(statistics.mean(differences), 2)

async def measure_ping(target: str, count: int = 10, timeout_ms: int = 1500, fallback_port: int = 443) -> PingStats:
    """
    Measures latency, jitter, and packet loss using ICMP ping with TCP handshake fallback.
    """
    # Resolve target IP if domain
    target_ip = None
    try:
        target_ip = socket.gethostbyname(target)
    except Exception:
        pass

    method_used = "icmp"
    samples, sent, received = await run_icmp_ping(target, count=count, timeout_ms=timeout_ms)

    # If ICMP completely failed or was blocked, attempt TCP probe fallback
    if received == 0 and fallback_port:
        tcp_samples, tcp_sent, tcp_received = await run_tcp_ping(target, port=fallback_port, count=count)
        if tcp_received > 0:
            samples = tcp_samples
            sent = tcp_sent
            received = tcp_received
            method_used = "tcp_handshake_fallback"

    packet_loss = 0.0
    if sent > 0:
        packet_loss = round(((sent - received) / sent) * 100.0, 1)

    min_ms = round(min(samples), 2) if samples else 0.0
    max_ms = round(max(samples), 2) if samples else 0.0
    avg_ms = round(statistics.mean(samples), 2) if samples else 0.0
    median_ms = round(statistics.median(samples), 2) if samples else 0.0
    jitter_ms = calculate_rfc3550_jitter(samples)

    return PingStats(
        target=target,
        target_ip=target_ip,
        min_ms=min_ms,
        max_ms=max_ms,
        avg_ms=avg_ms,
        median_ms=median_ms,
        jitter_ms=jitter_ms,
        packet_loss_percent=packet_loss,
        packets_sent=sent,
        packets_received=received,
        samples=samples,
        method_used=method_used
    )
