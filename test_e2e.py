import sys
import json
import httpx

BASE_URL = "http://127.0.0.1:8000/api"

def test_full_e2e():
    print("=== [1] Testing /api/system ===")
    r = httpx.get(f"{BASE_URL}/system")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    sys_info = r.json()
    print("System Info:", json.dumps(sys_info, indent=2))

    print("\n=== [2] Testing Demo Mode Diagnosis via /api/diagnostics/stream ===")
    demo_req = {
        "game": "Valorant",
        "is_demo": True,
        "demo_scenario": "wifi_jitter",
        "run_speed_test": True,
        "run_traceroute": True
    }
    with httpx.stream("POST", f"{BASE_URL}/diagnostics/stream", json=demo_req, timeout=30.0) as resp:
        assert resp.status_code == 200
        completed_demo = None
        for line in resp.iter_lines():
            if line.startswith("data: "):
                data = json.loads(line[6:])
                print(f"  Step: {data.get('step')} ({data.get('percent')}%) - {data.get('message')}")
                if data.get("step") == "completed":
                    completed_demo = data.get("result")
    
    assert completed_demo is not None, "Demo mode diagnosis failed to complete!"
    print("Demo Result Status:", completed_demo["status"])
    print("Demo AI Summary:", completed_demo["ai_analysis"]["summary"])
    print("Demo Evidence Count:", len(completed_demo["ai_analysis"]["evidence"]))
    print("Demo What To Try:", completed_demo["ai_analysis"]["recommended_actions"])

    print("\n=== [3] Testing Live Real Diagnostics via /api/diagnostics/stream ===")
    live_req = {
        "game": "Counter-Strike 2",
        "is_demo": False,
        "run_speed_test": False, # Keep speed test off for quick test
        "run_traceroute": False
    }
    with httpx.stream("POST", f"{BASE_URL}/diagnostics/stream", json=live_req, timeout=40.0) as resp:
        assert resp.status_code == 200
        completed_live = None
        for line in resp.iter_lines():
            if line.startswith("data: "):
                data = json.loads(line[6:])
                print(f"  Step: {data.get('step')} ({data.get('percent')}%) - {data.get('message')}")
                if data.get("step") == "completed":
                    completed_live = data.get("result")

    assert completed_live is not None, "Live diagnosis failed to complete!"
    print("\nLive Diagnostic Verified:")
    print("  Game:", completed_live["game"])
    print("  Target:", completed_live["target_host"], f"({completed_live.get('target_ip')})")
    print("  Status:", completed_live["status"])
    print("  Gateway Latency:", completed_live["gateway"]["latency_ms"], "ms")
    print("  Internet Ping Avg:", completed_live["internet"]["avg_ms"], "ms")
    print("  Internet Jitter (RFC 3550):", completed_live["internet"]["jitter_ms"], "ms")
    print("  Internet Packet Loss:", completed_live["internet"]["packet_loss_percent"], "%")
    print("  DNS Latency:", completed_live["dns"]["latency_ms"], "ms")
    print("  Heuristic Primary Issue:", completed_live["heuristic_primary_issue"])
    print("  AI Analysis Result:", completed_live["ai_analysis"]["primary_issue"])
    print("  AI Available (Ollama running?):", completed_live["ai_analysis"]["ai_available"])

    print("\n=== [4] Testing /api/history ===")
    r_hist = httpx.get(f"{BASE_URL}/history")
    assert r_hist.status_code == 200
    history = r_hist.json()
    print(f"History contains {len(history)} records:")
    for h in history[:3]:
        print(f"  - [{h['timestamp']}] {h['game']} -> {h['status']} | Ping: {h['avg_ping_ms']}ms | Loss: {h['packet_loss_percent']}% | Demo: {h['is_demo']}")

    print("\n=== [5] Testing /api/diagnostics/{id} ===")
    latest_id = history[0]["id"]
    r_detail = httpx.get(f"{BASE_URL}/diagnostics/{latest_id}")
    assert r_detail.status_code == 200
    detail = r_detail.json()
    assert detail["id"] == latest_id
    print("Retrieved Session Details successfully for ID:", latest_id)

    print("\nALL END-TO-END TESTS PASSED!")

if __name__ == "__main__":
    test_full_e2e()
