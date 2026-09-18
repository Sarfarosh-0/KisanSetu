import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

# ---------------------------------------------------------------------------
# Database Configuration
# ---------------------------------------------------------------------------
# LOCAL DEVELOPMENT  : Leave DATABASE_URL unset → uses SQLite (agrimarket.db)
# PRODUCTION (Neon)  : Set DATABASE_URL=postgresql://user:pass@host/dbname
#                      in your Render environment variables / backend/.env
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agrimarket.db")

# Build engine kwargs based on database type
_is_sqlite     = DATABASE_URL.startswith("sqlite")
_is_postgres   = DATABASE_URL.startswith("postgresql") or DATABASE_URL.startswith("postgres")

if _is_sqlite:
    # SQLite: disable same-thread check (needed for FastAPI's threaded request handling)
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)

elif _is_postgres:
    # PostgreSQL on Neon / Render: require SSL and tune connection pool
    # sslmode=require ensures encrypted transit — mandatory for Neon free tier
    # pool_recycle=300 prevents stale connections after Neon's 5-min idle timeout
    # pool_pre_ping=True verifies connection health before use
    connect_args = {"sslmode": "require"}
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_recycle=300,       # recycle connections every 5 minutes
        pool_pre_ping=True,     # drop & re-open stale connections automatically
        pool_size=5,            # keep max 5 persistent connections (Neon free tier limit)
        max_overflow=2,         # allow 2 extra burst connections
    )

else:
    # Fallback: any other database URL (e.g. local PostgreSQL without SSL)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """FastAPI dependency — yields a database session per request and ensures it is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

