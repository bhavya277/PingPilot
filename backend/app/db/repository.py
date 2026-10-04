import json
from typing import List, Optional
from .database import get_db_connection
from ..models.schemas import DiagnosticResult, DiagnosticHistorySummary

async def save_diagnostic(result: DiagnosticResult) -> str:
    db = await get_db_connection()
    try:
        avg_ping = result.game_server.avg_ms if result.game_server else result.internet.avg_ms
        jitter = result.game_server.jitter_ms if result.game_server else result.internet.jitter_ms
        loss = result.game_server.packet_loss_percent if result.game_server else result.internet.packet_loss_percent
        gw_lat = result.gateway.latency_ms
        dns_lat = result.dns.latency_ms
        issue = result.ai_analysis.primary_issue if result.ai_analysis else result.heuristic_primary_issue

        await db.execute("""
            INSERT OR REPLACE INTO diagnostics (
                id, timestamp, game, target_host, target_ip, status,
                status_reason, avg_ping_ms, jitter_ms, packet_loss_percent,
                gateway_latency_ms, dns_latency_ms, primary_issue, is_demo, full_data_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            result.id,
            result.timestamp,
            result.game,
            result.target_host,
            result.target_ip,
            result.status,
            result.status_reason,
            avg_ping,
            jitter,
            loss,
            gw_lat,
            dns_lat,
            issue,
            1 if result.is_demo else 0,
            result.model_dump_json()
        ))
        await db.commit()
        return result.id
    finally:
        await db.close()

async def list_diagnostics(limit: int = 50) -> List[DiagnosticHistorySummary]:
    db = await get_db_connection()
    try:
        cursor = await db.execute("""
            SELECT id, timestamp, game, status, avg_ping_ms, jitter_ms,
                   packet_loss_percent, gateway_latency_ms, dns_latency_ms, primary_issue, is_demo
            FROM diagnostics
            ORDER BY timestamp DESC
            LIMIT ?
        """, (limit,))
        rows = await cursor.fetchall()
        
        results = []
        for r in rows:
            results.append(DiagnosticHistorySummary(
                id=r[0],
                timestamp=r[1],
                game=r[2],
                status=r[3],
                avg_ping_ms=r[4] or 0.0,
                jitter_ms=r[5] or 0.0,
                packet_loss_percent=r[6] or 0.0,
                gateway_latency_ms=r[7],
                dns_latency_ms=r[8] or 0.0,
                primary_issue=r[9] or "Normal Connection",
                is_demo=bool(r[10])
            ))
        return results
    finally:
        await db.close()

async def get_diagnostic_by_id(diag_id: str) -> Optional[DiagnosticResult]:
    db = await get_db_connection()
    try:
        cursor = await db.execute("SELECT full_data_json FROM diagnostics WHERE id = ?", (diag_id,))
        row = await cursor.fetchone()
        if row and row[0]:
            return DiagnosticResult.model_validate_json(row[0])
        return None
    finally:
        await db.close()
