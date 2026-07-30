"""
resume.py — FastAPI router for resume analysis
POST /api/v1/resume/analyze
"""

from fastapi import APIRouter, File, Form, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Optional

from app.services.resume_engine import analyze, load_document_bytes

router = APIRouter(prefix="/resume", tags=["Resume Analysis"])


@router.post("/analyze")
async def analyze_resume(
    resume_file: UploadFile = File(..., description="Candidate resume — PDF or DOCX"),
    jd_text: Optional[str] = Form(None, description="Job description pasted as plain text"),
    jd_file: Optional[UploadFile] = File(None, description="Job description file — PDF or DOCX"),
):
    """
    Analyse a resume against a job description.
    """
    allowed_types = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    }

    if not jd_text and not jd_file:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide a job description via jd_text or jd_file.",
        )

    try:
        resume_bytes = await resume_file.read()
        resume_text = load_document_bytes(resume_bytes, resume_file.filename or "resume.pdf")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not parse resume file: {exc}",
        )

    if not resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Resume file appears to be empty or unreadable.",
        )

    if jd_file:
        try:
            jd_bytes = await jd_file.read()
            jd_text = load_document_bytes(jd_bytes, jd_file.filename or "jd.pdf")
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Could not parse JD file: {exc}",
            )

    if not jd_text or not jd_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Job description is empty — please provide valid content.",
        )

    try:
        result = analyze(resume_text, jd_text)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis engine error: {exc}",
        )

    return JSONResponse(content=result.to_dict())
