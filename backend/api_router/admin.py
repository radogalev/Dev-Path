import json
import os
import secrets
from datetime import datetime

from fastapi import APIRouter, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import sessionmaker

from db.models.db_config import engine
from db.models.events import Event
from db.models.jobs import Job
from db.models.lessons import Lesson
from db.models.roadmap import Roadmap, RoadmapNode
from db.models.tasks import Task

router = APIRouter(prefix="/admin")
SessionLocal = sessionmaker(bind=engine)


class AdminLecturePayload(BaseModel):
    id: int | None = None
    title: str
    duration: str | None = None
    type: str = "video"


class AdminMilestonePayload(BaseModel):
    id: int | None = None
    title: str
    description: str | None = None
    lectures: list[AdminLecturePayload] = []


class AdminRoadmapPayload(BaseModel):
    title: str
    description: str | None = None
    color: str | None = None
    milestones: list[AdminMilestonePayload] = []


class AdminLessonContentPayload(BaseModel):
    overview: str | None = None
    goal: str | None = None
    topics: list[str] = []
    explanation: list[str] = []
    resources: list[dict] = []


class AdminTaskPayload(BaseModel):
    title: str
    assessment_kind: str = "coding"
    sort_order: int = 1
    difficulty: str | None = None
    is_required: bool = True
    description: str | None = None
    payload: dict | None = None


class AdminJobPayload(BaseModel):
    title: str
    company: str
    profession: str | None = None
    location: str | None = None
    description: str | None = None
    salary: str | None = None
    job_type: str | None = None


class AdminEventPayload(BaseModel):
    title: str
    description: str | None = None
    date: str
    location: str | None = None
    event_type: str | None = None
    is_free: bool = True


def _verify_admin_key(admin_key: str | None) -> bool:
    expected = os.getenv("ADMIN_PANEL_KEY", "admin123")
    return bool(admin_key) and secrets.compare_digest(admin_key, expected)


def _serialize_task(task: Task) -> dict:
    parsed_payload = {}
    if task.payload_json:
        try:
            parsed_payload = json.loads(task.payload_json)
        except Exception:
            parsed_payload = {}

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "assessment_kind": task.assessment_kind,
        "sort_order": task.sort_order,
        "difficulty": task.difficulty,
        "is_required": task.is_required,
        "payload": parsed_payload,
    }


@router.get("/roadmaps")
def get_admin_roadmaps(x_admin_key: str | None = Header(default=None)):
    if not _verify_admin_key(x_admin_key):
        return JSONResponse(status_code=401, content={"success": False, "message": "Unauthorized"})

    with SessionLocal() as session:
        roadmaps = session.query(Roadmap).order_by(Roadmap.title.asc()).all()
        return {
            "success": True,
            "roadmaps": [
                {
                    "pathId": roadmap.slug,
                    "title": roadmap.title,
                    "description": roadmap.description,
                    "color": roadmap.color,
                }
                for roadmap in roadmaps
            ],
        }


@router.get("/roadmaps/{path_id}")
def get_admin_roadmap(path_id: str, x_admin_key: str | None = Header(default=None)):
    if not _verify_admin_key(x_admin_key):
        return JSONResponse(status_code=401, content={"success": False, "message": "Unauthorized"})

    with SessionLocal() as session:
        roadmap = session.query(Roadmap).filter_by(slug=path_id).first()
        if not roadmap:
            return {"success": False, "message": "Roadmap not found"}

        milestones = (
            session.query(RoadmapNode)
            .filter_by(roadmap_id=roadmap.id, node_type="milestone")
            .order_by(RoadmapNode.sort_order.asc())
            .all()
        )

        milestone_payload = []
        lesson_content = []

        for milestone in milestones:
            lessons = (
                session.query(RoadmapNode)
                .filter_by(parent_id=milestone.id, node_type="lesson")
                .order_by(RoadmapNode.sort_order.asc())
                .all()
            )

            lecture_payload = []
            for lesson_node in lessons:
                lecture_payload.append(
                    {
                        "id": lesson_node.external_id,
                        "title": lesson_node.title,
                        "duration": lesson_node.duration,
                        "type": lesson_node.lesson_type,
                    }
                )

                lesson = session.query(Lesson).filter_by(path=path_id, order=lesson_node.external_id).first()
                tasks = session.query(Task).filter_by(lesson_id=lesson.id).order_by(Task.sort_order.asc()).all() if lesson else []

                resources = []
                if lesson and lesson.resources_json:
                    try:
                        resources = json.loads(lesson.resources_json)
                    except Exception:
                        resources = []

                topics = []
                if lesson and lesson.topics_json:
                    try:
                        topics = json.loads(lesson.topics_json)
                    except Exception:
                        topics = []

                explanation = []
                if lesson and lesson.explanation_json:
                    try:
                        explanation = json.loads(lesson.explanation_json)
                    except Exception:
                        explanation = []

                lesson_content.append(
                    {
                        "lectureId": lesson_node.external_id,
                        "title": lesson.title if lesson else lesson_node.title,
                        "overview": lesson.overview if lesson else "",
                        "goal": lesson.goal if lesson else "",
                        "topics": topics,
                        "explanation": explanation,
                        "resources": resources,
                        "tasks": [_serialize_task(task) for task in tasks],
                    }
                )

            milestone_payload.append(
                {
                    "id": milestone.external_id,
                    "title": milestone.title,
                    "description": milestone.description,
                    "lectures": lecture_payload,
                }
            )

        return {
            "success": True,
            "roadmap": {
                "pathId": roadmap.slug,
                "title": roadmap.title,
                "description": roadmap.description,
                "color": roadmap.color,
                "milestones": milestone_payload,
            },
            "lessons": lesson_content,
        }


@router.put("/roadmaps/{path_id}")
def update_admin_roadmap(path_id: str, payload: AdminRoadmapPayload, x_admin_key: str | None = Header(default=None)):
    if not _verify_admin_key(x_admin_key):
        return JSONResponse(status_code=401, content={"success": False, "message": "Unauthorized"})

    with SessionLocal() as session:
        roadmap = session.query(Roadmap).filter_by(slug=path_id).first()
        if not roadmap:
            return {"success": False, "message": "Roadmap not found"}

        roadmap.title = payload.title
        roadmap.description = payload.description
        roadmap.color = payload.color
        session.flush()

        existing_lesson_nodes = session.query(RoadmapNode).filter_by(roadmap_id=roadmap.id, node_type="lesson").all()
        existing_lesson_external_ids = [node.external_id for node in existing_lesson_nodes]
        next_lesson_external_id = max(existing_lesson_external_ids, default=0) + 1

        existing_milestones = session.query(RoadmapNode).filter_by(roadmap_id=roadmap.id, node_type="milestone").all()
        existing_milestone_ids = [node.external_id for node in existing_milestones]
        next_milestone_external_id = max(existing_milestone_ids, default=0) + 1

        updated_milestones = 0
        updated_lessons = 0

        for milestone_index, milestone_payload in enumerate(payload.milestones, start=1):
            milestone_external_id = milestone_payload.id or next_milestone_external_id
            if milestone_payload.id is None:
                next_milestone_external_id += 1

            milestone_node = (
                session.query(RoadmapNode)
                .filter_by(roadmap_id=roadmap.id, node_type="milestone", external_id=milestone_external_id)
                .first()
            )

            if not milestone_node:
                milestone_node = RoadmapNode(
                    roadmap_id=roadmap.id,
                    node_type="milestone",
                    external_id=milestone_external_id,
                    sort_order=milestone_index,
                    title=milestone_payload.title,
                    description=milestone_payload.description,
                )
                session.add(milestone_node)
                session.flush()

            milestone_node.title = milestone_payload.title
            milestone_node.description = milestone_payload.description
            milestone_node.sort_order = milestone_index
            milestone_node.parent_id = None
            updated_milestones += 1

            for lecture_index, lecture_payload in enumerate(milestone_payload.lectures, start=1):
                lecture_external_id = lecture_payload.id or next_lesson_external_id
                if lecture_payload.id is None:
                    next_lesson_external_id += 1

                lesson_node = (
                    session.query(RoadmapNode)
                    .filter_by(roadmap_id=roadmap.id, node_type="lesson", external_id=lecture_external_id)
                    .first()
                )

                if not lesson_node:
                    lesson_node = RoadmapNode(
                        roadmap_id=roadmap.id,
                        node_type="lesson",
                        external_id=lecture_external_id,
                        parent_id=milestone_node.id,
                        title=lecture_payload.title,
                        duration=lecture_payload.duration,
                        lesson_type=lecture_payload.type,
                        sort_order=lecture_index,
                    )
                    session.add(lesson_node)
                    session.flush()

                lesson_node.parent_id = milestone_node.id
                lesson_node.title = lecture_payload.title
                lesson_node.duration = lecture_payload.duration
                lesson_node.lesson_type = lecture_payload.type
                lesson_node.sort_order = lecture_index

                lesson = session.query(Lesson).filter_by(path=path_id, order=lecture_external_id).first()
                if not lesson:
                    lesson = session.query(Lesson).filter_by(roadmap_node_id=lesson_node.id).first()
                if not lesson:
                    lesson = Lesson(path=path_id, order=lecture_external_id, title=lecture_payload.title)
                    session.add(lesson)

                lesson.roadmap_node_id = lesson_node.id
                lesson.path = path_id
                lesson.order = lecture_external_id
                lesson.title = lecture_payload.title
                updated_lessons += 1

        session.commit()

        return {
            "success": True,
            "message": "Roadmap updated",
            "updatedMilestones": updated_milestones,
            "updatedLessons": updated_lessons,
        }


@router.put("/lessons/{path_id}/{lecture_id}")
def update_admin_lesson(path_id: str, lecture_id: int, payload: AdminLessonContentPayload, x_admin_key: str | None = Header(default=None)):
    if not _verify_admin_key(x_admin_key):
        return JSONResponse(status_code=401, content={"success": False, "message": "Unauthorized"})

    with SessionLocal() as session:
        lesson = session.query(Lesson).filter_by(path=path_id, order=lecture_id).first()
        if not lesson:
            return {"success": False, "message": "Lesson not found"}

        lesson.overview = payload.overview
        lesson.goal = payload.goal
        lesson.topics_json = json.dumps(payload.topics or [])
        lesson.explanation_json = json.dumps(payload.explanation or [])
        lesson.resources_json = json.dumps(payload.resources or [])
        lesson.content = json.dumps(
            {
                "overview": payload.overview,
                "goal": payload.goal,
                "topics": payload.topics or [],
                "explanation": payload.explanation or [],
                "resources": payload.resources or [],
            }
        )

        session.commit()

        return {"success": True, "message": "Lesson updated"}


@router.get("/tasks/{path_id}/{lecture_id}")
def get_admin_tasks(path_id: str, lecture_id: int, x_admin_key: str | None = Header(default=None)):
    if not _verify_admin_key(x_admin_key):
        return JSONResponse(status_code=401, content={"success": False, "message": "Unauthorized"})

    with SessionLocal() as session:
        lesson = session.query(Lesson).filter_by(path=path_id, order=lecture_id).first()
        if not lesson:
            return {"success": False, "message": "Lesson not found"}

        tasks = session.query(Task).filter_by(lesson_id=lesson.id).order_by(Task.sort_order.asc()).all()
        return {"success": True, "tasks": [_serialize_task(task) for task in tasks]}


@router.post("/tasks/{path_id}/{lecture_id}")
def create_admin_task(path_id: str, lecture_id: int, payload: AdminTaskPayload, x_admin_key: str | None = Header(default=None)):
    if not _verify_admin_key(x_admin_key):
        return JSONResponse(status_code=401, content={"success": False, "message": "Unauthorized"})

    with SessionLocal() as session:
        lesson = session.query(Lesson).filter_by(path=path_id, order=lecture_id).first()
        if not lesson:
            return {"success": False, "message": "Lesson not found"}

        task = Task(
            title=payload.title,
            description=payload.description,
            lesson_id=lesson.id,
            lesson_node_id=lesson.roadmap_node_id,
            assessment_kind=payload.assessment_kind,
            sort_order=payload.sort_order,
            difficulty=payload.difficulty,
            is_required=payload.is_required,
            payload_json=json.dumps(payload.payload or {}),
        )
        session.add(task)
        session.commit()
        session.refresh(task)

        return {"success": True, "message": "Task created", "task": _serialize_task(task)}


@router.put("/tasks/{task_id}")
def update_admin_task(task_id: int, payload: AdminTaskPayload, x_admin_key: str | None = Header(default=None)):
    if not _verify_admin_key(x_admin_key):
        return JSONResponse(status_code=401, content={"success": False, "message": "Unauthorized"})

    with SessionLocal() as session:
        task = session.query(Task).filter_by(id=task_id).first()
        if not task:
            return {"success": False, "message": "Task not found"}

        task.title = payload.title
        task.description = payload.description
        task.assessment_kind = payload.assessment_kind
        task.sort_order = payload.sort_order
        task.difficulty = payload.difficulty
        task.is_required = payload.is_required
        task.payload_json = json.dumps(payload.payload or {})

        session.commit()

        return {"success": True, "message": "Task updated", "task": _serialize_task(task)}


@router.post("/jobs")
def create_admin_job(payload: AdminJobPayload, x_admin_key: str | None = Header(default=None)):
    if not _verify_admin_key(x_admin_key):
        return JSONResponse(status_code=401, content={"success": False, "message": "Unauthorized"})

    with SessionLocal() as session:
        job = Job(
            title=payload.title,
            company=payload.company,
            profession=payload.profession,
            location=payload.location,
            description=payload.description,
            salary=payload.salary,
            job_type=payload.job_type,
            date_posted=datetime.utcnow(),
            is_active=True,
        )
        session.add(job)
        session.commit()
        session.refresh(job)

        return {
            "success": True,
            "message": "Job posted",
            "job": {
                "id": job.id,
                "title": job.title,
                "company": job.company,
            },
        }


@router.get("/events")
def get_admin_events(x_admin_key: str | None = Header(default=None)):
    if not _verify_admin_key(x_admin_key):
        return JSONResponse(status_code=401, content={"success": False, "message": "Unauthorized"})

    with SessionLocal() as session:
        events = session.query(Event).order_by(Event.date.asc()).all()
        return {
            "success": True,
            "events": [
                {
                    "id": event.id,
                    "title": event.title,
                    "description": event.description,
                    "date": event.date.isoformat() if event.date else None,
                    "location": event.location,
                    "event_type": event.event_type,
                    "is_free": event.is_free,
                }
                for event in events
            ],
        }


@router.post("/events")
def create_admin_event(payload: AdminEventPayload, x_admin_key: str | None = Header(default=None)):
    if not _verify_admin_key(x_admin_key):
        return JSONResponse(status_code=401, content={"success": False, "message": "Unauthorized"})

    try:
        event_date = datetime.fromisoformat(payload.date.replace("Z", "+00:00"))
    except Exception:
        return {"success": False, "message": "Invalid event date format"}

    with SessionLocal() as session:
        event = Event(
            title=payload.title,
            description=payload.description,
            date=event_date,
            location=payload.location,
            event_type=payload.event_type,
            is_free=payload.is_free,
        )
        session.add(event)
        session.commit()
        session.refresh(event)

        return {
            "success": True,
            "message": "Event created",
            "event": {
                "id": event.id,
                "title": event.title,
                "date": event.date.isoformat() if event.date else None,
            },
        }


@router.delete("/events/{event_id}")
def delete_admin_event(event_id: int, x_admin_key: str | None = Header(default=None)):
    if not _verify_admin_key(x_admin_key):
        return JSONResponse(status_code=401, content={"success": False, "message": "Unauthorized"})

    with SessionLocal() as session:
        event = session.query(Event).filter_by(id=event_id).first()
        if not event:
            return {"success": False, "message": "Event not found"}

        session.delete(event)
        session.commit()

        return {
            "success": True,
            "message": "Event deleted",
        }
