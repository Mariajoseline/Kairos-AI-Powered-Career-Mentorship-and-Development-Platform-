from typing import Optional, Dict, List
from datetime import datetime
import pytesseract
from PIL import Image
import io
import ollama
from pydantic import BaseModel, validator
from fastapi import UploadFile, HTTPException
import logging
import re

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

class InterviewStartRequest(BaseModel):
    topic: str
    difficulty: str = "medium"
    use_resume: bool = False
    timestamp: datetime
    
    @validator('difficulty')
    def validate_difficulty(cls, v):
        if v not in ["easy", "medium", "hard"]:
            raise ValueError("Difficulty must be 'easy', 'medium', or 'hard'")
        return v

class ResumeData(BaseModel):
    user_id: str
    original_filename: str
    raw_text: str
    structured_data: Dict
    processed_at: datetime

def parse_llm_response(response_text: str) -> Dict:
    """Parse the LLM response into structured resume data"""
    structured_data = {
        "skills": [],
        "experience": [],
        "education": [],
        "certifications": [],
        "projects": []
    }
    
    # Simple parsing logic - in production you'd want more robust parsing
    lines = response_text.split('\n')
    current_section = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detect section headers
        if line.lower().startswith("- skills"):
            current_section = "skills"
        elif line.lower().startswith("- experience"):
            current_section = "experience"
        elif line.lower().startswith("- education"):
            current_section = "education"
        elif line.lower().startswith("- certifications"):
            current_section = "certifications"
        elif line.lower().startswith("- projects"):
            current_section = "projects"
        elif current_section and line.startswith("- "):
            # Add item to current section
            item = line[2:].strip()
            if current_section in structured_data:
                structured_data[current_section].append(item)
    
    return structured_data

async def structure_resume_with_llm(raw_text: str) -> Dict:
    """
    Use LLM to extract structured data from raw resume text
    
    Args:
        raw_text: Extracted text from resume
    
    Returns:
        Structured resume data as dict
    """
    prompt = f"""Extract the following from this resume:
    - Skills (technical and soft skills)
    - Experience (company, role, duration)
    - Education (degree, institution, year)
    - Certifications (name, issuer, year)
    - Projects (name, description, technologies used)
    
    Return the information in a structured format with clear section headings.
    
    Resume Text:
    {raw_text}
    """
    
    try:
        response = ollama.chat(
            model="llava:13b",  # or your preferred model
            messages=[{"role": "user", "content": prompt}]
        )
        return parse_llm_response(response['message']['content'])
    except Exception as e:
        logger.error(f"LLM resume processing failed: {str(e)}")
        return {
            "skills": [],
            "experience": [],
            "education": [],
            "certifications": [],
            "projects": [],
            "error": "Failed to fully structure resume data"
        }

async def process_resume(file: UploadFile, user_id: str, overwrite: bool = False) -> ResumeData:
    """
    Process uploaded resume file (PDF or image) and extract structured data
    
    Args:
        file: Uploaded resume file
        user_id: ID of the user uploading the resume
        overwrite: Whether to overwrite existing resume data
    
    Returns:
        Structured ResumeData object
    """
    try:
        # Validate file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max size is {MAX_FILE_SIZE/1024/1024}MB"
            )
        file.file.seek(0)  # Reset file pointer
        
        # Read file content
        contents = await file.read()
        
        # Process based on file type
        if file.filename.lower().endswith('.pdf'):
            # For PDFs, we'd normally use a PDF parser like PyPDF2
            # This is a simplified version that just extracts text
            raw_text = "PDF processing would extract text here"
        else:
            # For images, use OCR
            image = Image.open(io.BytesIO(contents))
            raw_text = pytesseract.image_to_string(image)
        
        # Structure the resume data using LLM
        structured_data = await structure_resume_with_llm(raw_text)
        
        # Create ResumeData object
        resume = ResumeData(
            user_id=user_id,
            original_filename=file.filename,
            raw_text=raw_text,
            structured_data=structured_data,
            processed_at=datetime.now()
        )
        
        # Here you would typically save to database
        # For now we'll just return the processed data
        return resume
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process resume: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process resume"
        )

async def start_interview(request: InterviewStartRequest) -> Dict:
    """
    Initialize a new interview session with the given parameters
    
    Args:
        request: InterviewStartRequest containing topic, difficulty, etc.
    
    Returns:
        Dictionary with initial question and session info
    """
    try:
        # Build the prompt based on request parameters
        prompt = f"Begin a {request.difficulty} level interview about {request.topic}."
        if request.use_resume:
            # In a real implementation, you would fetch resume data here
            prompt += "\nAssume the candidate has relevant background for this field."
        
        prompt += "\nAsk the first question only, without any additional commentary."
        
        # Generate question using Ollama
        response = ollama.chat(
            model="llava:7b",  # or your preferred model
            messages=[{"role": "user", "content": prompt}]
        )
        
        return {
            "question": response['message']['content'],
            "topic": request.topic,
            "difficulty": request.difficulty,
            "timestamp": request.timestamp.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to start interview: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to start interview session"
        )