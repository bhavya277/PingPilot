import json
import platform
import socket
import psutil
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .config import settings
from .models.schemas import (
    DiagnosticRunRequest, DiagnosticResult, SystemInfoResponse,
    DiagnosticHistorySummary, AiAnalysisResult
)
from .db.database import init_db
from .db.repository import list_diagnostics, get_diagnostic_by_id, save_diagnostic
from .engine.diagnostics import execute_diagnostics_stream
from .engine.gateway import detect_default_gateway
from .ai.ollama_client import check_ollama_status, analyze_with_ollama
from .engine.heuristics import evaluate_heuristics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema on startup
    await init_db()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Local-first AI Network Diagnostic Co-Pilot for Gamers",
    lifespan=lifespan
)

# CORS middleware for local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION
    }

@app.get("/api/system", response_model=SystemInfoResponse)
async def get_system_info():
    """
    Returns operating system network configuration and local Ollama model status.
    """
    gw_ip, iface = await detect_default_gateway()
    ollama_online, models = await check_ollama_status()
    
    # Get local IP
    local_ip = "127.0.0.1"
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        pass

    return SystemInfoResponse(
        os_name=f"{platform.system()} {platform.release()}",
        hostname=socket.gethostname(),
        local_ip=local_ip,
        gateway_ip=gw_ip or "Auto-detected",
        active_interface=iface,
        ollama_online=ollama_online,
        ollama_host=settings.OLLAMA_HOST,
        configured_model=settings.OLLAMA_MODEL,
        available_models=models
    )

@app.get("/api/games")
async def get_supported_games():
    """
    Returns list of preset games with targeting info.
    """
    return settings.GAME_PRESETS

@app.post("/api/diagnostics/stream")
async def stream_diagnostics(req: DiagnosticRunRequest):
    """
    Server-Sent Events endpoint providing real-time progress for each diagnostic step.
    """
    async def event_generator():
        try:
            async for step_data in execute_diagnostics_stream(req):
                yield f"data: {json.dumps(step_data)}\n\n"
        except Exception as e:
            err = {"step": "error", "message": f"Diagnostic failed: {str(e)}", "percent": 100}
            yield f"data: {json.dumps(err)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.post("/api/diagnostics/run", response_model=DiagnosticResult)
async def run_diagnostics(req: DiagnosticRunRequest):
    """
    Executes network diagnosis and returns the final comprehensive result.
    """
    try:
        final_result = None
        async for step in execute_diagnostics_stream(req):
            if step.get("step") == "completed":
                final_result = step.get("result")
                break
        
        if not final_result:
            raise HTTPException(status_code=500, detail="Diagnostic execution failed to complete")
            
        return DiagnosticResult.model_validate(final_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostic error: {str(e)}")

@app.get("/api/diagnostics/{diag_id}", response_model=DiagnosticResult)
async def get_diagnostic(diag_id: str):
    res = await get_diagnostic_by_id(diag_id)
    if not res:
        raise HTTPException(status_code=404, detail="Diagnostic session not found")
    return res

@app.get("/api/history", response_model=list[DiagnosticHistorySummary])
async def get_history(limit: int = 50):
    return await list_diagnostics(limit=limit)

@app.post("/api/ai/analyze", response_model=AiAnalysisResult)
async def rerun_ai_analysis(payload: dict):
    """
    Allows re-running or requesting AI analysis on an existing diagnostic payload.
    """
    try:
        heuristics = evaluate_heuristics(
            gateway=payload.get("gateway"),
            internet=payload.get("internet"),
            game_server=payload.get("game_server"),
            dns=payload.get("dns"),
            speed=payload.get("speed")
        )
        return await analyze_with_ollama(payload, heuristics)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"AI analysis failed: {str(e)}")
