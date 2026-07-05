"""Citation enrichment via Semantic Scholar (Research Hub).

Looks up citation counts for arXiv papers by arXiv id using the Semantic Scholar
batch endpoint (no API key required; rate-limited). Failures are swallowed — a
missing enrichment must never break ingestion, the paper just keeps 0 citations.
"""
from __future__ import annotations

import re

import httpx

from app.ingestion.crawler import RawItem

S2_BATCH_URL = "https://api.semanticscholar.org/graph/v1/paper/batch"
# Matches the arXiv id in a URL like .../abs/2401.12345v2 -> "2401.12345".
_ARXIV_ID = re.compile(r"(\d{4}\.\d{4,5})(?:v\d+)?$")


def arxiv_id(url: str) -> str | None:
    m = _ARXIV_ID.search(url or "")
    return m.group(1) if m else None


def enrich_citations(items: list[RawItem]) -> None:
    """Populate `citation_count` on paper items in place (best-effort)."""
    id_map: dict[str, list[RawItem]] = {}
    for it in items:
        if it.kind != "paper":
            continue
        aid = arxiv_id(it.url)
        if aid:
            id_map.setdefault(f"ARXIV:{aid}", []).append(it)

    if not id_map:
        return

    ids = list(id_map.keys())
    try:
        resp = httpx.post(
            S2_BATCH_URL,
            params={"fields": "citationCount"},
            json={"ids": ids},
            timeout=30.0,
            follow_redirects=True,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:  # rate limit, network, schema drift — non-fatal
        print(f"[enrich] semantic scholar lookup failed: {exc}")
        return

    # The batch endpoint returns results positionally aligned with `ids`;
    # entries are null when the paper isn't found.
    for s2_id, entry in zip(ids, data):
        if not entry:
            continue
        count = entry.get("citationCount")
        if count is None:
            continue
        for it in id_map[s2_id]:
            it.citation_count = int(count)
