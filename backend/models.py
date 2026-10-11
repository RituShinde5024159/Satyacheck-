"""
SatyaCheck – Pydantic domain models.
These mirror the TypeScript types in src/types/index.ts exactly.
"""

from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field


# ── Core enumerations ─────────────────────────────────────────────────────────

Verdict = Literal["Verified", "False", "Outdated", "Partly supported", "Cannot confirm"]
EvidenceQuality = Literal["Strong", "Limited", "Conflicting", "Absent"]
InputMode = Literal["text", "image", "pdf", "url"]
SupportedLanguage = Literal["en", "hi", "mr"]
SourceStance = Literal["supports", "refutes", "partial", "inconclusive"]


# ── Request models ─────────────────────────────────────────────────────────────

class VerifyTextRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=8000,
                      description="Raw statement, forward, or message to verify.")
    language: SupportedLanguage = "en"


class VerifyUrlRequest(BaseModel):
    url: str = Field(..., description="Public HTTP/HTTPS URL of article or post.")
    language: SupportedLanguage = "en"


# ── Response / report models ───────────────────────────────────────────────────

class SourcePassage(BaseModel):
    id: str
    publisher: str
    url: str
    title: str
    publishedDate: Optional[str] = None
    lastUpdatedDate: Optional[str] = None
    passageText: str
    stance: SourceStance


class ClaimMismatch(BaseModel):
    field: str
    claimValue: str
    evidenceValue: str
    explanation: str


class ClaimDiff(BaseModel):
    supportedDetails: list[str] = Field(default_factory=list)
    mismatches: list[ClaimMismatch] = Field(default_factory=list)


class TemporalDetails(BaseModel):
    claimTimeframe: Optional[str] = None
    evidencePublishedDate: Optional[str] = None
    evidenceUpdatedDate: Optional[str] = None
    expiryDeadline: Optional[str] = None
    isExpired: bool = False
    temporalNote: str


class ExtractedClaim(BaseModel):
    id: str
    originalText: str
    normalizedClaim: str
    verdict: Verdict
    evidenceQuality: EvidenceQuality
    explanation: str
    diff: ClaimDiff
    temporal: TemporalDetails
    sources: list[SourcePassage] = Field(default_factory=list)
    safeAbstentionReason: Optional[str] = None


class VerificationReport(BaseModel):
    id: str
    submittedAt: str          # ISO date string YYYY-MM-DD
    inputMode: InputMode
    language: SupportedLanguage
    rawInput: str
    sourceFileName: Optional[str] = None
    sourceFileSize: Optional[int] = None
    sourceUrl: Optional[str] = None
    overallSummary: str
    claims: list[ExtractedClaim]
    isDemonstration: bool = False


# ── Health ─────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    search_engine: str
