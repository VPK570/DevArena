"""
Battle-Front API — FastAPI backend for competitive frontend challenges.
"""

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.logging_config import setup_logging
from routers import evaluate, solution, hint, explain

# ── Bootstrap ───────────────────────────────────────────────────────────────

load_dotenv()
setup_logging()

logger = logging.getLogger(__name__)

# ── App ─────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Battle-Front API",
    version="2.0.0",
    description="AI-powered evaluation backend for the Battle-Front coding arena.",
)

# ── CORS ────────────────────────────────────────────────────────────────────

_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────

app.include_router(evaluate.router, prefix="/api", tags=["evaluate"])
app.include_router(solution.router, prefix="/api", tags=["solution"])
app.include_router(hint.router, prefix="/api", tags=["hint"])
app.include_router(explain.router, prefix="/api", tags=["explain"])

# ── Health ──────────────────────────────────────────────────────────────────


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0", "model": "gemini-1.5-flash"}


# ── Startup check ──────────────────────────────────────────────────────────


@app.on_event("startup")
async def startup_check():
    if not os.environ.get("GEMINI_API_KEY"):
        logger.warning(
            "⚠️  GEMINI_API_KEY is not set. AI endpoints will fail. "
            "Get a key at https://aistudio.google.com"
        )
    else:
        logger.info("✅ GEMINI_API_KEY detected — AI endpoints are ready.")
    logger.info("🚀 Battle-Front API v2.0.0 started | origins=%s", allowed_origins)
