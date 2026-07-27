from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database.session import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user import User

router = APIRouter(prefix="/profile", tags=["Profile"])

class ProfileUpdate(BaseModel):
    linkedin_url: Optional[str] = None
    company: Optional[str] = None
    approval_status: Optional[str] = None
    is_approved: Optional[bool] = None

@router.put("/me")
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully", "user": user}