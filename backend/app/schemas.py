"""
Pydantic schemas for request/response validation.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

# ============= Auth Schemas =============

class LoginRequest(BaseModel):
    """Login request schema"""
    user: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token data schema"""
    user_id: int
    username: str


# ============= User Schemas =============

class UserBase(BaseModel):
    """User base schema"""
    user: str


class UserCreate(UserBase):
    """User creation schema"""
    password: str


class UserResponse(UserBase):
    """User response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    uid: str
    created_at: datetime


# ============= File Schemas =============

class FileBase(BaseModel):
    """File base schema"""
    absolute_path: str
    url: Optional[str] = None


class FileCreate(FileBase):
    """File creation schema"""
    user_id: int


class FileResponse(FileBase):
    """File response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    uid: str
    user_id: int
    created_at: datetime


class FilePublicResponse(BaseModel):
    """Public file response schema (no user_id)"""
    model_config = ConfigDict(from_attributes=True)
    
    uid: str
    absolute_path: str
    url: Optional[str] = None
    created_at: datetime


# ============= Response Schemas =============

class ResponseBase(BaseModel):
    """Response base schema"""
    question: str
    response: str
    probability_percentage: Optional[int] = None


class ResponseCreate(ResponseBase):
    """Response creation schema"""
    user_id: int


class ResponseResponse(ResponseBase):
    """Response response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    uid: str
    user_id: int
    created_at: datetime


class ResponsePublicResponse(BaseModel):
    """Public response schema (no user_id)"""
    model_config = ConfigDict(from_attributes=True)
    
    uid: str
    question: str
    response: str
    probability_percentage: Optional[int] = None
    created_at: datetime


# ============= Request Schemas =============

class AIRequestSchema(BaseModel):
    """AI request schema"""
    question: Optional[str] = Field(None, min_length=1, max_length=5000)
    prompt: Optional[str] = Field(None, min_length=1, max_length=5000)
    
    @property
    def query_text(self) -> str:
        """Get the query text, prioritizing 'question' over 'prompt'"""
        return self.question or self.prompt or ""
    
    def model_post_init(self, __context) -> None:
        """Validate that at least one field is provided"""
        if not self.question and not self.prompt:
            raise ValueError("Either 'question' or 'prompt' field is required")


class AIResponseSchema(BaseModel):
    """AI response schema"""
    question: str
    response: str
    probability_percentage: Optional[int] = None
    created_at: datetime


# ============= Upload Schemas =============

class UploadResponse(BaseModel):
    """Upload response schema"""
    success: bool
    message: str
    file_uid: Optional[str] = None
    url: Optional[str] = None


# ============= Generic Schemas =============

class MessageResponse(BaseModel):
    """Generic message response"""
    message: str


class ErrorResponse(BaseModel):
    """Error response schema"""
    detail: str
