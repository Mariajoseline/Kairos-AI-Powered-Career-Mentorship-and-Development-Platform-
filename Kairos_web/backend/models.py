from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class InterviewSession(BaseModel):
    id: str
    user_id: str
    topic: str
    difficulty: Difficulty
    current_question: str
    questions_asked: List[str]
    created_at: datetime
    completed: bool = False

class ResumeData(BaseModel):
    user_id: str
    original_filename: str
    raw_text: str
    structured_data: dict
    processed_at: datetime
    version: int = 1