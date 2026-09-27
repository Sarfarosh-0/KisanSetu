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

# Normalize legacy postgres:// scheme (injected by Render / Heroku Postgres add-ons).
# SQLAlchemy 1.4+ and 2.0 removed support for the 'postgres://' dialect prefix.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Ensure dialect driver compatibility:
# 1) If URL specifies postgresql+psycopg:// but psycopg (v3) is unavailable, fallback to psycopg2
if DATABASE_URL.startswith("postgresql+psycopg://"):
    try:
        import psycopg  # noqa: F401
    except ImportError:
        try:
            import psycopg2  # noqa: F401
            DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg://", "postgresql+psycopg2://", 1)
        except ImportError:
            pass

# 2) If URL specifies postgresql+psycopg2:// but psycopg2 is unavailable, fallback to psycopg (v3)
elif DATABASE_URL.startswith("postgresql+psycopg2://"):
    try:
        import psycopg2  # noqa: F401
    except ImportError:
        try:
            import psycopg  # noqa: F401
            DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql+psycopg://", 1)
        except ImportError:
            pass

# 3) If URL specifies bare postgresql:// (which defaults to psycopg2 in SQLAlchemy):
# If psycopg2 is unavailable but psycopg (v3) is installed, route to postgresql+psycopg://
elif DATABASE_URL.startswith("postgresql://"):
    try:
        import psycopg2  # noqa: F401
    except ImportError:
        try:
            import psycopg  # noqa: F401
            DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
        except ImportError:
            pass

# Build engine kwargs based on database type
_is_sqlite     = DATABASE_URL.startswith("sqlite")
_is_postgres   = DATABASE_URL.startswith("postgresql")

if _is_sqlite:
    # SQLite: disable same-thread check (needed for FastAPI's threaded request handling)
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)

elif _is_postgres:
    # PostgreSQL on Neon / Render: require SSL for cloud instances and tune connection pool
    # sslmode=require ensures encrypted transit — mandatory for Neon free tier
    # pool_recycle=300 prevents stale connections after Neon's 5-min idle timeout
    # pool_pre_ping=True verifies connection health before use
    connect_args = {}
    if "localhost" not in DATABASE_URL and "127.0.0.1" not in DATABASE_URL:
        connect_args["sslmode"] = "require"

    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_recycle=300,       # recycle connections every 5 minutes
        pool_pre_ping=True,     # drop & re-open stale connections automatically
        pool_size=5,            # keep max 5 persistent connections (Neon free tier limit)
        max_overflow=2,         # allow 2 extra burst connections
    )

else:
    # Fallback: any other database URL
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

