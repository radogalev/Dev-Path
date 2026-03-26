from datetime import datetime, timedelta, timezone
import os
import uuid

from argon2 import PasswordHasher
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import sessionmaker

from db.models.applications import UserApplication
from db.models.db_config import engine
from db.models.jobs import Job
from db.models.users import User
from mailjet import send_verification_email

router = APIRouter()

SessionLocal = sessionmaker(bind=engine)


class UserSignIn(BaseModel):
    fullName: str
    email: str
    password: str
    confirmPassword: str
    selectedPath: str = ""


class UserLogin(BaseModel):
    email: str
    password: str


class UpdateLecturePayload(BaseModel):
    userId: int
    currentLecture: int


class ApplicationSubmitPayload(BaseModel):
    userId: int
    jobId: int
    fullName: str
    email: str
    phone: str
    yearsExperience: str
    startDate: str
    resume: str | None = None
    coverLetter: str


class UpdateStreakPayload(BaseModel):
    userId: int


ph = PasswordHasher(
    time_cost=int(os.getenv("ARGON2_TIME_COST", "2")),
    memory_cost=int(os.getenv("ARGON2_MEMORY_COST", "19456")),
    parallelism=int(os.getenv("ARGON2_PARALLELISM", "1")),
)


def get_valid_streak(user):
    if not user.last_active_date:
        return 0
    today = datetime.now(timezone.utc).date()
    if user.last_active_date == today or user.last_active_date == today - timedelta(days=1):
        return user.streak_count or 0
    return 0


def user_dict(user):
    return {
        "id": user.id,
        "fullName": user.full_name,
        "email": user.email,
        "isAdmin": user.is_admin,
        "selectedPath": user.selected_path,
        "currentLecture": user.current_lecture,
        "isFirstLogin": user.is_first_login,
        "streakCount": get_valid_streak(user),
        "lastActiveDate": str(user.last_active_date) if user.last_active_date else None,
        "isVerified": user.is_verified,
    }


def get_frontend_base_url() -> str:
    return os.getenv("FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")


@router.post("/signin")
def sign_in(data: UserSignIn):
    if data.password != data.confirmPassword:
        return {"message": "Passwords do not match"}

    normalized_email = (data.email or "").strip().lower()

    with SessionLocal() as session:
        existing_user = session.query(User).filter_by(email=normalized_email).first()
        if existing_user:
            return {"success": False, "message": "Email is already registered"}

        hashed_password = ph.hash(data.password)
        verification_token = str(uuid.uuid4())

        new_user = User(
            full_name=data.fullName,
            email=normalized_email,
            password=hashed_password,
            is_admin=None,
            selected_path=None,
            current_lecture=1,
            is_first_login=True,
            is_verified=False,
            verification_token=verification_token,
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        # Send verification email
        try:
            frontend_base_url = get_frontend_base_url()
            verification_link = f"{frontend_base_url}/verify-email?token={verification_token}"
            send_verification_email(
                user_email=normalized_email,
                user_name=data.fullName,
                verification_link=verification_link
            )
        except Exception as e:
            print(f"Error sending verification email: {e}")
            return {
                "success": False,
                "message": "Account created but verification email could not be sent. Please contact support."
            }
    
    return {
        "message": "Sign up successful! Please check your email to verify your account.",
        "user": user_dict(new_user),
    }


@router.post("/login")
def login(data: UserLogin):
    normalized_email = (data.email or "").strip().lower()

    with SessionLocal() as session:
        user = session.query(User).filter_by(email=normalized_email).first()

    if not user:
        return {"success": False, "message": "Invalid email or password"}
    
    if not user.is_verified:
        return {"success": False, "message": "Please verify your email before logging in"}

    try:
        if ph.verify(user.password, data.password):
            return {
                "success": True,
                "message": "Login successful",
                "user": user_dict(user),
            }
    except Exception:
        return {"success": False, "message": "Invalid email or password"}

    return {"success": False, "message": "Invalid email or password"}


@router.get("/user/{user_id}")
def get_user(user_id: int):
    with SessionLocal() as session:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return {"success": False, "message": "User not found"}

        return {
            "success": True,
            "user": user_dict(user),
        }


@router.post("/update-path")
def update_path(data: dict):
    user_id = data.get("userId")
    selected_path = data.get("selectedPath")

    with SessionLocal() as session:
        user = session.query(User).filter_by(id=user_id).first()
        if user:
            user.selected_path = selected_path
            user.is_first_login = False
            user.current_lecture = 1
            session.commit()
            session.refresh(user)
            return {
                "success": True,
                "message": "Path updated successfully",
                "user": user_dict(user),
            }
        return {"success": False, "message": "User not found"}


@router.post("/update-lecture")
def update_lecture(data: UpdateLecturePayload):
    with SessionLocal() as session:
        user = session.query(User).filter_by(id=data.userId).first()
        if not user:
            return {"success": False, "message": "User not found"}

        requested_lecture = max(1, int(data.currentLecture))
        user.current_lecture = max(user.current_lecture or 1, requested_lecture)
        session.commit()
        session.refresh(user)

        return {
            "success": True,
            "message": "Lecture progress updated",
            "user": user_dict(user),
        }


@router.post("/update-streak")
def update_streak(data: UpdateStreakPayload):
    user_id = data.userId

    with SessionLocal() as session:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return {"success": False, "message": "User not found"}

        today = datetime.now(timezone.utc).date()
        yesterday = today - timedelta(days=1)

        if user.last_active_date == today:
            return {
                "success": True,
                "streakCount": user.streak_count,
                "lastActiveDate": str(user.last_active_date),
            }

        if user.last_active_date == yesterday:
            user.streak_count = (user.streak_count or 0) + 1
        else:
            user.streak_count = 1

        user.last_active_date = today
        session.commit()
        session.refresh(user)

        return {
            "success": True,
            "streakCount": user.streak_count,
            "lastActiveDate": str(user.last_active_date),
        }


@router.post("/applications")
def submit_application(payload: ApplicationSubmitPayload):
    with SessionLocal() as session:
        user = session.query(User).filter_by(id=payload.userId).first()
        if not user:
            return {"success": False, "message": "User not found"}

        job = session.query(Job).filter_by(id=payload.jobId, is_active=True).first()
        if not job:
            return {"success": False, "message": "Job not found"}

        existing = (
            session.query(UserApplication)
            .filter_by(user_id=payload.userId, job_id=payload.jobId, is_active=True)
            .first()
        )
        if existing:
            return {
                "success": False,
                "message": "You already submitted an application for this job",
            }

        application = UserApplication(
            user_id=payload.userId,
            job_id=payload.jobId,
            full_name=payload.fullName.strip(),
            email=payload.email.strip().lower(),
            phone=payload.phone.strip(),
            years_experience=payload.yearsExperience.strip(),
            start_date=payload.startDate.strip(),
            resume=(payload.resume or "").strip() or None,
            cover_letter=payload.coverLetter.strip(),
            status="submitted",
            is_active=True,
        )
        session.add(application)
        session.commit()
        session.refresh(application)

        return {
            "success": True,
            "message": "Application submitted",
            "application": {
                "id": application.id,
                "userId": application.user_id,
                "jobId": application.job_id,
                "status": application.status,
                "submittedAt": str(application.submitted_at) if application.submitted_at else None,
            },
        }


@router.get("/user/{user_id}/applications")
def get_user_applications(user_id: int):
    with SessionLocal() as session:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return {"success": False, "message": "User not found"}

        applications = (
            session.query(UserApplication, Job)
            .join(Job, Job.id == UserApplication.job_id)
            .filter(UserApplication.user_id == user_id, UserApplication.is_active == True)
            .order_by(UserApplication.submitted_at.desc())
            .all()
        )

        return {
            "success": True,
            "applications": [
                {
                    "id": app.id,
                    "jobId": app.job_id,
                    "status": app.status,
                    "submittedAt": str(app.submitted_at) if app.submitted_at else None,
                    "job": {
                        "title": job.title,
                        "company": job.company,
                        "location": job.location,
                    },
                }
                for app, job in applications
            ],
        }


@router.get("/api/verify-email")
def verify_email(token: str, request: Request):
    """
    Verify user's email using the verification token.
    """
    # If a user opens the API URL directly in a browser, redirect to the SPA route.
    # Frontend fetch/XHR requests still receive JSON.
    accept = (request.headers.get("accept") or "").lower()
    sec_fetch_dest = (request.headers.get("sec-fetch-dest") or "").lower()
    sec_fetch_mode = (request.headers.get("sec-fetch-mode") or "").lower()
    is_browser_navigation = (
        "text/html" in accept
        or sec_fetch_dest == "document"
        or sec_fetch_mode == "navigate"
    )
    if is_browser_navigation:
        return RedirectResponse(
            url=f"{get_frontend_base_url()}/verify-email?token={token}",
            status_code=307,
        )

    if not token:
        return {"success": False, "message": "Invalid verification token"}
    
    with SessionLocal() as session:
        user = session.query(User).filter_by(verification_token=token).first()
        
        if not user:
            return {"success": False, "message": "Invalid or expired verification token"}
        
        if user.is_verified:
            return {"success": True, "message": "Email already verified"}
        
        user.is_verified = True
        user.verification_token = None
        session.commit()
        session.refresh(user)
        
        return {
            "success": True,
            "message": "Email verified successfully! You can now log in.",
            "user": user_dict(user),
        }
