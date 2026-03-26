from sqlalchemy import String, Column, Integer, Boolean, Text, ForeignKey, UniqueConstraint
from db.models.db_config import Base


class Task(Base):
	__tablename__ = "tasks"
	__table_args__ = (
		UniqueConstraint("lesson_id", "assessment_kind", "sort_order", name="uq_task_lesson_kind_order"),
	)

	id = Column(Integer, primary_key=True)
	title = Column(String(200), nullable=False)
	description = Column(Text, nullable=True)
	lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
	lesson_node_id = Column(Integer, ForeignKey("roadmap_nodes.id", ondelete="CASCADE"), nullable=True)
	assessment_kind = Column(String(30), nullable=True)
	payload_json = Column(Text, nullable=True)
	sort_order = Column(Integer, nullable=False, default=1)
	is_required = Column(Boolean, default=True)
	difficulty = Column(String(50), nullable=True)
	is_completed = Column(Boolean, default=False)