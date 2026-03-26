from sqlalchemy import String, Column, Integer, Boolean, Text, DateTime
from db.models.db_config import Base


class Job(Base):
	__tablename__ = "jobs"
	id = Column(Integer, primary_key=True)
	title = Column(String(200), nullable=False)
	company = Column(String(150), nullable=False)
	location = Column(String(150), nullable=True)
	profession = Column(String(100), nullable=True)
	description = Column(Text, nullable=True)
	salary = Column(String(100), nullable=True)
	job_type = Column(String(50), nullable=True)
	date_posted = Column(DateTime, nullable=True)
	is_active = Column(Boolean, default=True)
