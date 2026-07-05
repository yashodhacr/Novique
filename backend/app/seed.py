"""One-shot seeder: create tables and run a single ingestion cycle.

Usage (inside the backend container or a local venv):
    python -m app.seed
"""
from app.database import Base, SessionLocal, engine
from app import models  # noqa: F401
from app.ingestion.pipeline import run_pipeline


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        result = run_pipeline(db)
        print(f"Ingestion complete: {result}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
