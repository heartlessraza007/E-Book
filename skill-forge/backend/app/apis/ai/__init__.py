from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import databutton as db
from openai import OpenAI

# 1. Initialize router and OpenAI client
router = APIRouter()
# The API key is securely stored in Databutton secrets, not in the code.
client = OpenAI(api_key=db.secrets.get("OPENAI_API_KEY"), base_url="https://api.perplexity.ai")

# 2. Define Pydantic models for request and response
class AskAIRequest(BaseModel):
    messages: List[Dict[str, str]]

class AskAIResponse(BaseModel):
    content: str

# 3. Create the /ask-ai endpoint
@router.post("/ask-ai", response_model=AskAIResponse)
async def ask_ai(request: AskAIRequest):
    """
    Receives a conversation history and gets a response from an AI model.
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="The 'messages' field is required.")

    try:
        # 4. Call the OpenAI API
        completion = client.chat.completions.create(
            model="gpt-4o-mini",  # Using the specified model
            messages=request.messages,
        )
        
        ai_response = completion.choices[0].message.content
        return AskAIResponse(content=ai_response)

    except Exception as e:
        # 5. Handle potential errors from the API call
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Failed to get a response from the AI service.")
