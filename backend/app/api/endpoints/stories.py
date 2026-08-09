from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()

class Story(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    characters: List[str] = []
    locations: List[str] = []
    plot_points: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Character(BaseModel):
    name: str
    description: str
    traits: List[str] = []
    appearances: List[int] = []  # Chapter/section numbers

# Temporary storage (will be replaced with database)
stories_db = {}

@router.post("/", response_model=Story)
async def create_story(story: Story):
    """Create a new story/manuscript"""
    story_id = f"story_{len(stories_db) + 1}"
    story.id = story_id
    story.created_at = datetime.now()
    story.updated_at = datetime.now()
    stories_db[story_id] = story
    return story

@router.get("/{story_id}", response_model=Story)
async def get_story(story_id: str):
    """Retrieve a story by ID"""
    if story_id not in stories_db:
        raise HTTPException(status_code=404, detail="Story not found")
    return stories_db[story_id]

@router.get("/")
async def list_stories():
    """List all stories"""
    return list(stories_db.values())

@router.put("/{story_id}", response_model=Story)
async def update_story(story_id: str, story: Story):
    """Update a story"""
    if story_id not in stories_db:
        raise HTTPException(status_code=404, detail="Story not found")
    story.updated_at = datetime.now()
    stories_db[story_id] = story
    return story

@router.delete("/{story_id}")
async def delete_story(story_id: str):
    """Delete a story"""
    if story_id not in stories_db:
        raise HTTPException(status_code=404, detail="Story not found")
    del stories_db[story_id]
    return {"message": "Story deleted"}
