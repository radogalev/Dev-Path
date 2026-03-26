from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ai_logic import ai_router, AIProvider

router = APIRouter()


class CodingChallengeDescriptionPayload(BaseModel):
    description: str


@router.get("/")
async def root():
    return {
        "status": "running",
        "ai_provider": AIProvider.provider
    }


@router.post("/dashboard-coding-challenge")
async def receive_dashboard_coding_challenge(payload: CodingChallengeDescriptionPayload):
    try:
        ai_result = ai_router.solve(payload.description)
        return {
            "success": True,
            "message": "Coding challenge description received",
            "description": payload.description,
            "ai_response": ai_result,
        }
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(error),
            },
        )
