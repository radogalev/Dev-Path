from sqlalchemy import String, Column, Integer, Text, ForeignKey
from db.models.db_config import Base


class Lesson(Base):
	__tablename__ = "lessons"
	id = Column(Integer, primary_key=True)
	roadmap_node_id = Column(Integer, ForeignKey("roadmap_nodes.id", ondelete="CASCADE"), nullable=True, unique=True)
	title = Column(String(200), nullable=False)
	path = Column(String(100), nullable=False)
	order = Column(Integer, nullable=False)
	content = Column(Text, nullable=True)
	overview = Column(Text, nullable=True)
	goal = Column(Text, nullable=True)
	topics_json = Column(Text, nullable=True)
	explanation_json = Column(Text, nullable=True)
	resources_json = Column(Text, nullable=True)
	difficulty = Column(String(50), nullable=True)
	duration_minutes = Column(Integer, nullable=True)
