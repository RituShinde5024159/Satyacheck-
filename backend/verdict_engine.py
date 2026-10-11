"""
SatyaCheck – Gemini-powered verdict validation layer.

Given a claim string and a list of real search results, this module asks
Gemini to compare the claim against the actual retrieved snippets and return
a structured verdict.

Critical constraints:
- The LLM is given the actual search snippets; it does NOT invent URLs/dates.
- The model returns JSON only; any prose is rejected.
- An API failure, parse error, or ambiguous result defaults to "Cannot confirm".
- A SearchProviderError is never interpreted as "False".
"""

from __future__ import annotations

import json
import logging
import os

from .evidence_retriever import SearchResult

logger = logging.getLogger(__name__)


VERDICT_PROMPT = """\
You are a strict fact-checking engine. You are given:
1. A factual CLAIM to evaluate.
2. A list of EVIDENCE PASSAGES retrieved from real web sources.

Your task is to return a single JSON object with this exact schema:

{{
  "verdict": "<one of: Verified | False | Outdated | Partly supported | Cannot confirm>",
  "evidenceQuality": "<one of: Strong | Limited | Conflicting | Absent>",
  "explanation": "<plain-language reasoning, 1-3 sentences, no invented facts>",
  "supportedDetails": ["<detail that matches evidence>", ...],
  "mismatches": [
    {{
      "field": "<aspect name>",
      "claimValue": "<what claim says>",
      "evidenceValue": "<what evidence says>",
      "explanation": "<short note>"
    }},
    ...
  ],
  "temporalNote": "<note on date/timeframe relevance or 'No temporal discrepancy identified.'>",
  "isExpired": <true | false>,
  "safeAbstentionReason": "<null | reason string if Cannot confirm>"
}}

Rules:
- Use ONLY the evidence passages below to justify the verdict.
- Do NOT invent, fabricate, or hallucinate any facts, URLs, or dates.
- If evidence is absent or inconclusive, use "Cannot confirm" + evidenceQuality "Absent" or "Limited".
- A search provider failure does NOT make a claim False — use "Cannot confirm".
- Return ONLY valid JSON. No markdown, no prose.

CLAIM:
{claim}

EVIDENCE PASSAGES ({count} results):
{evidence}

Return only the JSON object.
"""


def _format_evidence(results: list[SearchResult]) -> str:
    if not results:
        return "(No evidence passages were retrieved.)"
    lines = []
    for i, r in enumerate(results, 1):
        lines.append(
            f"[{i}] Title: {r.title}\n"
            f"    URL: {r.url}\n"
            f"    Published: {r.published_date or 'Unknown'}\n"
            f"    Snippet: {r.snippet or '(no snippet)'}"
        )
    return "\n\n".join(lines)


def _get_model():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None
    try:
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash-latest")
        return genai.GenerativeModel(model_name)
    except Exception as exc:
        logger.warning("Verdict engine Gemini init failed: %s", exc)
        return None


def _safe_abstention(claim: str, reason: str) -> dict:
    return {
        "verdict": "Cannot confirm",
        "evidenceQuality": "Absent",
        "explanation": f"Insufficient evidence to evaluate: {claim[:120]}.",
        "supportedDetails": [],
        "mismatches": [],
        "temporalNote": "No temporal information available.",
        "isExpired": False,
        "safeAbstentionReason": reason,
    }


async def validate_claim(claim: str, evidence: list[SearchResult]) -> dict:
    """
    Use Gemini to compare *claim* against *evidence* and return a verdict dict.

    If Gemini is unavailable or returns unusable output, falls back to safe
    abstention ("Cannot confirm", evidenceQuality "Absent").
    """
    model = _get_model()
    if model is None:
        return _safe_abstention(claim, "GEMINI_API_KEY is not configured.")

    evidence_text = _format_evidence(evidence)
    prompt = VERDICT_PROMPT.format(
        claim=claim.strip(),
        count=len(evidence),
        evidence=evidence_text,
    )

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.0,
                "max_output_tokens": 1024,
            },
        )
        raw = response.text.strip()

        # Strip markdown fences
        if raw.startswith("```"):
            lines = raw.split("\n")
            raw = "\n".join(
                line for line in lines if not line.strip().startswith("```")
            )

        result = json.loads(raw)

        # Validate required fields
        required = {"verdict", "evidenceQuality", "explanation", "temporalNote", "isExpired"}
        if not required.issubset(result.keys()):
            raise ValueError(f"Missing fields: {required - result.keys()}")

        # Coerce lists
        result.setdefault("supportedDetails", [])
        result.setdefault("mismatches", [])
        result.setdefault("safeAbstentionReason", None)

        # Validate verdict is one of the 5 allowed
        allowed_verdicts = {"Verified", "False", "Outdated", "Partly supported", "Cannot confirm"}
        if result["verdict"] not in allowed_verdicts:
            logger.warning("Gemini returned invalid verdict %r; defaulting to Cannot confirm", result["verdict"])
            result["verdict"] = "Cannot confirm"
            result["evidenceQuality"] = "Absent"
            result["safeAbstentionReason"] = "Verdict normalisation fallback."

        return result

    except json.JSONDecodeError as exc:
        logger.error("Verdict JSON parse error: %s", exc)
        return _safe_abstention(claim, f"Verdict engine returned unparsable response: {exc}")
    except Exception as exc:
        logger.error("Verdict engine error: %s", exc)
        return _safe_abstention(claim, f"Verdict engine error: {exc}")
