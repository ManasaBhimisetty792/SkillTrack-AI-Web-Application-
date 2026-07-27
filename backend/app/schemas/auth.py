from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field


UserRole = Literal["student", "recruiter", "admin"]


class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = "student"


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="User password (min 8 chars)")


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[UserRole] = "student"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None
    email_verified: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
