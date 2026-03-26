from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.sql import func

from db.models.db_config import Base


class UserTheoryTestResult(Base):
    __tablename__ = "user_theory_test_results"
    __table_args__ = (
        UniqueConstraint("user_id", "path_id", "lesson_id", name="uq_user_theory_result"),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    path_id = Column(String(100), nullable=False)
    lesson_id = Column(Integer, nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    passed = Column(Boolean, nullable=False)
    submitted_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
