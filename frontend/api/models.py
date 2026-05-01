"""Pydantic models for JudgeAI request/response validation."""

from pydantic import BaseModel
from typing import Optional


class ConfidenceScores(BaseModel):
    case_number: str = "low"
    date: str = "low"
    directions: str = "low"
    deadline: str = "low"


class ExtractedData(BaseModel):
    """Data returned by Gemini after PDF extraction."""
    case_number: str = ""
    date: str = ""
    petitioner: str = ""
    respondent: str = ""
    directions: list[str] = []
    deadline: str = ""
    department: str = ""
    confidence: ConfidenceScores = ConfidenceScores()


class ApproveRequest(BaseModel):
    """Human-reviewed data submitted for approval."""
    case_number: str
    date: str
    petitioner: str
    respondent: str
    directions: list[str]
    deadline: str
    department: str
    reviewer_name: str
    # Original AI-extracted values for audit trail
    ai_original: Optional[ExtractedData] = None


class ApproveResponse(BaseModel):
    message: str
    record_id: str


class AuditEntry(BaseModel):
    field_name: str
    ai_value: str
    human_value: str
    changed: bool


class AuditLogResponse(BaseModel):
    case_number: str
    reviewer_name: str
    approved_at: str
    entries: list[AuditEntry]
