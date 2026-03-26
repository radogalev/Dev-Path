from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from db.models.db_config import Base


class UserApplication(Base):
    __tablename__ = "user_applications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(60), nullable=False)
    years_experience = Column(String(40), nullable=False)
    start_date = Column(String(40), nullable=False)
    resume = Column(Text, nullable=True)
    cover_letter = Column(Text, nullable=False)
    status = Column(String(40), nullable=False, default="submitted")
    is_active = Column(Boolean, nullable=False, default=True)
    submitted_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
