import time
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

engine = create_engine(settings.database_url)

sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base — all SQLAlchemy models inherit from this
class Base(DeclarativeBase):
    pass

# Dependency - used in route handelrs to get a db sessions
def get_db():
    db = sessionLocal()

    try:
        yield db
    finally:
        db.close()

# On some hosts (Railway) the DB service's private DNS can lag a few
# seconds behind the backend's own startup, so the first connection
# attempt at import time needs a few retries rather than a hard crash.
def create_tables_with_retry(max_attempts: int = 5, delay_seconds: float = 3.0) -> None:
    for attempt in range(1, max_attempts + 1):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError:
            if attempt == max_attempts:
                raise
            time.sleep(delay_seconds)