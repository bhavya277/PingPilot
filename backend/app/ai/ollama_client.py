import json
import logging
import httpx
from typing import Tuple, List, Optional
from ..config import settings
from ..models.schemas import AiAnalysisResult
from .prompts import SYSTEM_PROMPT, build_diagnostic_prompt

logger = logging.getLogger(__name__)

async def check_ollama_status() -> Tuple[bool, List[str]]:
    """
    Checks if the local Ollama instance is running and retrieves installed open-weight models.
    """
    url = f"{settings.OLLAMA_HOST.rstrip('/')}/api/tags"
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name", "") for m in data.get("models", []) if m.get("name")]
                return True, models
    except Exception:
        pass
    return False, []

async def analyze_with_ollama(diagnostic_data: dict, heuristic_data: dict) -> AiAnalysisResult:
    """
    Sends structured diagnostic metrics to locally running Ollama model.
    Falls back cleanly and gracefully if Ollama is not running or model is not pulled.
    """
    is_online, installed_models = await check_ollama_status()

    if not is_online:
        return AiAnalysisResult(
            overall_status=heuristic_data["status"],
            primary_issue=heuristic_data["primary_issue"],
            confidence=heuristic_data.get("confidence", "medium"),
            evidence=heuristic_data["evidence"],
            possible_causes=heuristic_data["possible_causes"],
            recommended_actions=heuristic_data["recommended_actions"],
            what_not_to_do=heuristic_data["what_not_to_do"],
            summary="Network diagnostics completed. AI analysis unavailable because the local AI model is not currently running. Start Ollama and try AI analysis again.",
            model_used=None,
            ai_available=False
        )

    # Determine which model to invoke
    target_model = settings.OLLAMA_MODEL
    # If the configured model isn't in installed models, but there are others, pick the first one
    if installed_models and target_model not in installed_models:
        # Check if version tag is omitted (e.g. "llama3.2" matches "llama3.2:latest")
        matching = [m for m in installed_models if m.startswith(target_model)]
        if matching:
            target_model = matching[0]
        else:
            target_model = installed_models[0]

    user_prompt = build_diagnostic_prompt(diagnostic_data)
    url = f"{settings.OLLAMA_HOST.rstrip('/')}/api/chat"

    payload = {
        "model": target_model,
        "format": "json",
        "stream": False,
        "options": {
            "temperature": 0.2, # Low temperature for factual, deterministic reasoning
        },
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                body = resp.json()
                content = body.get("message", {}).get("content", "").strip()
                
                # Parse JSON output from model
                # Sometimes models enclose in ```json ... ```
                if content.startswith("```"):
                    lines = content.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    content = "\n".join(lines).strip()
                
                parsed = json.loads(content)
                
                return AiAnalysisResult(
                    overall_status=parsed.get("overall_status", heuristic_data["status"]),
                    primary_issue=parsed.get("primary_issue", heuristic_data["primary_issue"]),
                    confidence=parsed.get("confidence", "high"),
                    evidence=parsed.get("evidence", heuristic_data["evidence"]),
                    possible_causes=parsed.get("possible_causes", heuristic_data["possible_causes"]),
                    recommended_actions=parsed.get("recommended_actions", heuristic_data["recommended_actions"]),
                    what_not_to_do=parsed.get("what_not_to_do", heuristic_data["what_not_to_do"]),
                    summary=parsed.get("summary", heuristic_data["status_reason"]),
                    model_used=target_model,
                    ai_available=True,
                    raw_response=content
                )
    except Exception as e:
        logger.warning(f"Ollama execution failed or timed out: {e}")

    # Fallback to deterministic evaluation with notice
    return AiAnalysisResult(
        overall_status=heuristic_data["status"],
        primary_issue=heuristic_data["primary_issue"],
        confidence=heuristic_data.get("confidence", "medium"),
        evidence=heuristic_data["evidence"],
        possible_causes=heuristic_data["possible_causes"],
        recommended_actions=heuristic_data["recommended_actions"],
        what_not_to_do=heuristic_data["what_not_to_do"],
        summary=f"Diagnostics evaluated via local deterministic engine. (Ollama model '{target_model}' did not respond within timeout).",
        model_used=target_model,
        ai_available=False
    )
