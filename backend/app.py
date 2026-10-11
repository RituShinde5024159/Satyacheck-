"""
SatyaCheck – FastAPI application entry point.

Endpoints:
  GET  /api/health           → service status
  POST /api/verify/text      → text / WhatsApp forward verification
  POST /api/verify/url       → public URL verification (fetches page first)
  POST /api/verify/image     → OCR text extraction + verification (placeholder)
  POST /api/verify/pdf       → PDF text extraction + verification (placeholder)
  GET  /api/reports/{id}     → report retrieval (in-memory store for this session)

All responses follow the VerificationReport schema defined in models.py.
CORS is enabled for localhost dev (Vite on :5173) and the configured FRONTEND_URL.
"""

from __future__ import annotations

import logging
import os
import uuid
from typing import Optional

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .models import (
    HealthResponse,
    SupportedLanguage,
    VerificationReport,
    VerifyTextRequest,
    VerifyUrlRequest,
)
from .pipeline import run_text_verification
from .evidence_retriever import is_search_configured
from .claim_extractor import is_gemini_configured

load_dotenv()   # load .env from cwd (backend/ or project root)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── In-memory report store (session-scoped) ───────────────────────────────────
# For a production deployment, replace with a database.
_report_store: dict[str, VerificationReport] = {}

# ── App factory ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="SatyaCheck Verification API",
    version="1.0.0",
    description="Claim extraction and evidence-grounded fact-checking backend.",
)

_allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
if os.getenv("FRONTEND_URL"):
    _allowed_origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    search_status = "connected" if is_search_configured() else "disconnected"
    gemini_status = "configured" if is_gemini_configured() else "not configured"
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        search_engine=search_status,
    )


# ── Text verification ──────────────────────────────────────────────────────────

@app.post("/api/verify/text", response_model=VerificationReport)
async def verify_text(request: VerifyTextRequest) -> VerificationReport:
    """
    Verify raw text: WhatsApp forward, social media post, or political statement.
    Raises 503 if GEMINI_API_KEY is not set.
    """
    try:
        report = await run_text_verification(
            text=request.text,
            language=request.language,
            input_mode="text",
        )
    except RuntimeError as exc:
        # Missing API key or unrecoverable configuration problem
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected pipeline error for text submission")
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}") from exc

    _report_store[report.id] = report
    return report


# ── URL verification ───────────────────────────────────────────────────────────

@app.post("/api/verify/url", response_model=VerificationReport)
async def verify_url(request: VerifyUrlRequest) -> VerificationReport:
    """
    Fetch the target public URL, extract its text, then run the pipeline.
    """
    # Validate scheme
    if not request.url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")

    # Fetch the page
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            resp = await client.get(
                request.url,
                headers={"User-Agent": "SatyaCheck/1.0 (fact-check bot; +https://satyacheck.in)"},
            )
        if resp.status_code >= 400:
            raise HTTPException(
                status_code=422,
                detail=f"Target URL returned HTTP {resp.status_code}. Cannot retrieve content.",
            )
        page_text = resp.text[:12000]   # cap at ~12 KB to avoid enormous contexts
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Target URL did not respond within 15 seconds.")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Could not reach target URL: {exc}")

    # Strip obvious HTML tags (basic clean — no beautifulsoup dependency needed here)
    import re
    clean_text = re.sub(r"<[^>]+>", " ", page_text)
    clean_text = re.sub(r"\s{2,}", " ", clean_text).strip()

    if len(clean_text) < 50:
        raise HTTPException(
            status_code=422,
            detail="Could not extract readable text from the provided URL.",
        )

    try:
        report = await run_text_verification(
            text=clean_text[:6000],    # keep context window reasonable
            language=request.language,
            input_mode="url",
            source_url=request.url,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected pipeline error for URL submission")
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}") from exc

    _report_store[report.id] = report
    return report


# ── Image verification (OCR placeholder) ──────────────────────────────────────

@app.post("/api/verify/image", response_model=VerificationReport)
async def verify_image(
    file: UploadFile = File(...),
    language: str = Form("en"),
) -> VerificationReport:
    """
    Image / screenshot verification.
    Currently: accepts the file and verifies the filename + form text as context.
    Full OCR (e.g. via Gemini Vision) is a follow-up phase.
    """
    if language not in ("en", "hi", "mr"):
        raise HTTPException(status_code=400, detail="Unsupported language.")

    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported image type: {file.content_type}")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image exceeds 10 MB limit.")

    # Phase 1: treat filename + metadata as text context; OCR to follow
    context = f"Image submission: {file.filename}. Content type: {file.content_type}."
    try:
        report = await run_text_verification(
            text=context,
            language=language,  # type: ignore[arg-type]
            input_mode="image",
            source_file_name=file.filename,
            source_file_size=len(contents),
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    _report_store[report.id] = report
    return report


# ── PDF verification (text extraction placeholder) ─────────────────────────────

@app.post("/api/verify/pdf", response_model=VerificationReport)
async def verify_pdf(
    file: UploadFile = File(...),
    language: str = Form("en"),
) -> VerificationReport:
    """
    PDF document verification.
    Currently: reads file, verifies metadata. Full PDF text extraction is a follow-up.
    """
    if language not in ("en", "hi", "mr"):
        raise HTTPException(status_code=400, detail="Unsupported language.")

    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="PDF exceeds 15 MB limit.")

    context = f"PDF document submission: {file.filename}."
    try:
        report = await run_text_verification(
            text=context,
            language=language,  # type: ignore[arg-type]
            input_mode="pdf",
            source_file_name=file.filename,
            source_file_size=len(contents),
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    _report_store[report.id] = report
    return report


# ── Report retrieval ───────────────────────────────────────────────────────────

@app.get("/api/reports/{report_id}", response_model=VerificationReport)
async def get_report(report_id: str) -> VerificationReport:
    report = _report_store.get(report_id)
    if report is None:
        raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")
    return report
