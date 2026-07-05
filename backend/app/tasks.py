"""Celery tasks — the scheduled ingestion + scoring jobs.

Each task owns its own DB session. Sources run on independent cadences (see
celery_app.py), which is exactly what the multi-source pipeline contract buys us:
the same `run_pipeline` runs against any subset of sources.
"""
from app.celery_app import celery_app
from app.database import SessionLocal
from app.ingestion.crawler import fetch_arxiv, fetch_hacker_news, fetch_reddit
from app.ingestion.pipeline import recompute_all_scores, run_pipeline


@celery_app.task(name="app.tasks.ingest_news")
def ingest_news() -> dict:
    """News cadence — fast-moving sources (Hacker News + Reddit)."""
    db = SessionLocal()
    try:
        return run_pipeline(db, fetchers=[fetch_hacker_news, fetch_reddit])
    finally:
        db.close()


@celery_app.task(name="app.tasks.ingest_papers")
def ingest_papers() -> dict:
    db = SessionLocal()
    try:
        return run_pipeline(db, fetchers=[fetch_arxiv])
    finally:
        db.close()


@celery_app.task(name="app.tasks.recompute_scores")
def recompute_scores() -> dict:
    db = SessionLocal()
    try:
        return recompute_all_scores(db)
    finally:
        db.close()
