from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime, JSON
from datetime import datetime, timezone
from app.database import Base


class TrendingSnapshot(Base):
    __tablename__ = "trending_snapshots"

    # Insert-only: a new row is written per (specialty, mode) computation
    # rather than overwriting the last one, so later features can diff
    # against a prior snapshot for rank-movement badges.
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    specialty: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    mode: Mapped[str] = mapped_column(String(32), nullable=False, default="trending")
    computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    payload: Mapped[list] = mapped_column(JSON, nullable=False)
