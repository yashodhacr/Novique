"""Source crawlers.

Two sources today — Hacker News (news) and arXiv (research papers) — both via
public APIs with no key required. Each source is a `fetch_*` function returning
the same `RawItem` shape, so the rest of the pipeline never changes. This is the
multi-source contract: adding Product Hunt, Reddit, or a lab blog is one more
function, nothing downstream moves.
"""
from __future__ import annotations

import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import datetime, timezone

import httpx

from app.config import settings

HN_SEARCH_URL = "https://hn.algolia.com/api/v1/search_by_date"
ARXIV_URL = "https://export.arxiv.org/api/query"
REDDIT_HOT_URL = "https://www.reddit.com/r/{subs}/hot.json"
_ATOM = "{http://www.w3.org/2005/Atom}"
# Reddit blocks generic clients; a descriptive UA is required.
_REDDIT_UA = "AI-Pulse/0.1 (AI intelligence aggregator)"


@dataclass
class RawItem:
    title: str
    url: str
    source: str
    author: str | None
    published_at: datetime
    points: int
    num_comments: int
    # Optional richer body (e.g. a paper abstract) for the AI summarizer + scorer.
    content: str | None = None
    # "news" or "paper" — routes items into the right view (Feed vs Research Hub).
    kind: str = "news"
    # Citation count for papers, populated by the Semantic Scholar enrichment step.
    citation_count: int = 0


def fetch_hacker_news(query: str | None = None, limit: int | None = None) -> list[RawItem]:
    """Pull recent AI-related stories from Hacker News."""
    query = query or settings.ingest_query
    limit = limit or settings.ingest_limit

    params = {
        "query": query,
        "tags": "story",
        "numericFilters": "points>5",  # skip noise
        "hitsPerPage": limit,
    }
    resp = httpx.get(HN_SEARCH_URL, params=params, timeout=30.0, follow_redirects=True)
    resp.raise_for_status()
    hits = resp.json().get("hits", [])

    items: list[RawItem] = []
    for h in hits:
        # Stories without an external URL fall back to the HN discussion page.
        url = h.get("url") or f"https://news.ycombinator.com/item?id={h.get('objectID')}"
        title = h.get("title")
        created = h.get("created_at_i")
        if not title or created is None:
            continue
        items.append(
            RawItem(
                title=title.strip(),
                url=url,
                source="Hacker News",
                author=h.get("author"),
                published_at=datetime.fromtimestamp(created, tz=timezone.utc),
                points=int(h.get("points") or 0),
                num_comments=int(h.get("num_comments") or 0),
                kind="news",
            )
        )
    return items


def fetch_arxiv(limit: int | None = None) -> list[RawItem]:
    """Pull the latest AI research papers from arXiv (cs.AI / cs.LG / cs.CL).

    arXiv returns Atom XML. Papers have no engagement signal, so `points` and
    `num_comments` stay 0 — their Impact Score is carried by source authority,
    entities, and content signals (see app/scoring.py).
    """
    limit = limit or settings.ingest_limit
    params = {
        "search_query": "cat:cs.AI OR cat:cs.LG OR cat:cs.CL",
        "sortBy": "submittedDate",
        "sortOrder": "descending",
        "max_results": limit,
    }
    resp = httpx.get(ARXIV_URL, params=params, timeout=30.0, follow_redirects=True)
    resp.raise_for_status()
    root = ET.fromstring(resp.text)

    items: list[RawItem] = []
    for entry in root.findall(f"{_ATOM}entry"):
        title_el = entry.find(f"{_ATOM}title")
        id_el = entry.find(f"{_ATOM}id")
        pub_el = entry.find(f"{_ATOM}published")
        summary_el = entry.find(f"{_ATOM}summary")
        if title_el is None or id_el is None or pub_el is None:
            continue

        authors = [
            a.findtext(f"{_ATOM}name", "").strip()
            for a in entry.findall(f"{_ATOM}author")
        ]
        published = datetime.fromisoformat(pub_el.text.replace("Z", "+00:00"))

        items.append(
            RawItem(
                title=" ".join((title_el.text or "").split()),
                url=(id_el.text or "").strip(),
                source="arXiv",
                author=", ".join(a for a in authors if a) or None,
                published_at=published,
                points=0,
                num_comments=0,
                content=" ".join((summary_el.text or "").split()) if summary_el is not None else None,
                kind="paper",
            )
        )
    return items


def fetch_reddit(limit: int | None = None) -> list[RawItem]:
    """Pull hot posts from AI subreddits (community discussion).

    Reddit posts carry score + comment counts, so they slot straight into the
    same engagement-based scoring as Hacker News — and links shared on both HN
    and Reddit dedupe against each other via the normalized-URL key.
    """
    limit = limit or settings.ingest_limit
    url = REDDIT_HOT_URL.format(subs=settings.reddit_subs)
    resp = httpx.get(
        url,
        params={"limit": limit},
        headers={"User-Agent": _REDDIT_UA},
        timeout=30.0,
        follow_redirects=True,
    )
    resp.raise_for_status()
    children = resp.json().get("data", {}).get("children", [])

    items: list[RawItem] = []
    for child in children:
        d = child.get("data", {})
        title = d.get("title")
        created = d.get("created_utc")
        if not title or d.get("stickied") or created is None:
            continue
        permalink = d.get("permalink", "")
        external = d.get("url") or f"https://www.reddit.com{permalink}"
        items.append(
            RawItem(
                title=title.strip(),
                url=external,
                source=f"Reddit r/{d.get('subreddit', '')}",
                author=d.get("author"),
                published_at=datetime.fromtimestamp(created, tz=timezone.utc),
                points=int(d.get("score") or 0),
                num_comments=int(d.get("num_comments") or 0),
                content=(d.get("selftext") or None),
                kind="news",
            )
        )
    return items
