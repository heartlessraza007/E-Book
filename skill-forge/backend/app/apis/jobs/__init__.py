

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import datetime
import asyncpg
import databutton as db
import json
from app.auth import AuthorizedUser

router = APIRouter()

# --- Pydantic Models ---
class Job(BaseModel):
    id: int
    org_id: int
    org_name: str
    title: str
    description: Optional[str]
    skill_graph_json: Optional[Dict[str, Any]]
    location_type: Optional[str]
    status: str
    created_at: datetime.datetime

class CreateJobRequest(BaseModel):
    org_id: int
    title: str
    description: Optional[str] = None
    skill_graph_json: Dict[str, Any] = Field(..., example={"javascript": "Advanced", "python": "Working"})
    location_type: str = "Remote"


# --- Database Connection ---
async def get_db_connection():
    try:
        return await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
    except Exception as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Could not connect to the database.")

# --- API Endpoints ---
@router.post("/jobs", response_model=Job, status_code=201)
async def create_job(request: CreateJobRequest, user: AuthorizedUser):
    """
    Creates a new job posting. 
    (Note: In a real app, this would be restricted to authorized recruiters/orgs)
    """
    conn = await get_db_connection()
    try:
        # For now, we allow any authenticated user to create a job for any org.
        # This would be locked down in a production environment.
        org_name = await conn.fetchval("SELECT name FROM orgs WHERE id = $1", request.org_id)
        if not org_name:
            raise HTTPException(status_code=404, detail=f"Organization with ID {request.org_id} not found.")

        job_id = await conn.fetchval(
            """
            INSERT INTO jobs (org_id, title, description, skill_graph_json, location_type, status)
            VALUES ($1, $2, $3, $4, $5, 'open')
            RETURNING id
            """,
            request.org_id,
            request.title,
            request.description,
            request.skill_graph_json,
            request.location_type
        )
        
        # Fetch the created job to return it
        new_job_record = await conn.fetchrow("SELECT *, (SELECT name FROM orgs WHERE id = jobs.org_id) as org_name FROM jobs WHERE id = $1", job_id)
        
        job_data = dict(new_job_record)
        if isinstance(job_data.get('skill_graph_json'), str):
            job_data['skill_graph_json'] = json.loads(job_data['skill_graph_json'])

        return Job(**job_data)
    finally:
        await conn.close()

@router.get("/jobs", response_model=List[Job])
async def list_jobs():
    """
    Lists all open job postings.
    """
    conn = await get_db_connection()
    try:
        jobs_records = await conn.fetch(
            """
            SELECT j.*, o.name as org_name 
            FROM jobs j
            JOIN orgs o ON j.org_id = o.id
            WHERE j.status = 'open'
            ORDER BY j.created_at DESC
            """
        )
        
        job_list = []
        for job_record in jobs_records:
            job_data = dict(job_record)
            if isinstance(job_data.get('skill_graph_json'), str):
                job_data['skill_graph_json'] = json.loads(job_data['skill_graph_json'])
            job_list.append(Job(**job_data))

        return job_list
    finally:
        await conn.close()
