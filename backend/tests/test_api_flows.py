import os
from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

# Force test DB before importing app/db modules.
os.environ["DATABASE_URL"] = "sqlite:///./test_api.db"
os.environ["ADMIN_PANEL_KEY"] = "test-admin-key"
os.environ.setdefault("AI_PROVIDER", "google")
os.environ.setdefault("GEMINI_API_KEY", "test-key")

from db.models.applications import UserApplication
from db.models.db_config import Base, engine
from db.models.events import Event
from db.models.jobs import Job
from db.models.lessons import Lesson
from db.models.theory_results import UserTheoryTestResult
from db.models.users import User
from main import app


SessionLocal = sessionmaker(bind=engine)


def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def seed_basic_data():
    with SessionLocal() as session:
        user = User(
            full_name="Test User",
            email="test@example.com",
            password="hashed",
            selected_path="frontend",
            current_lecture=1,
            is_first_login=False,
        )
        session.add(user)

        job = Job(
            title="Frontend Developer",
            company="Acme",
            profession="frontend",
            location="Remote",
            description="Build UI",
            salary="$100k",
            job_type="full-time",
            date_posted=datetime.utcnow(),
            is_active=True,
        )
        session.add(job)

        lesson = Lesson(
            title="Intro",
            path="frontend",
            order=1,
            content="{}",
        )
        session.add(lesson)

        event = Event(
            title="Dev Meetup",
            description="Community meetup",
            date=datetime.utcnow(),
            location="Virtual",
            event_type="Workshop",
            is_free=True,
        )
        session.add(event)

        session.commit()
        session.refresh(user)
        session.refresh(job)

        return user.id, job.id


def test_admin_endpoint_requires_key():
    reset_db()
    client = TestClient(app)

    response = client.get("/admin/roadmaps")

    assert response.status_code == 401
    assert response.json()["success"] is False


def test_events_endpoint_returns_success_shape():
    reset_db()
    seed_basic_data()
    client = TestClient(app)

    response = client.get("/events")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert isinstance(body["events"], list)
    assert len(body["events"]) >= 1


def test_applications_submit_and_list_flow():
    reset_db()
    user_id, job_id = seed_basic_data()
    client = TestClient(app)

    submit = client.post(
        "/applications",
        json={
            "userId": user_id,
            "jobId": job_id,
            "fullName": "Test User",
            "email": "test@example.com",
            "phone": "+123456789",
            "yearsExperience": "1-3",
            "startDate": "2026-03-10",
            "resume": "https://example.com/resume",
            "coverLetter": "I am interested in this role.",
        },
    )

    assert submit.status_code == 200
    submit_body = submit.json()
    assert submit_body["success"] is True

    listing = client.get(f"/user/{user_id}/applications")

    assert listing.status_code == 200
    list_body = listing.json()
    assert list_body["success"] is True
    assert len(list_body["applications"]) == 1
    assert list_body["applications"][0]["jobId"] == job_id


def test_theory_result_persistence_updates_or_creates_result():
    reset_db()
    user_id, _ = seed_basic_data()
    client = TestClient(app)

    response = client.post(
        "/learning/progress/complete-theory-test",
        json={
            "userId": user_id,
            "pathId": "frontend",
            "lessonId": 1,
            "score": 3,
            "totalQuestions": 3,
            "passed": True,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["result"]["passed"] is True

    with SessionLocal() as session:
        saved = (
            session.query(UserTheoryTestResult)
            .filter_by(user_id=user_id, path_id="frontend", lesson_id=1)
            .first()
        )
        assert saved is not None
        assert saved.score == 3


def test_duplicate_application_is_rejected():
    reset_db()
    user_id, job_id = seed_basic_data()
    client = TestClient(app)

    payload = {
        "userId": user_id,
        "jobId": job_id,
        "fullName": "Test User",
        "email": "test@example.com",
        "phone": "+123456789",
        "yearsExperience": "1-3",
        "startDate": "2026-03-10",
        "resume": "",
        "coverLetter": "I am interested in this role.",
    }

    first = client.post("/applications", json=payload)
    second = client.post("/applications", json=payload)

    assert first.status_code == 200
    assert second.status_code == 200
    assert second.json()["success"] is False

    with SessionLocal() as session:
        count = session.query(UserApplication).filter_by(user_id=user_id, job_id=job_id).count()
        assert count == 1


def test_update_streak_increments_once_per_day_and_resets_after_gap():
    reset_db()
    user_id, _ = seed_basic_data()
    client = TestClient(app)

    today_utc = datetime.utcnow().date()

    with SessionLocal() as session:
        user = session.query(User).filter_by(id=user_id).first()
        user.streak_count = 3
        user.last_active_date = today_utc - timedelta(days=1)
        session.commit()

    first = client.post("/update-streak", json={"userId": user_id})
    second = client.post("/update-streak", json={"userId": user_id})

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["success"] is True
    assert first.json()["streakCount"] == 4
    assert second.json()["success"] is True
    assert second.json()["streakCount"] == 4

    with SessionLocal() as session:
        user = session.query(User).filter_by(id=user_id).first()
        user.streak_count = 9
        user.last_active_date = today_utc - timedelta(days=3)
        session.commit()

    reset = client.post("/update-streak", json={"userId": user_id})

    assert reset.status_code == 200
    assert reset.json()["success"] is True
    assert reset.json()["streakCount"] == 1
