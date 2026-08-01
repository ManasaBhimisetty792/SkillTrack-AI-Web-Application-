"""
notifications.py — FastAPI router for in-app notification management.
Handles CRUD for the Supabase `notifications` table and triggers
SMTP emails via email_service where appropriate.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
import os

from app.database.session import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user import Profile
from app.services.email_service import (
    send_registration_email,
    send_interview_scheduled_email,
    send_interview_cancelled_email,
    send_interview_completed_email,
    send_resume_uploaded_email,
    send_payment_success_email,
    send_profile_updated_email,
    send_feedback_submitted_email,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────────────────────────────────────────

class SendEmailRequest(BaseModel):
    event: str = Field(..., description=(
        "Email event type. One of: registration, interview_scheduled, "
        "interview_cancelled, interview_completed, resume_uploaded, "
        "payment_success, profile_updated, feedback_submitted"
    ))
    to_email: str
    name: str
    # Optional fields used by specific events
    recruiter_name: Optional[str] = None
    interview_date: Optional[str] = None
    interview_type: Optional[str] = "Mock Interview"
    reason: Optional[str] = None
    score: Optional[str] = None
    resume_name: Optional[str] = None
    plan_name: Optional[str] = None
    amount: Optional[str] = None
    payment_id: Optional[str] = None
    role: Optional[str] = "student"


class EmailResponse(BaseModel):
    success: bool
    message: str


# ─────────────────────────────────────────────────────────────────────────────
# Email Trigger Endpoint
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/send-email",
    response_model=EmailResponse,
    status_code=status.HTTP_200_OK,
    summary="Trigger a transactional email for a platform event"
)
def trigger_email(
    req: SendEmailRequest,
    current_user: Profile = Depends(get_current_user),
):
    """
    Trigger a transactional email notification for a specific platform event.
    Requires authentication. Maps event types to branded HTML email templates.
    """
    dispatchers = {
        "registration": lambda: send_registration_email(
            req.to_email, req.name, req.role or "student"
        ),
        "interview_scheduled": lambda: send_interview_scheduled_email(
            req.to_email, req.name,
            req.recruiter_name or "Recruiter",
            req.interview_date or "TBD",
            req.interview_type or "Mock Interview"
        ),
        "interview_cancelled": lambda: send_interview_cancelled_email(
            req.to_email, req.name,
            req.recruiter_name or "Recruiter",
            req.reason
        ),
        "interview_completed": lambda: send_interview_completed_email(
            req.to_email, req.name,
            req.recruiter_name or "Recruiter",
            req.score
        ),
        "resume_uploaded": lambda: send_resume_uploaded_email(
            req.to_email, req.name,
            req.resume_name or "Resume"
        ),
        "payment_success": lambda: send_payment_success_email(
            req.to_email, req.name,
            req.plan_name or "Premium Plan",
            req.amount or "₹0",
            req.payment_id or "N/A"
        ),
        "profile_updated": lambda: send_profile_updated_email(
            req.to_email, req.name
        ),
        "feedback_submitted": lambda: send_feedback_submitted_email(
            req.to_email, req.name
        ),
    }

    handler = dispatchers.get(req.event)
    if not handler:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown event type '{req.event}'. Valid events: {list(dispatchers.keys())}"
        )

    success = handler()
    if success:
        return EmailResponse(success=True, message=f"Email sent for event '{req.event}'")
    else:
        return EmailResponse(
            success=False,
            message="Email could not be sent. Check SMTP configuration in environment variables."
        )


# ─────────────────────────────────────────────────────────────────────────────
# SMTP Health Check (Admin Only)
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/email-config-status",
    summary="Check if SMTP email is configured"
)
def email_config_status(current_user: Profile = Depends(get_current_user)):
    """Returns whether SMTP credentials are configured (does not reveal values)."""
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = os.getenv("SMTP_PORT", "587")

    configured = bool(smtp_user and smtp_password)

    return {
        "configured": configured,
        "smtp_host": smtp_host,
        "smtp_port": smtp_port,
        "smtp_user_set": bool(smtp_user),
        "smtp_password_set": bool(smtp_password),
        "message": (
            "SMTP is configured and ready to send emails."
            if configured
            else "SMTP is NOT configured. Set SMTP_USER and SMTP_PASSWORD in your .env file."
        )
    }
