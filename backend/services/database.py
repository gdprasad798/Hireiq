import os
import asyncpg
from dotenv import load_dotenv
import json

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
                job_description TEXT NOT NULL,
                resume_text TEXT NOT NULL,
                score INTEGER,
                matched_skills TEXT,
                missing_skills TEXT,
                summary TEXT,
                recommendation VARCHAR(50),
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)

async def save_result(job_description: str, resume_text: str, result: dict):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO screening_results
                (job_description, resume_text, score, matched_skills, missing_skills, summary, recommendation)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
            job_description,
            resume_text,
            result.get("score", 0),
            json.dumps(result.get("matched_skills", [])),
            json.dumps(result.get("missing_skills", [])),
            result.get("summary", ""),
            result.get("recommendation", "")
        )

async def get_all_results():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT id, score, matched_skills, missing_skills,
                   summary, recommendation, created_at
            FROM screening_results
            ORDER BY created_at DESC
            LIMIT 50
        """)
        return [
            {
                "id": r["id"],
                "score": r["score"],
                "matched_skills": json.loads(r["matched_skills"]),
                "missing_skills": json.loads(r["missing_skills"]),
                "summary": r["summary"],
                "recommendation": r["recommendation"],
                "created_at": str(r["created_at"])
            }
            for r in rows
        ]
