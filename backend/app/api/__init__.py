from fastapi import APIRouter
from app.api.endpoints import stories, editor, continuity

router = APIRouter()

# Include endpoint routers
router.include_router(stories.router, prefix="/stories", tags=["stories"])
router.include_router(editor.router, prefix="/editor", tags=["editor"])
router.include_router(continuity.router, prefix="/continuity", tags=["continuity"])
