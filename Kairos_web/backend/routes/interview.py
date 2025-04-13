from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Optional
from datetime import datetime
import os
from services.interview_service import (
    start_interview,
    process_resume,
    InterviewStartRequest,
    MAX_FILE_SIZE
)
from models import InterviewSession

router = APIRouter(tags=["Interview"])

@router.post("/start", response_model=InterviewSession)
async def start_interview_route(
    topic: str, 
    difficulty: str = "medium",
    use_resume: bool = False
):
    """
    Start a new interview session
    
    - **topic**: Interview topic (e.g., "Python", "Data Science")
    - **difficulty**: "easy", "medium", or "hard"
    - **use_resume**: Whether to use resume data if available
    """
    try:
        request = InterviewStartRequest(
            topic=topic,
            difficulty=difficulty,
            use_resume=use_resume,
            timestamp=datetime.now()
        )
        return await start_interview(request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start interview session"
        )

@router.post("/upload-resume")
async def upload_resume_route(
    file: UploadFile = File(...),
    overwrite: bool = False
):
    """
    Upload and process a resume file
    
    - **file**: PDF or image file containing resume
    - **overwrite**: Replace existing resume data if True
    """
    try:
        # Validate file size
        file.file.seek(0, 2)
        file_size = file.file.tell()
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size is {MAX_FILE_SIZE/1024/1024}MB"
            )
        file.file.seek(0)
        
        # Validate file type
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ['.pdf', '.jpg', '.jpeg', '.png']:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Unsupported file type. Please upload PDF, JPG, or PNG"
            )
        
        return await process_resume(file, overwrite)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process resume"
        )