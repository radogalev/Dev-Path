import json
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from users import router
from api_router.learning import router as learning_router
from api_router.admin import router as admin_router
from ai_logic import ai_router
from ai_logic import AIProvider
from sqlalchemy.orm import sessionmaker
from db.models.db_config import engine
from db.models.events import Event
from db.models.jobs import Job
from db.models.db_config import Base
from db.models.lessons import Lesson
from db.models.tasks import Task



app = FastAPI()

lesson_description = ""


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(learning_router)
app.include_router(admin_router)

provider = None
code_submissions = []
SessionLocal = sessionmaker(bind=engine)


class RoadmapLessonPayload(BaseModel):
    lessonId: int
    milestoneId: int
    title: str
    type: str
    duration: str | None = None


class RoadmapAssessmentSeedPayload(BaseModel):
    pathId: str
    lessons: list[RoadmapLessonPayload]


def _normalize_text(value: str) -> str:
    return (value or "").lower().strip()


def _extract_task_payload(task: Task) -> dict:
    if task.payload_json:
        try:
            parsed_payload = json.loads(task.payload_json)
            if isinstance(parsed_payload, dict):
                return parsed_payload
        except Exception:
            pass

    if task.description:
        try:
            parsed_description = json.loads(task.description)
            if isinstance(parsed_description, dict):
                return parsed_description
        except Exception:
            pass

    return {}


def _ensure_roadmap_assessment(session, path_id: str, lesson_payload: RoadmapLessonPayload) -> Lesson:
    lesson = session.query(Lesson).filter_by(path=path_id, order=lesson_payload.lessonId).first()

    if not lesson:
        lesson = Lesson(
            title=lesson_payload.title,
            path=path_id,
            order=lesson_payload.lessonId,
            content=lesson_payload.type,
        )
        session.add(lesson)
        session.flush()
    else:
        lesson.title = lesson_payload.title
        lesson.content = lesson_payload.type

    return lesson

@app.on_event("startup")
async def startup_prompt():
    global provider
    # Avoid blocking app boot on DB connectivity unless explicitly requested.
    if os.getenv("AUTO_DB_CREATE_ON_STARTUP", "false").lower() == "true":
        try:
            Base.metadata.create_all(bind=engine)
        except Exception as error:
            # Keep the API process alive even if DB init fails temporarily.
            print(f"Startup warning: database initialization failed: {error}")

    try:
        provider = AIProvider()
    except Exception as error:
        # Allow non-AI endpoints to work while AI provider is unavailable.
        provider = None
        print(f"Startup warning: AI provider initialization failed: {error}")


@app.get("/")
async def root():
    # Serve index.html for SPA routing
    public_dir = os.path.join(os.path.dirname(__file__), "public")
    index_file = os.path.join(public_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "status": "running",
        "ai_provider": provider._provider if provider else None,
    }


class CodingChallengeDescriptionPayload(BaseModel):
    description: str

@app.post("/dashboard-coding-challenge")
async def receive_dashboard_coding_challenge(payload: CodingChallengeDescriptionPayload):
    global lesson_description
    lesson_description = payload.description
    try:
        ai_result = ai_router.solve(lesson_description)
        print("------------------------------")
        print(lesson_description)
        print("------------------------------")
        print(f"AI ({ai_router.provider}) is working")
        print(ai_result)
        return {
            "success": True,
            "message": "Coding challenge description received",
            "description": payload.description,
            "ai_response": ai_result,
        }
    except Exception as e:
        print(f"AI Error: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(e),
            },
        )

class CodeSubmissionPayload(BaseModel):
    userId: int | None = None
    pathId: str
    lectureId: int
    milestoneId: int
    exerciseIndex: int
    code: str
    language: str | None = None
    problemTitle: str | None = None
    problemDescription: str | None = None
    eventType: str | None = "manual_save"

@app.post("/submit-code")
async def submit_code(payload: CodeSubmissionPayload):
    if not payload.code or not payload.code.strip():
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": "Code cannot be empty",
            },
        )

    submission = {
        "id": len(code_submissions) + 1,
        "userId": payload.userId,
        "pathId": payload.pathId,
        "lectureId": payload.lectureId,
        "milestoneId": payload.milestoneId,
        "exerciseIndex": payload.exerciseIndex,
        "code": payload.code,
        "language": payload.language,
        "problemTitle": payload.problemTitle,
        "problemDescription": payload.problemDescription,
        "eventType": payload.eventType,
    }
    
    try:
        task_solution = 1
    except Exception as error:
        print(f"AI solve error: {error}")
        return JSONResponse(
            status_code=502,
            content={
                "success": False,
                "message": f"AI service error: {str(error)}",
            },
        )
    submitted_code = submission["code"]
    current_problem_description = payload.problemDescription or lesson_description
    is_correct = None
    improvement_tips = None

    # print("USSSSS")
    # print(task_solution)

    if payload.eventType == "solution_submit":
        try:
            is_correct = ai_router.determine_true_or_false(submitted_code, current_problem_description)
            print("sdsd")
            if not is_correct:
                improvement_tips = ai_router.generate_improvement_tips(submitted_code, current_problem_description)
        except Exception as error:
            print(f"AI evaluation error: {error}")
            return JSONResponse(
                status_code=502,
                content={
                    "success": False,
                    "message": f"AI evaluation error: {str(error)}",
                },
            )

    

    code_submissions.append(submission)

    return {
        "success": True,
        "message": "Code submission received",
        "submissionId": submission["id"],
        "isCorrect": is_correct,
        "improvementTips": improvement_tips,
    }


@app.get("/jobs")
async def get_jobs():
    """Fetch all active jobs from the database"""
    try:
        SessionLocal = sessionmaker(bind=engine)
        with SessionLocal() as session:
            jobs = session.query(Job).filter(Job.is_active == True).all()
            jobs_data = [
                {
                    "id": job.id,
                    "title": job.title,
                    "company": job.company,
                    "location": job.location,
                    "profession": job.profession,
                    "description": job.description,
                    "salary": job.salary,
                    "job_type": job.job_type,
                    "date_posted": str(job.date_posted) if job.date_posted else None,
                    "is_active": job.is_active,
                }
                for job in jobs
            ]
            return {
                "success": True,
                "jobs": jobs_data,
            }
    except Exception as e:
        print(f"Error fetching jobs: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(e),
            },
        )


@app.get("/events")
async def get_events():
    """Fetch upcoming events from the database"""
    try:
        with SessionLocal() as session:
            events = session.query(Event).order_by(Event.date.asc()).all()
            event_data = [
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
            ]

            return {
                "success": True,
                "events": event_data,
            }
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(error),
            },
        )


@app.post("/roadmap-assessments/seed")
async def seed_roadmap_assessments(payload: RoadmapAssessmentSeedPayload):
    if not payload.lessons:
        return {
            "success": True,
            "message": "No lessons provided",
            "seeded": 0,
        }

    seeded_count = 0
    try:
        with SessionLocal() as session:
            for lesson_payload in payload.lessons:
                lesson = _ensure_roadmap_assessment(session, payload.pathId, lesson_payload)
                task_count = session.query(Task).filter_by(lesson_id=lesson.id).count()
                if task_count > 0:
                    seeded_count += 1

            session.commit()

        return {
            "success": True,
            "message": "Roadmap assessments are ready",
            "seeded": seeded_count,
        }
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(error),
            },
        )


@app.get("/roadmap-assessments/{path_id}/{lecture_id}")
async def get_roadmap_assessment(path_id: str, lecture_id: int):
    try:
        with SessionLocal() as session:
            lesson = session.query(Lesson).filter_by(path=path_id, order=lecture_id).first()
            if not lesson:
                return {
                    "success": True,
                    "assessments": [],
                }

            tasks = session.query(Task).filter_by(lesson_id=lesson.id).order_by(Task.sort_order.asc(), Task.id.asc()).all()

            assessments = []
            for task in tasks:
                db_payload = _extract_task_payload(task)
                payload = {
                    "id": task.id,
                    "title": task.title,
                    "difficulty": task.difficulty or "Easy",
                    "language": db_payload.get("language", "Theory"),
                    "kind": db_payload.get("kind", task.assessment_kind or "theoretical"),
                    "prompt": task.description or "",
                    "inputDescription": "",
                    "outputDescription": "",
                    "constraints": [],
                    "exampleInput": "",
                    "exampleOutput": "",
                    "starterCode": "",
                }

                if db_payload:
                    payload.update({
                        "title": db_payload.get("title", payload["title"]),
                        "difficulty": db_payload.get("difficulty", payload["difficulty"]),
                        "language": db_payload.get("language", payload["language"]),
                        "kind": db_payload.get("kind", payload["kind"]),
                        "prompt": db_payload.get("prompt", payload["prompt"]),
                        "inputDescription": db_payload.get("inputDescription", payload["inputDescription"]),
                        "outputDescription": db_payload.get("outputDescription", payload["outputDescription"]),
                        "constraints": db_payload.get("constraints", payload["constraints"]),
                        "exampleInput": db_payload.get("exampleInput", payload["exampleInput"]),
                        "exampleOutput": db_payload.get("exampleOutput", payload["exampleOutput"]),
                        "starterCode": db_payload.get("starterCode", payload["starterCode"]),
                        "question": db_payload.get("question", ""),
                        "options": db_payload.get("options", []),
                        "correctOption": db_payload.get("correctOption", ""),
                    })

                assessments.append(payload)

            return {
                "success": True,
                "assessments": assessments,
            }
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(error),
            },
        )


@app.get("/{path_name:path}")
async def serve_static(path_name: str):
    """Serve static files (CSS, JS, images, etc.) from public directory"""
    public_dir = os.path.join(os.path.dirname(__file__), "public")
    file_path = os.path.join(public_dir, path_name)
    # Security: prevent directory traversal
    if os.path.abspath(file_path).startswith(os.path.abspath(public_dir)) and os.path.exists(file_path):
        return FileResponse(file_path)
    # Return index.html for SPA routing (any unmatched route)
    return FileResponse(os.path.join(public_dir, "index.html"))
