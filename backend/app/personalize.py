"""Personalized-feed ranking.

Builds the user's interest profile from two signals:
  • explicit interests  — topics they chose to follow
  • implicit interests  — topics of the articles they bookmarked (reading history)

Then re-ranks a candidate pool (top items by the chosen base score) by adding a
topic-overlap boost on top of the proprietary Impact/Trend score. So a developer
who follows "LLMs"/"Coding" sees those float up; a founder following "Funding"/
"Startups" sees a different feed from the same corpus.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Article, Bookmark, Interest

# How strongly each matched topic lifts an item, and the cap on total boost.
# +12 per matched topic (cap +36) makes a followed interest clearly float up
# while still respecting the proprietary base score for everything else.
_BOOST_PER_TOPIC = 12.0
_MAX_MATCHES = 3


def build_interest_profile(db: Session, user_id: int) -> set[str]:
    """Union of explicitly followed topics and topics from bookmarked articles."""
    profile: set[str] = {
        t.lower()
        for (t,) in db.execute(select(Interest.topic).where(Interest.user_id == user_id))
    }
    bookmarked_ids = [
        aid
        for (aid,) in db.execute(
            select(Bookmark.article_id).where(Bookmark.user_id == user_id)
        )
    ]
    if bookmarked_ids:
        for (topics,) in db.execute(
            select(Article.topics).where(Article.id.in_(bookmarked_ids))
        ):
            for t in topics or []:
                profile.add(t.lower())
    return profile


def personalized_feed(
    db: Session,
    user_id: int,
    sort: str = "impact",
    limit: int = 30,
    kind: str | None = None,
) -> list[Article]:
    profile = build_interest_profile(db, user_id)
    base_col = Article.trend_score if sort == "trend" else Article.impact_score

    # Pull a generous candidate pool by base score, then re-rank in Python.
    stmt = select(Article)
    if kind is not None:
        stmt = stmt.where(Article.kind == kind)
    candidates = db.scalars(stmt.order_by(base_col.desc()).limit(200)).all()

    def personalized_score(a: Article) -> float:
        base = a.trend_score if sort == "trend" else a.impact_score
        if not profile:
            return base
        matches = len(profile & {t.lower() for t in (a.topics or [])})
        return base + min(matches, _MAX_MATCHES) * _BOOST_PER_TOPIC

    candidates.sort(key=personalized_score, reverse=True)
    return candidates[:limit]
