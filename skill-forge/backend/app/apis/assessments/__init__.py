import databutton as db
import asyncpg
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.auth import AuthorizedUser

router = APIRouter()

# --- In-Memory Question Bank ---
QUESTION_BANK = {
    "javascript": [
        {
            "question_text": "What is the output of `typeof null` in JavaScript?",
            "options": ["'object'", "'null'", "'undefined'", "'number'"],
            "correct_answer_index": 0,
        },
        {
            "question_text": "Which company developed JavaScript?",
            "options": ["Microsoft", "Apple", "Netscape", "Sun Microsystems"],
            "correct_answer_index": 2,
        },
    ],
    "python": [
        {
            "question_text": "What is the data type of the result of `6 / 2` in Python 3?",
            "options": ["int", "float", "str", "list"],
            "correct_answer_index": 1,
        },
        {
            "question_text": "How do you start a single-line comment in Python?",
            "options": ["//", "/*", "#", "<!--"],
            "correct_answer_index": 2,
        },
    ],
    "sql": [
        {
            "question_text": "Which SQL statement is used to extract data from a database?",
            "options": ["GET", "SELECT", "EXTRACT", "OPEN"],
            "correct_answer_index": 1,
        },
        {
            "question_text": "Which SQL keyword is used to sort the result-set?",
            "options": ["SORT BY", "ORDER", "SORT", "ORDER BY"],
            "correct_answer_index": 3,
        }
    ]
}


# --- Pydantic Models ---
class AssessmentQuestion(BaseModel):
    id: int
    question_text: str
    options: List[str]

class AssessmentState(BaseModel):
    id: int
    status: str
    skill_name: str
    score: Optional[int] = None
    next_question: Optional[AssessmentQuestion] = None

class StartAssessmentRequest(BaseModel):
    skill_name: str

class SubmitAnswerRequest(BaseModel):
    question_id: int
    answer_index: int


# --- Database Connection ---
async def get_db_connection():
    try:
        conn = await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Could not connect to the database.")


# --- API Endpoints ---
@router.post("/assessments", response_model=AssessmentState, status_code=201)
async def start_assessment(request: StartAssessmentRequest, user: AuthorizedUser):
    """Starts a new assessment for a given skill."""
    skill_name = request.skill_name
    if skill_name not in QUESTION_BANK:
        raise HTTPException(status_code=404, detail="No assessment available for this skill.")

    questions = QUESTION_BANK[skill_name]
    conn = await get_db_connection()
    try:
        async with conn.transaction():
            # Create the main assessment record
            assessment_record = await conn.fetchrow(
                "INSERT INTO assessments (user_id, skill_name) VALUES ($1, $2) RETURNING id, status, skill_name",
                user.sub,
                skill_name,
            )
            assessment_id = assessment_record['id']

            # Add questions to the assessment_items table
            for q in questions:
                await conn.execute(
                    """
                    INSERT INTO assessment_items (assessment_id, question_text, options, correct_answer_index)
                    VALUES ($1, $2, $3, $4)
                    """,
                    assessment_id,
                    q["question_text"],
                    str(q["options"]),  # Storing as JSON string
                    q["correct_answer_index"],
                )

        first_question_record = await conn.fetchrow(
            "SELECT id, question_text, options FROM assessment_items WHERE assessment_id = $1 ORDER BY id ASC LIMIT 1",
            assessment_id
        )

        return AssessmentState(
            id=assessment_id,
            status=assessment_record['status'],
            skill_name=assessment_record['skill_name'],
            next_question=AssessmentQuestion(
                id=first_question_record['id'],
                question_text=first_question_record['question_text'],
                options=first_question_record['options']
            )
        )
    finally:
        await conn.close()

@router.get("/assessments/{assessment_id}", response_model=AssessmentState)
async def get_assessment_state(assessment_id: int, user: AuthorizedUser):
    """Gets the current state of an assessment."""
    conn = await get_db_connection()
    try:
        assessment_record = await conn.fetchrow(
            "SELECT id, user_id, status, skill_name, score FROM assessments WHERE id = $1", assessment_id
        )
        if not assessment_record or assessment_record['user_id'] != user.sub:
            raise HTTPException(status_code=404, detail="Assessment not found.")

        if assessment_record['status'] == 'completed':
            return AssessmentState(
                id=assessment_record['id'],
                status=assessment_record['status'],
                skill_name=assessment_record['skill_name'],
                score=assessment_record['score'],
            )

        next_question_record = await conn.fetchrow(
            """
            SELECT id, question_text, options FROM assessment_items
            WHERE assessment_id = $1 AND user_answer_index IS NULL
            ORDER BY id ASC LIMIT 1
            """,
            assessment_id
        )

        return AssessmentState(
            id=assessment_record['id'],
            status=assessment_record['status'],
            skill_name=assessment_record['skill_name'],
            next_question=AssessmentQuestion(
                id=next_question_record['id'],
                question_text=next_question_record['question_text'],
                options=next_question_record['options']
            ) if next_question_record else None,
        )
    finally:
        await conn.close()


@router.post("/assessments/{assessment_id}/response", response_model=AssessmentState)
async def submit_answer(assessment_id: int, request: SubmitAnswerRequest, user: AuthorizedUser):
    """Submits an answer for a question in an assessment."""
    conn = await get_db_connection()
    try:
        async with conn.transaction():
            # Verify the assessment belongs to the user and is in progress
            assessment_record = await conn.fetchrow(
                "SELECT id, user_id FROM assessments WHERE id = $1 AND status = 'inprogress'", assessment_id
            )
            if not assessment_record or assessment_record['user_id'] != user.sub:
                raise HTTPException(status_code=404, detail="Active assessment not found.")

            # Get the question and check if it has already been answered
            question_record = await conn.fetchrow(
                "SELECT correct_answer_index, user_answer_index FROM assessment_items WHERE id = $1 AND assessment_id = $2",
                request.question_id, assessment_id
            )
            if not question_record or question_record['user_answer_index'] is not None:
                raise HTTPException(status_code=400, detail="Question not found or already answered.")

            # Update the user's answer
            is_correct = request.answer_index == question_record['correct_answer_index']
            await conn.execute(
                "UPDATE assessment_items SET user_answer_index = $1, is_correct = $2 WHERE id = $3",
                request.answer_index, is_correct, request.question_id
            )

            # Check for the next question
            next_question_record = await conn.fetchrow(
                """
                SELECT id, question_text, options FROM assessment_items
                WHERE assessment_id = $1 AND user_answer_index IS NULL
                ORDER BY id ASC LIMIT 1
                """,
                assessment_id
            )

            if not next_question_record:
                # Assessment is complete, calculate score
                total_questions = await conn.fetchval("SELECT COUNT(*) FROM assessment_items WHERE assessment_id = $1", assessment_id)
                correct_answers = await conn.fetchval("SELECT COUNT(*) FROM assessment_items WHERE assessment_id = $1 AND is_correct = true", assessment_id)
                score = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0

                await conn.execute(
                    "UPDATE assessments SET status = 'completed', score = $1, completed_at = NOW() WHERE id = $2",
                    score, assessment_id
                )
                
                final_state = await get_assessment_state(assessment_id, user)
                return final_state
            
        # Return the new state with the next question
        current_state = await get_assessment_state(assessment_id, user)
        return current_state
    finally:
        await conn.close()
