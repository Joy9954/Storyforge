from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ContinuityIssue(BaseModel):
    issue_type: str  # "character_inconsistency", "timeline", "fact", "description"
    severity: str  # "critical", "warning", "info"
    location: str  # Chapter/section reference
    description: str
    instances: List[dict]  # Conflicting instances
    suggestion: Optional[str] = None

class ContinuityCheckRequest(BaseModel):
    story_id: str
    text: Optional[str] = None  # Full manuscript text

@router.post("/check", response_model=List[ContinuityIssue])
async def check_continuity(request: ContinuityCheckRequest):
    """
    Scan manuscript for continuity issues:
    - Character description inconsistencies
    - Timeline conflicts
    - Factual contradictions
    - Location/world-building conflicts
    """
    # TODO: Implement continuity checking logic
    return [
        ContinuityIssue(
            issue_type="character_inconsistency",
            severity="warning",
            location="Chapter 3, Chapter 7",
            description="Character 'Alice' described with blue eyes in Ch3, brown eyes in Ch7",
            instances=[
                {"chapter": 3, "text": "Alice's blue eyes sparkled"},
                {"chapter": 7, "text": "She looked up with her brown eyes"}
            ],
            suggestion="Choose one eye color and update the other instance"
        )
    ]

@router.get("/report/{story_id}")
async def get_continuity_report(story_id: str):
    """
    Get full continuity report for a story.
    """
    # TODO: Generate report from database
    return {
        "story_id": story_id,
        "issues": [],
        "summary": "No continuity issues found"
    }
