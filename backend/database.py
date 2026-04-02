import asyncpg
import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/jobscreener")

_pool = None

async def get_pool():
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(DATABASE_URL)
    return _pool

async def init_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS screening_results (
                id SERIAL PRIMARY KEY,
                candidate_name TEXT,
                match_score INTEGER,
                summary TEXT,
                strengths JSONB,
                gaps JSONB,
                recommendation TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)

async def save_result(result: dict):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO screening_results
            (candidate_name, match_score, summary, strengths, gaps, recommendation)
            VALUES ($1, $2, $3, $4, $5, $6)
        """,
            result.get("candidate_name", "Unknown"),
            result.get("match_score", 0),
            result.get("summary", ""),
            json.dumps(result.get("strengths", [])),
            json.dumps(result.get("gaps", [])),
            result.get("recommendation", "No Hire")
        )

async def get_all_results():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT id, candidate_name, match_score, summary,
                   strengths, gaps, recommendation,
                   created_at::text as created_at
            FROM screening_results
            ORDER BY created_at DESC
        """)
        return [dict(r) for r in rows]

async def clear_all():
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM screening_results")
