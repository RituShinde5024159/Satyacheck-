"""
SatyaCheck – Gemini claim-extraction service.

Uses the google-generativeai SDK to decompose raw text into atomic, falsifiable
claims.  The model is instructed to return a strict JSON array — it never invents
sources, URLs, or publication dates.  All it produces is a list of normalised
claim strings that will then be fed to the evidence-retrieval layer.

Environment variables required:
    GEMINI_API_KEY   – Google AI Studio / Vertex API key
    GEMINI_MODEL     – (optional) defaults to gemini-1.5-flash-latest
"""

from __future__ import annotations

import json
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)


def _get_client():
    """Lazy-initialise the Gemini client; returns None if unconfigured."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None, None
    try:
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash-latest")
        model = genai.GenerativeModel(model_name)
        return genai, model
    except Exception as exc:
        logger.warning("Gemini client init failed: %s", exc)
        return None, None


CLAIM_EXTRACTION_PROMPT = """\
You are a structured fact-checking assistant. Your task is to decompose the
following text into a JSON array of individual, falsifiable factual claims.

Rules:
- Each element must be a single, precise, testable assertion.
- Do NOT invent, paraphrase creatively, or add new facts.
- Do NOT include opinions, predictions, or rhetorical questions.
- Return ONLY a valid JSON array of strings. No markdown, no prose.
- Maximum 8 claims. If the text contains no falsifiable claims, return [].

Text to decompose:
\"\"\"
{text}
\"\"\"

Return only the JSON array.
"""


async def extract_claims(text: str) -> list[str]:
    """
    Call Gemini to extract atomic falsifiable claims from *text*.

    Returns a (possibly empty) list of claim strings, or raises
    RuntimeError if the API key is missing or the call fails.
    """
    _, model = _get_client()
    if model is None:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    prompt = CLAIM_EXTRACTION_PROMPT.format(text=text.strip())

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.0,
                "max_output_tokens": 1024,
            },
        )
        raw = response.text.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            lines = raw.split("\n")
            raw = "\n".join(
                line for line in lines if not line.strip().startswith("```")
            )

        claims: list[str] = json.loads(raw)
        if not isinstance(claims, list):
            raise ValueError("Gemini did not return a JSON array.")
        # Filter to strings only, trim whitespace, drop empties
        return [c.strip() for c in claims if isinstance(c, str) and c.strip()]

    except json.JSONDecodeError as exc:
        logger.error("Gemini returned non-JSON: %s — raw: %r", exc, raw[:300])
        raise RuntimeError(f"Gemini returned unparsable JSON: {exc}") from exc
    except Exception as exc:
        logger.error("Gemini claim extraction error: %s", exc)
        raise RuntimeError(f"Gemini API error: {exc}") from exc


def is_gemini_configured() -> bool:
    """Return True iff a non-empty GEMINI_API_KEY is present."""
    return bool(os.getenv("GEMINI_API_KEY", "").strip())
