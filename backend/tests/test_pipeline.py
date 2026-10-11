"""
SatyaCheck – Backend test suite.

Tests cover:
  1. Supported claim (evidence → Verified)
  2. Contradicted claim (evidence → False)
  3. Insufficient evidence (→ Cannot confirm)
  4. Conflicting evidence (→ Partly supported / Conflicting quality)
  5. Missing API credentials (→ HTTP 503)
  6. Search-provider failure (→ Cannot confirm in claim, HTTP 200 in report)
  7. Invalid requests (→ HTTP 422)

External providers (Brave, Google CSE, Gemini) are mocked in all tests.
Mocks are ONLY used in the test suite — the live implementation never uses them.
"""

from __future__ import annotations

import json
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport


# ── App fixture ────────────────────────────────────────────────────────────────

@pytest.fixture()
def app():
    """Import the FastAPI app with a clean environment."""
    import importlib
    import backend.app as app_module
    return app_module.app


@pytest.fixture()
def transport(app):
    return ASGITransport(app=app)


# ── Helper: build a mock Gemini claim extraction response ─────────────────────

def _mock_gemini_claims(claims: list[str]):
    """Return a mock GenerativeModel that yields a JSON array of claims."""
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = json.dumps(claims)
    mock_model.generate_content.return_value = mock_response
    return mock_model


def _mock_gemini_verdict(verdict_dict: dict):
    """Return a mock GenerativeModel that yields a JSON verdict object."""
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = json.dumps(verdict_dict)
    mock_model.generate_content.return_value = mock_response
    return mock_model


VERIFIED_VERDICT = {
    "verdict": "Verified",
    "evidenceQuality": "Strong",
    "explanation": "Multiple credible sources corroborate this claim.",
    "supportedDetails": ["Claim is supported by official sources."],
    "mismatches": [],
    "temporalNote": "Evidence is current.",
    "isExpired": False,
    "safeAbstentionReason": None,
}

FALSE_VERDICT = {
    "verdict": "False",
    "evidenceQuality": "Strong",
    "explanation": "Evidence directly contradicts this claim.",
    "supportedDetails": [],
    "mismatches": [{"field": "Amount", "claimValue": "₹50,000", "evidenceValue": "₹2,500/month", "explanation": "Incorrect amount."}],
    "temporalNote": "Evidence is current.",
    "isExpired": False,
    "safeAbstentionReason": None,
}

CANNOT_CONFIRM_VERDICT = {
    "verdict": "Cannot confirm",
    "evidenceQuality": "Absent",
    "explanation": "Insufficient evidence to evaluate this claim.",
    "supportedDetails": [],
    "mismatches": [],
    "temporalNote": "No temporal information available.",
    "isExpired": False,
    "safeAbstentionReason": "Evidence absent across all retrieved sources.",
}

CONFLICTING_VERDICT = {
    "verdict": "Partly supported",
    "evidenceQuality": "Conflicting",
    "explanation": "Sources are divided; some support, some contradict.",
    "supportedDetails": ["Core entity exists."],
    "mismatches": [{"field": "Details", "claimValue": "X", "evidenceValue": "Y", "explanation": "Conflict."}],
    "temporalNote": "Mixed dates in sources.",
    "isExpired": False,
    "safeAbstentionReason": None,
}


MOCK_SEARCH_RESULTS = [
    {
        "url": "https://example.com/article",
        "title": "Test Article",
        "snippet": "This is a real snippet from the search API.",
        "publisher": "Example",
        "published_date": "2024-01-01",
    }
]


# ── Test 1: Supported claim → Verified ────────────────────────────────────────

@pytest.mark.asyncio
async def test_supported_claim_returns_verified(transport):
    """A claim with strong corroborating evidence receives Verified verdict."""
    from backend.evidence_retriever import SearchResult

    mock_results = [
        SearchResult(
            url="https://example.com/article",
            title="Test Article",
            snippet="This confirms the claim.",
            publisher="Example",
            published_date="2024-01-01",
        )
    ]

    with (
        patch("backend.pipeline.is_gemini_configured", return_value=True),
        patch("backend.pipeline.extract_claims", new_callable=AsyncMock, return_value=["The moon orbits the Earth."]),
        patch("backend.pipeline.fetch_evidence", new_callable=AsyncMock, return_value=mock_results),
        patch("backend.pipeline.validate_claim", new_callable=AsyncMock, return_value=VERIFIED_VERDICT),
    ):
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/api/verify/text", json={"text": "The moon orbits the Earth.", "language": "en"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["isDemonstration"] is False
    assert len(body["claims"]) >= 1
    claim = body["claims"][0]
    assert claim["verdict"] == "Verified"
    assert claim["evidenceQuality"] == "Strong"
    assert len(claim["sources"]) >= 1
    # Sources must have real URLs, not fabricated
    assert claim["sources"][0]["url"].startswith("http")


# ── Test 2: Contradicted claim → False ────────────────────────────────────────

@pytest.mark.asyncio
async def test_contradicted_claim_returns_false(transport):
    """A claim directly contradicted by retrieved evidence receives False verdict."""
    from backend.evidence_retriever import SearchResult

    mock_results = [
        SearchResult(
            url="https://ksb.gov.in",
            title="KSB Official Grant Rates",
            snippet="The stipend is ₹2,500/month, not ₹50,000.",
            publisher="Ksb",
            published_date="2025-01-01",
        )
    ]

    with (
        patch("backend.pipeline.is_gemini_configured", return_value=True),
        patch("backend.pipeline.extract_claims", new_callable=AsyncMock, return_value=["Government gives ₹50,000 to all students."]),
        patch("backend.pipeline.fetch_evidence", new_callable=AsyncMock, return_value=mock_results),
        patch("backend.pipeline.validate_claim", new_callable=AsyncMock, return_value=FALSE_VERDICT),
    ):
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/verify/text",
                json={"text": "Government gives ₹50,000 to all students immediately.", "language": "en"},
            )

    assert resp.status_code == 200
    body = resp.json()
    claim = body["claims"][0]
    assert claim["verdict"] == "False"
    assert len(claim["diff"]["mismatches"]) >= 1


# ── Test 3: Insufficient evidence → Cannot confirm ───────────────────────────

@pytest.mark.asyncio
async def test_insufficient_evidence_returns_cannot_confirm(transport):
    """When no relevant evidence is found, the report returns Cannot confirm."""
    # Return empty evidence list — simulates no results from search provider
    with (
        patch("backend.pipeline.is_gemini_configured", return_value=True),
        patch("backend.pipeline.extract_claims", new_callable=AsyncMock, return_value=["Ward 14 counters are closed next Monday."]),
        patch("backend.pipeline.fetch_evidence", new_callable=AsyncMock, return_value=[]),
        patch("backend.pipeline.validate_claim", new_callable=AsyncMock, return_value=CANNOT_CONFIRM_VERDICT),
    ):
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/verify/text",
                json={"text": "Ward 14 counters are closed next Monday.", "language": "en"},
            )

    assert resp.status_code == 200
    body = resp.json()
    claim = body["claims"][0]
    assert claim["verdict"] == "Cannot confirm"
    assert claim["evidenceQuality"] in ("Absent", "Limited")


# ── Test 4: Conflicting evidence → Partly supported / Conflicting ─────────────

@pytest.mark.asyncio
async def test_conflicting_evidence_returns_partly_supported(transport):
    """Conflicting evidence is represented honestly as Partly supported / Conflicting."""
    from backend.evidence_retriever import SearchResult

    mock_results = [
        SearchResult(url="https://a.com", title="Source A", snippet="Supports the claim.", publisher="A", published_date=None),
        SearchResult(url="https://b.com", title="Source B", snippet="Contradicts the claim.", publisher="B", published_date=None),
    ]

    with (
        patch("backend.pipeline.is_gemini_configured", return_value=True),
        patch("backend.pipeline.extract_claims", new_callable=AsyncMock, return_value=["Himalayan salt cures hypertension."]),
        patch("backend.pipeline.fetch_evidence", new_callable=AsyncMock, return_value=mock_results),
        patch("backend.pipeline.validate_claim", new_callable=AsyncMock, return_value=CONFLICTING_VERDICT),
    ):
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/verify/text",
                json={"text": "Himalayan salt cures hypertension in 14 days.", "language": "en"},
            )

    assert resp.status_code == 200
    body = resp.json()
    claim = body["claims"][0]
    assert claim["evidenceQuality"] == "Conflicting"
    assert claim["verdict"] in ("Partly supported", "Cannot confirm")


# ── Test 5: Missing API credentials → HTTP 503 ───────────────────────────────

@pytest.mark.asyncio
async def test_missing_gemini_key_returns_503(transport):
    """A missing GEMINI_API_KEY must return HTTP 503, not a demo fallback."""
    with patch("backend.pipeline.is_gemini_configured", return_value=False):
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/verify/text",
                json={"text": "The Earth is round and orbits the Sun.", "language": "en"},
            )

    assert resp.status_code == 503
    body = resp.json()
    assert "GEMINI_API_KEY" in body["detail"]


# ── Test 6: Search-provider failure → Cannot confirm (HTTP 200) ──────────────

@pytest.mark.asyncio
async def test_search_provider_failure_returns_cannot_confirm(transport):
    """
    A search API failure must NOT return HTTP 500 or be interpreted as False.
    The report should return HTTP 200 with verdict Cannot confirm.
    """
    from backend.evidence_retriever import SearchProviderError

    with (
        patch("backend.pipeline.is_gemini_configured", return_value=True),
        patch("backend.pipeline.extract_claims", new_callable=AsyncMock, return_value=["The Earth is flat."]),
        patch("backend.pipeline.fetch_evidence", new_callable=AsyncMock,
              side_effect=SearchProviderError("Brave Search: rate limit exceeded (429).")),
    ):
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/verify/text",
                json={"text": "The Earth is flat and the Sun orbits it.", "language": "en"},
            )

    assert resp.status_code == 200
    body = resp.json()
    claim = body["claims"][0]
    # Must NOT be False — provider failure is not evidence of falsity
    assert claim["verdict"] != "False"
    assert claim["verdict"] == "Cannot confirm"
    assert claim["safeAbstentionReason"] is not None


# ── Test 7a: Request too short → HTTP 422 ────────────────────────────────────

@pytest.mark.asyncio
async def test_text_too_short_returns_422(transport):
    """A text submission shorter than 10 characters must be rejected with 422."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/verify/text", json={"text": "short", "language": "en"})
    assert resp.status_code == 422


# ── Test 7b: Invalid language → HTTP 422 ────────────────────────────────────

@pytest.mark.asyncio
async def test_invalid_language_returns_422(transport):
    """An unsupported language code must be rejected with 422."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/verify/text",
            json={"text": "This is a valid statement for testing purposes.", "language": "fr"},
        )
    assert resp.status_code == 422


# ── Test 7c: Missing text field → HTTP 422 ───────────────────────────────────

@pytest.mark.asyncio
async def test_missing_text_field_returns_422(transport):
    """A request body missing the text field must return 422."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/verify/text", json={"language": "en"})
    assert resp.status_code == 422


# ── Test: Health endpoint ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_endpoint(transport):
    """Health endpoint must return 200 with required fields."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert "status" in body
    assert "version" in body
    assert "search_engine" in body
    assert body["status"] == "healthy"
