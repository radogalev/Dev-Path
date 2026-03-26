from sqlalchemy import String, Column, Integer, ForeignKey, Text, UniqueConstraint
from db.models.db_config import Base


class Roadmap(Base):
	__tablename__ = "roadmaps"
	id = Column(Integer, primary_key=True)
	slug = Column(String(100), nullable=False, unique=True)
	title = Column(String(200), nullable=False)
	description = Column(Text, nullable=True)
	color = Column(String(50), nullable=True)


class RoadmapNode(Base):
	__tablename__ = "roadmap_nodes"
	__table_args__ = (
		UniqueConstraint("roadmap_id", "node_type", "external_id", name="uq_roadmap_node_external"),
	)

	id = Column(Integer, primary_key=True)
	roadmap_id = Column(Integer, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
	parent_id = Column(Integer, ForeignKey("roadmap_nodes.id", ondelete="CASCADE"), nullable=True)
	node_type = Column(String(30), nullable=False)
	external_id = Column(Integer, nullable=False)
	title = Column(String(255), nullable=False)
	description = Column(Text, nullable=True)
	duration = Column(String(50), nullable=True)
	lesson_type = Column(String(50), nullable=True)
	sort_order = Column(Integer, nullable=False, default=0)