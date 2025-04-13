from fastapi import APIRouter, UploadFile, File
from services.chat_service import process_message, transcribe_audio
from typing import Optional

router = APIRouter()

@router.post("/send-message")
async def send_message(message: str, conversation_id: Optional[str] = None):
    """
    Process a text message and get AI response
    
    Parameters:
    - message: The user's message text
    - conversation_id: Optional conversation ID for context
    
    Returns:
    - AI response and conversation ID
    """
    return await process_message(message, conversation_id)

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Transcribe audio file to text
    
    Parameters:
    - file: Audio file in supported format (e.g., WAV, MP3)
    
    Returns:
    - Transcribed text
    """
    return await transcribe_audio(file)