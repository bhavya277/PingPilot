import asyncio
import time
import httpx
from typing import Tuple, Optional
from ..models.schemas import SpeedEstimate

SPEED_TEST_URLS = [
    "https://speed.cloudflare.com/__down?bytes=5000000", # 5MB chunk
    "https://telemetry.fast.com/speedtest/sample",
]

async def estimate_speed() -> SpeedEstimate:
    """
    Lightweight, non-intrusive bandwidth probe using HTTP chunk streaming.
    Calculates download throughput in Mbps within 2-3 seconds without hogging network.
    """
    download_mbps: Optional[float] = None
    latency_overhead: Optional[float] = None
    
    timeout = httpx.Timeout(5.0, connect=3.0)
    
    async with httpx.AsyncClient(timeout=timeout, verify=False) as client:
        for url in SPEED_TEST_URLS:
            try:
                start_connect = time.perf_counter()
                async with client.stream("GET", url) as response:
                    if response.status_code != 200:
                        continue
                    latency_overhead = round((time.perf_counter() - start_connect) * 1000.0, 2)
                    
                    bytes_received = 0
                    start_transfer = time.perf_counter()
                    
                    async for chunk in response.aiter_bytes(chunk_size=16384):
                        bytes_received += len(chunk)
                        # Stop once we have transferred at least 3MB or 2.5 seconds have elapsed
                        elapsed = time.perf_counter() - start_transfer
                        if bytes_received >= 3_000_000 or elapsed > 2.5:
                            break
                            
                    transfer_time = time.perf_counter() - start_transfer
                    if transfer_time > 0 and bytes_received > 0:
                        # Bits per second / 1_000_000 = Mbps
                        bits = bytes_received * 8
                        download_mbps = round(bits / transfer_time / 1_000_000.0, 1)
                        break
            except Exception:
                continue

    if download_mbps is not None:
        return SpeedEstimate(
            tested=True,
            download_mbps=download_mbps,
            upload_mbps=round(download_mbps * 0.25, 1), # Estimated standard ratio if upload probe skipped
            latency_overhead_ms=latency_overhead,
            test_method="cloudflare_edge_chunk"
        )
    else:
        return SpeedEstimate(
            tested=False,
            download_mbps=None,
            upload_mbps=None,
            latency_overhead_ms=None,
            test_method="unavailable"
        )
