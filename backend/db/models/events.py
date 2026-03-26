from sqlalchemy import String, Column, Integer, Boolean, Text, DateTime
from db.models.db_config import Base


class Event(Base):
	__tablename__ = "events"
	id = Column(Integer, primary_key=True)
	title = Column(String(200), nullable=False)
	description = Column(Text, nullable=True)
	date = Column(DateTime, nullable=False)
	location = Column(String(200), nullable=True)
	event_type = Column(String(50), nullable=True)
	is_free = Column(Boolean, default=True)
