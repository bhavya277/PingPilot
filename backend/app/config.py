import os
from pydantic_settings import BaseSettings
from typing import Dict, Any

class Settings(BaseSettings):
    APP_NAME: str = "PingPilot"
    VERSION: str = "1.0.0"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Ollama settings (configurable via environment variables)
    OLLAMA_HOST: str = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2")
    
    # Database
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", "backend/data/pingpilot.db")
    
    # Diagnostics settings
    PING_SAMPLES_COUNT: int = 10
    PING_TIMEOUT_MS: int = 1500
    TRACEROUTE_MAX_HOPS: int = 15
    TRACEROUTE_TIMEOUT_SEC: int = 12
    DNS_TEST_DOMAIN: str = "google.com"
    PUBLIC_REFERENCE_HOST: str = "1.1.1.1" # Cloudflare fast public resolver/edge
    
    # Presets for popular games
    GAME_PRESETS: Dict[str, Dict[str, Any]] = {
        "Valorant": {
            "name": "Valorant",
            "category": "Tactical FPS",
            "host": "162.249.72.1", # Riot Direct NA/Global backbone
            "port": 443,
            "region": "Global Backbone (Riot Direct)"
        },
        "Counter-Strike 2": {
            "name": "Counter-Strike 2",
            "category": "Tactical FPS",
            "host": "162.254.192.1", # Valve Steam Datagram Relay
            "port": 27015,
            "region": "Valve SDR Relay"
        },
        "Fortnite": {
            "name": "Fortnite",
            "category": "Battle Royale",
            "host": "qosping-aws-na-east-1.ol.epicgames.com", # Epic AWS QoS endpoint
            "port": 443,
            "region": "Epic AWS QoS"
        },
        "Apex Legends": {
            "name": "Apex Legends",
            "category": "Battle Royale",
            "host": "159.153.64.1", # EA Global Multiplay Relay
            "port": 443,
            "region": "EA Relay Cluster"
        },
        "COD Mobile": {
            "name": "COD Mobile",
            "category": "Mobile FPS",
            "host": "185.34.106.1", # Activision Blizzard Edge
            "port": 443,
            "region": "Activision Gateway"
        },
        "PUBG": {
            "name": "PUBG",
            "category": "Battle Royale",
            "host": "pubg-na.s3.amazonaws.com",
            "port": 443,
            "region": "Krafton AWS Edge"
        }
    }

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
