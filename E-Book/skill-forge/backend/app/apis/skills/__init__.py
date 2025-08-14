import databutton as db
import asyncpg
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.auth import AuthorizedUser

router = APIRouter()

# --- Pydantic Models ---
class Skill(BaseModel):
    name: str

class UserSkill(BaseModel):
    id: int
    skill_name: str
    skill_level: str

class AddUserSkillRequest(BaseModel):
    skill_name: str
    skill_level: str

# --- Seed Data ---
AVAILABLE_SKILLS = [
    "javascript",
    "python",
    "sql",
    "ui_design",
    "english_comm",
]

# --- Database Connection ---
async def get_db_connection():
    try:
        conn = await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Could not connect to the database.")

# --- API Endpoints ---
@router.get("/skills/available", response_model=List[Skill])
async def get_available_skills():
    """Returns a list of available skills to add."""
    return [{"name": skill} for skill in AVAILABLE_SKILLS]

@router.get("/skills/user", response_model=List[UserSkill])
async def get_user_skills(user: AuthorizedUser):
    """Fetches all skills for the authenticated user."""
    conn = await get_db_connection()
    try:
        rows = await conn.fetch(
            "SELECT id, skill_name, skill_level FROM user_skills WHERE user_id = $1 ORDER BY created_at DESC",
            user.sub
        )
        return [UserSkill(id=r['id'], skill_name=r['skill_name'], skill_level=r['skill_level']) for r in rows]
    finally:
        await conn.close()

@router.post("/skills/user", response_model=UserSkill, status_code=201)
async def add_user_skill(request: AddUserSkillRequest, user: AuthorizedUser):
    """Adds a new skill for the authenticated user."""
    conn = await get_db_connection()
    try:
        # Check for duplicates
        exists = await conn.fetchval(
            "SELECT 1 FROM user_skills WHERE user_id = $1 AND skill_name = $2",
            user.sub, request.skill_name
        )
        if exists:
            raise HTTPException(status_code=409, detail="Skill already exists for this user.")

        new_skill = await conn.fetchrow(
            "INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES ($1, $2, $3) RETURNING id, skill_name, skill_level",
            user.sub,
            request.skill_name,
            request.skill_level,
        )
        return UserSkill(id=new_skill['id'], skill_name=new_skill['skill_name'], skill_level=new_skill['skill_level'])
    finally:
        await conn.close()
