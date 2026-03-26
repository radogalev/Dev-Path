import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import sessionmaker

from db.models.db_config import engine
from db.models.lessons import Lesson
from db.models.roadmap import Roadmap
from db.models.tasks import Task


SessionLocal = sessionmaker(bind=engine)


def to_dict(instance) -> dict:
    return {column.name: getattr(instance, column.name) for column in instance.__table__.columns}


def export_learning_data(output_path: str = "learning_export.json") -> Path:
    output_file = Path(output_path).resolve()

    with SessionLocal() as session:
        roadmaps = session.execute(select(Roadmap).order_by(Roadmap.id.asc())).scalars().all()
        lessons = session.execute(select(Lesson).order_by(Lesson.id.asc())).scalars().all()
        tasks = session.execute(select(Task).order_by(Task.id.asc())).scalars().all()

    payload = {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "counts": {
            "roadmaps": len(roadmaps),
            "lessons": len(lessons),
            "tasks": len(tasks),
        },
        "roadmaps": [to_dict(item) for item in roadmaps],
        "lessons": [to_dict(item) for item in lessons],
        "tasks": [to_dict(item) for item in tasks],
    }

    output_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return output_file


if __name__ == "__main__":
    file_path = export_learning_data()
    print(f"Export complete: {file_path}")