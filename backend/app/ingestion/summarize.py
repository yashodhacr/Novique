"""AI Explainer Engine — turns a raw item into structured explainer fields.

Primary path: Anthropic Messages API with structured outputs (Pydantic schema)
on `claude-opus-4-8`. If no ANTHROPIC_API_KEY is configured, we fall back to a
deterministic heuristic so the whole pipeline still runs end-to-end for a demo.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.config import settings
from app.ingestion.crawler import RawItem


class Explainer(BaseModel):
    """Structured output schema returned by the model (and the fallback)."""
    summary_30s: str = Field(description="A crisp 1-2 sentence, 30-second summary.")
    key_takeaways: list[str] = Field(description="2-4 bullet takeaways.")
    why_it_matters: str = Field(description="Why this matters for the AI field.")
    who_is_impacted: str = Field(description="Who is most affected (devs, founders, etc.).")
    what_to_watch: str = Field(description="What to watch next as a result.")
    topics: list[str] = Field(description="3-6 short topic tags, e.g. 'LLMs', 'Funding'.")
    sentiment: Literal["positive", "neutral", "negative"]


_SYSTEM = (
    "You are the analyst engine for AI Pulse, a real-time AI intelligence "
    "platform. Given an AI news item or research paper, produce a tight, factual "
    "explainer. Answer: what happened, why it matters, who is impacted, and what "
    "to watch next. For research papers (an abstract is provided), explain the "
    "contribution in plain English first, then note the technical significance. "
    "Be concise and concrete. Do not speculate beyond the given text; if details "
    "are unknown, say what a reader should look for."
)


def _heuristic(item: RawItem, domain: str) -> Explainer:
    """Key-free fallback so the slice runs without an API key."""
    blurb = (item.content[:240] + "…") if item.content else f"{item.title} (via {item.source})."
    return Explainer(
        summary_30s=blurb,
        key_takeaways=[item.title, f"Source: {domain or item.source}"],
        why_it_matters="Heuristic summary — set ANTHROPIC_API_KEY for AI-generated analysis.",
        who_is_impacted="AI researchers and practitioners following this topic.",
        what_to_watch="Follow-up coverage, citations, and official announcements.",
        topics=["Research" if item.kind == "paper" else "AI"],
        sentiment="neutral",
    )


def summarize(item: RawItem, domain: str) -> tuple[Explainer, str]:
    """Return (explainer, summarized_by). `summarized_by` is the model id or 'heuristic'."""
    if not settings.anthropic_api_key:
        return _heuristic(item, domain), "heuristic"

    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    kind_label = "Research paper" if item.kind == "paper" else "News item"
    abstract = f"Abstract: {item.content[:1500]}\n" if item.content else ""
    prompt = (
        f"Type: {kind_label}\n"
        f"Title: {item.title}\n"
        f"Source: {item.source}\n"
        f"Domain: {domain}\n"
        f"URL: {item.url}\n"
        f"{abstract}\n"
        "Produce the structured explainer."
    )
    try:
        resp = client.messages.parse(
            model=settings.ai_model,
            max_tokens=1024,
            thinking={"type": "adaptive"},
            system=_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
            output_format=Explainer,
        )
        parsed = resp.parsed_output
        if parsed is None:  # refusal or unparseable
            return _heuristic(item, domain), "heuristic"
        return parsed, settings.ai_model
    except Exception:
        # Network / rate-limit / parse failure — keep the pipeline moving.
        return _heuristic(item, domain), "heuristic"
