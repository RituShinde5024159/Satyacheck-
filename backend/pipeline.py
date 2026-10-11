"""
SatyaCheck – Core verification pipeline.

Orchestrates:
  1. Claim extraction (Gemini)
  2. Evidence retrieval (Brave/Google CSE)
  3. Verdict validation (Gemini + real evidence)
  4. Report assembly

Error-handling contract:
- Missing GEMINI_API_KEY → RuntimeError propagated to router → 503
- Missing search credentials → each claim gets "Cannot confirm" / "Absent"
- Search provider timeout / 429 → claim gets "Cannot confirm" + reason
- Any other unexpected exception → claim gets "Cannot confirm" + reason
- An API failure is NEVER mapped to verdict "False"
"""

from __future__ import annotations

import logging
import uuid
from datetime import date
from typing import Optional

from .models import (
    ClaimDiff,
    ClaimMismatch,
    ExtractedClaim,
    EvidenceQuality,
    InputMode,
    SourcePassage,
    SupportedLanguage,
    TemporalDetails,
    VerificationReport,
    Verdict,
)
from .claim_extractor import extract_claims, is_gemini_configured
from .evidence_retriever import fetch_evidence, SearchProviderError, SearchResult, is_search_configured
from .verdict_engine import validate_claim

logger = logging.getLogger(__name__)


def _make_source_passages(results: list[SearchResult], claim_idx: int) -> list[SourcePassage]:
    """Convert raw SearchResult objects into typed SourcePassage records."""
    passages = []
    for i, r in enumerate(results, 1):
        passages.append(SourcePassage(
            id=f"src-{claim_idx}-{i}",
            publisher=r.publisher,
            url=r.url,
            title=r.title,
            publishedDate=r.published_date,
            lastUpdatedDate=None,
            passageText=r.snippet or "(No snippet returned by search provider)",
            stance="inconclusive",   # will be updated after verdict
        ))
    return passages


def _assign_stances(passages: list[SourcePassage], verdict: str) -> list[SourcePassage]:
    """
    Heuristically assign source stances based on overall verdict.
    The verdict engine may later refine these; this provides a sensible default.
    """
    stance_map = {
        "Verified": "supports",
        "False": "refutes",
        "Outdated": "partial",
        "Partly supported": "partial",
        "Cannot confirm": "inconclusive",
    }
    default_stance = stance_map.get(verdict, "inconclusive")
    for p in passages:
        p.stance = default_stance  # type: ignore[assignment]
    return passages


def _build_abstention_claim(
    original_text: str,
    claim_idx: int,
    reason: str,
) -> ExtractedClaim:
    """Build a safe-abstention ExtractedClaim when evidence cannot be retrieved."""
    return ExtractedClaim(
        id=f"claim-{claim_idx}",
        originalText=original_text,
        normalizedClaim=original_text,
        verdict="Cannot confirm",
        evidenceQuality="Absent",
        explanation=(
            "Evidence could not be retrieved for this assertion. "
            "SatyaCheck refrains from issuing a verdict without grounded evidence."
        ),
        diff=ClaimDiff(supportedDetails=[], mismatches=[]),
        temporal=TemporalDetails(
            isExpired=False,
            temporalNote="No temporal data available.",
        ),
        sources=[],
        safeAbstentionReason=reason,
    )


async def _process_single_claim(
    claim_text: str,
    claim_idx: int,
) -> ExtractedClaim:
    """
    Run the full evidence → verdict pipeline for one atomic claim.
    Never raises; always returns an ExtractedClaim (possibly Cannot confirm).
    """
    # Step 1: retrieve real evidence
    evidence: list[SearchResult] = []
    retrieval_error: Optional[str] = None

    try:
        evidence = await fetch_evidence(claim_text)
    except SearchProviderError as exc:
        retrieval_error = str(exc)
        logger.warning("Evidence retrieval failed for claim %d: %s", claim_idx, exc)
    except Exception as exc:
        retrieval_error = f"Unexpected retrieval error: {exc}"
        logger.error("Unexpected retrieval error for claim %d: %s", claim_idx, exc)

    if retrieval_error and not evidence:
        return _build_abstention_claim(claim_text, claim_idx, retrieval_error)

    # Step 2: validate with Gemini against real evidence
    verdict_data = await validate_claim(claim_text, evidence)

    # Step 3: assemble mismatches
    mismatches = [
        ClaimMismatch(
            field=m.get("field", "Unknown"),
            claimValue=m.get("claimValue", ""),
            evidenceValue=m.get("evidenceValue", ""),
            explanation=m.get("explanation", ""),
        )
        for m in verdict_data.get("mismatches", [])
    ]

    # Step 4: assemble sources with stances
    sources = _make_source_passages(evidence, claim_idx)
    sources = _assign_stances(sources, verdict_data["verdict"])

    return ExtractedClaim(
        id=f"claim-{claim_idx}",
        originalText=claim_text,
        normalizedClaim=claim_text,
        verdict=verdict_data["verdict"],
        evidenceQuality=verdict_data["evidenceQuality"],
        explanation=verdict_data["explanation"],
        diff=ClaimDiff(
            supportedDetails=verdict_data.get("supportedDetails", []),
            mismatches=mismatches,
        ),
        temporal=TemporalDetails(
            isExpired=verdict_data.get("isExpired", False),
            temporalNote=verdict_data.get("temporalNote", "No temporal information available."),
        ),
        sources=sources,
        safeAbstentionReason=verdict_data.get("safeAbstentionReason"),
    )


def _synthesise_overall_summary(claims: list[ExtractedClaim]) -> str:
    """Produce a plain-language summary from individual claim verdicts."""
    if not claims:
        return "No falsifiable claims were extracted from the submitted text."

    verdict_counts: dict[str, int] = {}
    for c in claims:
        verdict_counts[c.verdict] = verdict_counts.get(c.verdict, 0) + 1

    total = len(claims)
    parts = []
    for verdict, count in sorted(verdict_counts.items()):
        parts.append(f"{count}/{total} claim(s) returned '{verdict}'")

    if all(c.verdict == "Cannot confirm" for c in claims):
        return (
            "Verification was attempted but evidence was absent or insufficient for all claims. "
            "No verdict could be issued. "
            "This may indicate that search credentials are missing or that the claims involve "
            "very local, niche, or recently emerging information."
        )

    return "Verification complete. " + "; ".join(parts) + "."


async def run_text_verification(
    text: str,
    language: SupportedLanguage,
    input_mode: InputMode = "text",
    source_url: Optional[str] = None,
    source_file_name: Optional[str] = None,
    source_file_size: Optional[int] = None,
) -> VerificationReport:
    """
    Full pipeline: text → claims → evidence → verdicts → report.

    Raises RuntimeError if Gemini is not configured (caller returns HTTP 503).
    Never raises for search-provider failures; those become "Cannot confirm" claims.
    """
    if not is_gemini_configured():
        raise RuntimeError(
            "GEMINI_API_KEY environment variable is not set. "
            "The claim extraction service is unavailable."
        )

    # Extract atomic claims
    raw_claims = await extract_claims(text)

    if not raw_claims:
        # Gemini found no falsifiable claims in the text
        abstention_claim = ExtractedClaim(
            id="claim-1",
            originalText=text[:500],
            normalizedClaim=text[:500],
            verdict="Cannot confirm",
            evidenceQuality="Absent",
            explanation=(
                "No falsifiable factual claims were identified in the submitted text. "
                "SatyaCheck cannot evaluate opinions, predictions, or non-factual statements."
            ),
            diff=ClaimDiff(supportedDetails=[], mismatches=[]),
            temporal=TemporalDetails(
                isExpired=False,
                temporalNote="Not applicable.",
            ),
            sources=[],
            safeAbstentionReason="No falsifiable claims found in input.",
        )
        return VerificationReport(
            id=f"report-{uuid.uuid4().hex[:8]}",
            submittedAt=date.today().isoformat(),
            inputMode=input_mode,
            language=language,
            rawInput=text,
            sourceUrl=source_url,
            sourceFileName=source_file_name,
            sourceFileSize=source_file_size,
            overallSummary="No falsifiable factual claims were identified in the submitted text.",
            claims=[abstention_claim],
            isDemonstration=False,
        )

    # Process each claim concurrently would be ideal, but sequential is safe and simpler
    # for rate-limit compliance across search providers
    processed_claims: list[ExtractedClaim] = []
    for idx, claim_text in enumerate(raw_claims, 1):
        claim = await _process_single_claim(claim_text, idx)
        processed_claims.append(claim)

    overall_summary = _synthesise_overall_summary(processed_claims)

    return VerificationReport(
        id=f"report-{uuid.uuid4().hex[:8]}",
        submittedAt=date.today().isoformat(),
        inputMode=input_mode,
        language=language,
        rawInput=text,
        sourceUrl=source_url,
        sourceFileName=source_file_name,
        sourceFileSize=source_file_size,
        overallSummary=overall_summary,
        claims=processed_claims,
        isDemonstration=False,
    )
