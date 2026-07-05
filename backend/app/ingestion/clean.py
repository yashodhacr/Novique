"""Clean + deduplicate raw items before they hit the AI layer."""
from __future__ import annotations

import hashlib
import re
from urllib.parse import urlparse

from app.ingestion.crawler import RawItem

_WS = re.compile(r"\s+")
# Tracking params we strip so the same link from different sources dedupes.
_TRACKING = re.compile(r"^(utm_|fbclid|gclid|ref|ref_src)", re.IGNORECASE)


def extract_domain(url: str) -> str:
    host = (urlparse(url).hostname or "").lower()
    return host[4:] if host.startswith("www.") else host


def _normalize_url(url: str) -> str:
    p = urlparse(url)
    kept = [
        kv for kv in p.query.split("&")
        if kv and not _TRACKING.match(kv.split("=", 1)[0])
    ]
    query = "&".join(sorted(kept))
    path = p.path.rstrip("/")
    return f"{(p.hostname or '').lower().removeprefix('www.')}{path}?{query}".rstrip("?")


def dedupe_key(item: RawItem) -> str:
    """Stable key from the normalized URL, falling back to the title."""
    basis = _normalize_url(item.url) or _WS.sub(" ", item.title.lower()).strip()
    return hashlib.sha256(basis.encode("utf-8")).hexdigest()[:32]


def clean_items(items: list[RawItem]) -> list[tuple[RawItem, str, str]]:
    """Normalize titles, attach domain + dedupe_key, and drop duplicates.

    Returns tuples of (item, domain, dedupe_key). Deduplication here is
    within-batch; the DB unique constraint on `dedupe_key` handles cross-run
    duplicates via upsert in the pipeline.
    """
    seen: set[str] = set()
    out: list[tuple[RawItem, str, str]] = []
    for item in items:
        item.title = _WS.sub(" ", item.title).strip()
        key = dedupe_key(item)
        if key in seen:
            continue
        seen.add(key)
        out.append((item, extract_domain(item.url), key))
    return out
