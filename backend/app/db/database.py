import os
import aiosqlite
from ..config import settings

async def init_db():
    """
    Initializes SQLite database and tables for local diagnostic history.
    """
    db_path = settings.SQLITE_DB_PATH
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    async with aiosqlite.connect(db_path) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS diagnostics (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                game TEXT NOT NULL,
                target_host TEXT,
                target_ip TEXT,
                status TEXT NOT NULL,
                status_reason TEXT,
                avg_ping_ms REAL,
                jitter_ms REAL,
                packet_loss_percent REAL,
                gateway_latency_ms REAL,
                dns_latency_ms REAL,
                primary_issue TEXT,
                is_demo INTEGER DEFAULT 0,
                full_data_json TEXT NOT NULL
            )
        """)
        await db.commit()

async def get_db_connection():
    db_path = settings.SQLITE_DB_PATH
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    return await aiosqlite.connect(db_path)
