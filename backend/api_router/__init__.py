from fastapi import APIRouter

from .ai import router as ai_router
from .learning import router as learning_router
from .users import router as users_router

api_router = APIRouter()
api_router.include_router(users_router)
api_router.include_router(ai_router)
api_router.include_router(learning_router)
