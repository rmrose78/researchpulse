from sqlalchemy import create_engine
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