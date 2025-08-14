import databutton as db
import asyncpg
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import datetime

from app.auth import AuthorizedUser

router = APIRouter()

# --- Pydantic Models ---
class Badge(BaseModel):
    id: int
    skill_name: str
    skill_level: str
    issued_at: datetime.datetime

class IssueBadgeRequest(BaseModel):
    assessment_id: int

# --- Database Connection ---
async def get_db_connection():
    try:
        return await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
    except Exception as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Could not connect to the database.")

# --- Helper Functions ---
def get_level_from_score(score: int) -> str:
    if score >= 90: return "Expert"
    if score >= 75: return "Advanced"
    if score >= 50: return "Working"
    return "Foundational"

# --- API Endpoints ---
@router.post("/badges/issue", response_model=Badge, status_code=201)
async def issue_badge(request: IssueBadgeRequest, user: AuthorizedUser):
    """Issues a new badge for a completed and passed assessment."""
    conn = await get_db_connection()
    try:
        async with conn.transaction():
            # 1. Verify the assessment exists, belongs to the user, is completed, and has a passing score
            assessment = await conn.fetchrow(
                """
                SELECT id, user_id, skill_name, score FROM assessments
                WHERE id = $1 AND user_id = $2 AND status = 'completed'
                """,
                request.assessment_id,
                user.sub,
            )
            if not assessment:
                raise HTTPException(status_code=404, detail="Valid, completed assessment not found.")
            
            score = assessment['score']
            if score < 50: # Assuming 50 is the passing score
                raise HTTPException(status_code=400, detail="Assessment was not passed.")

            # 2. Check if a badge has already been issued for this assessment
            existing_badge = await conn.fetchval(
                "SELECT 1 FROM badges WHERE assessment_id = $1", request.assessment_id
            )
            if existing_badge:
                raise HTTPException(status_code=409, detail="A badge has already been issued for this assessment.")

            # 3. Create the badge
            skill_level = get_level_from_score(score)
            new_badge = await conn.fetchrow(
                """
                INSERT INTO badges (user_id, assessment_id, skill_name, skill_level, signed_vc_jwt)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, skill_name, skill_level, issued_at
                """,
                user.sub,
                request.assessment_id,
                assessment['skill_name'],
                skill_level,
                f"placeholder_jwt_for_assessment_{request.assessment_id}" # Placeholder JWT
            )
            return Badge(**new_badge)
    finally:
        await conn.close()

@router.get("/badges", response_model=List[Badge])
async def get_user_badges(user: AuthorizedUser):
    """Retrieves all badges for the authenticated user."""
    conn = await get_db_connection()
    try:
        badges = await conn.fetch(
            "SELECT id, skill_name, skill_level, issued_at FROM badges WHERE user_id = $1 ORDER BY issued_at DESC",
            user.sub
        )
        return [Badge(**badge) for badge in badges]
    finally:
        await conn.close()
