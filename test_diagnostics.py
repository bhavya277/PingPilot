import sys
import asyncio

sys.path.insert(0, 'backend')
from app.engine.gateway import detect_default_gateway, test_gateway
from app.engine.ping import measure_ping
from app.engine.dns_test import test_dns_resolution

async def test_live():
    gw_ip, iface = await detect_default_gateway()
    print(f"Detected Gateway: {gw_ip} on {iface}")
    gw_info = await test_gateway()
    print(f"Gateway Test: latency={gw_info.latency_ms}ms loss={gw_info.packet_loss_percent}%")
    
    ping_res = await measure_ping("1.1.1.1", count=4)
    print(f"Internet Ping: avg={ping_res.avg_ms}ms jitter={ping_res.jitter_ms}ms loss={ping_res.packet_loss_percent}% samples={ping_res.samples}")
    
    dns_res = await test_dns_resolution("google.com")
    print(f"DNS Test: latency={dns_res.latency_ms}ms ip={dns_res.resolved_ip}")

if __name__ == "__main__":
    asyncio.run(test_live())
