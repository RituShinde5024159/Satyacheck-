"""
SatyaCheck – Evidence retrieval adapter.

Calls a real search API to fetch web results for each claim.
Currently supports:
    - Brave Search API  (BRAVE_SEARCH_API_KEY)
    - Google Custom Search JSON API (GOOGLE_CSE_API_KEY + GOOGLE_CSE_CX)

The adapter is pluggable: add more providers by following the SearchResult
protocol.  It never falls back to invented data — it raises on missing creds.

Returned SearchResult objects contain only values extracted from the actual
API response.  Passage text is the real snippet/description returned by the
search engine, never synthesised.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

SEARCH_TIMEOUT_SEC = 10.0
MAX_RESULTS_PER_CLAIM = 5


@dataclass
class SearchResult:
    """A single real search result from the configured provider."""
    url: str
    title: str
    snippet: str                   # verbatim snippet from the search engine
    publisher: str                 # inferred from netloc
    published_date: Optional[str]  # ISO date string or None if not provided


class SearchProviderError(Exception):
    """Raised when the search provider returns an error or is misconfigured."""


def _provider_name() -> str:
    if os.getenv("BRAVE_SEARCH_API_KEY", "").strip():
        return "brave"
    if os.getenv("GOOGLE_CSE_API_KEY", "").strip() and os.getenv("GOOGLE_CSE_CX", "").strip():
        return "google_cse"
    return "none"


def is_search_configured() -> bool:
    return _provider_name() != "none"


def _infer_publisher(url: str) -> str:
    """Extract a readable publisher name from the URL netloc."""
    try:
        from urllib.parse import urlparse
        netloc = urlparse(url).netloc
        # Drop www.
        netloc = netloc.removeprefix("www.")
        # Capitalise first segment before the TLD
        parts = netloc.split(".")
        return parts[0].replace("-", " ").title() if parts else netloc
    except Exception:
        return url[:40]


async def _brave_search(query: str, client: httpx.AsyncClient) -> list[SearchResult]:
    api_key = os.getenv("BRAVE_SEARCH_API_KEY", "").strip()
    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": api_key,
    }
    params = {
        "q": query,
        "count": MAX_RESULTS_PER_CLAIM,
        "text_decorations": "0",
        "search_lang": "en",
        "freshness": "py",          # past year
    }
    resp = await client.get(
        "https://api.search.brave.com/res/v1/web/search",
        headers=headers,
        params=params,
        timeout=SEARCH_TIMEOUT_SEC,
    )
    if resp.status_code == 401:
        raise SearchProviderError("Brave Search: invalid or expired API key (401).")
    if resp.status_code == 429:
        raise SearchProviderError("Brave Search: rate limit exceeded (429).")
    resp.raise_for_status()

    data = resp.json()
    results: list[SearchResult] = []
    for item in data.get("web", {}).get("results", [])[:MAX_RESULTS_PER_CLAIM]:
        results.append(SearchResult(
            url=item.get("url", ""),
            title=item.get("title", ""),
            snippet=item.get("description", ""),
            publisher=_infer_publisher(item.get("url", "")),
            published_date=item.get("page_age"),   # ISO date or None
        ))
    return results


async def _google_cse_search(query: str, client: httpx.AsyncClient) -> list[SearchResult]:
    api_key = os.getenv("GOOGLE_CSE_API_KEY", "").strip()
    cx = os.getenv("GOOGLE_CSE_CX", "").strip()
    params = {
        "key": api_key,
        "cx": cx,
        "q": query,
        "num": MAX_RESULTS_PER_CLAIM,
    }
    resp = await client.get(
        "https://www.googleapis.com/customsearch/v1",
        params=params,
        timeout=SEARCH_TIMEOUT_SEC,
    )
    if resp.status_code == 403:
        raise SearchProviderError("Google CSE: invalid API key or quota exceeded (403).")
    if resp.status_code == 429:
        raise SearchProviderError("Google CSE: rate limit exceeded (429).")
    resp.raise_for_status()

    data = resp.json()
    results: list[SearchResult] = []
    for item in data.get("items", [])[:MAX_RESULTS_PER_CLAIM]:
        pagemap = item.get("pagemap", {})
        metatags = pagemap.get("metatags", [{}])[0] if pagemap.get("metatags") else {}
        pub_date = (
            metatags.get("article:published_time")
            or metatags.get("og:published_time")
            or None
        )
        if pub_date:
            pub_date = pub_date[:10]   # take only YYYY-MM-DD

        results.append(SearchResult(
            url=item.get("link", ""),
            title=item.get("title", ""),
            snippet=item.get("snippet", "").replace("\n", " ").strip(),
            publisher=_infer_publisher(item.get("link", "")),
            published_date=pub_date,
        ))
    return results


async def fetch_evidence(claim: str) -> list[SearchResult]:
    """
    Retrieve real web evidence for *claim* using the configured search provider.

    Raises SearchProviderError if no provider is configured or the API call fails.
    The caller must handle this and apply safe abstention.
    """
    provider = _provider_name()
    if provider == "none":
        raise SearchProviderError(
            "No search provider is configured. "
            "Set BRAVE_SEARCH_API_KEY or (GOOGLE_CSE_API_KEY + GOOGLE_CSE_CX)."
        )

    async with httpx.AsyncClient() as client:
        if provider == "brave":
            return await _brave_search(claim, client)
        elif provider == "google_cse":
            return await _google_cse_search(claim, client)
        else:
            raise SearchProviderError(f"Unknown provider: {provider}")
