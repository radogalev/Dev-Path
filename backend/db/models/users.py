from sqlalchemy import String, Column, Integer, Boolean, Date, DateTime, ForeignKey, UniqueConstraint
from db.models.db_config import Base


class User(Base):
	__tablename__ = "users"
	id = Column(Integer, primary_key=True)
	full_name = Column(String(100), nullable=False)
	email = Column(String(100), nullable=False, unique=True)
	password = Column(String(100), nullable=False)
	is_admin = Column(Boolean, nullable=True, default=None)
	selected_path = Column(String(100), nullable=True)
	current_lecture = Column(Integer, default=1)
	is_first_login = Column(Boolean, default=True)
	streak_count = Column(Integer, default=0)
	last_active_date = Column(Date, nullable=True)
	is_verified = Column(Boolean, default=False)
	verification_token = Column(String(255), nullable=True, unique=True)


class UserLessonProgress(Base):
	__tablename__ = "user_lesson_progress"
	__table_args__ = (
		UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson_progress"),
	)

	id = Column(Integer, primary_key=True)
	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
	lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
	is_completed = Column(Boolean, default=False)
	completed_at = Column(DateTime, nullable=True)


class UserTaskProgress(Base):
	__tablename__ = "user_task_progress"
	__table_args__ = (
		UniqueConstraint("user_id", "task_id", name="uq_user_task_progress"),
	)

	id = Column(Integer, primary_key=True)
	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
	task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
	is_completed = Column(Boolean, default=False)
	completed_at = Column(DateTime, nullable=True)


