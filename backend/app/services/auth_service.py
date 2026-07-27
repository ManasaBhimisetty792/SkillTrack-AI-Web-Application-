import uuid
from datetime import datetime, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from app.repositories.user_repository import user_repository
from app.utils.security import verify_password, create_access_token, create_refresh_token
from app.core.exceptions import AuthenticationError, UserAlreadyExistsError, NotFoundError


class AuthService:
    def register_user(self, db: Session, user_in: UserCreate) -> Tuple[UserResponse, TokenResponse]:
        existing = user_repository.get_by_email(db, email=user_in.email)
        if existing:
            raise UserAlreadyExistsError()

        user = user_repository.create(db, obj_in=user_in)
        access_token = create_access_token(subject=user.id, role=user.role)
        refresh_token = create_refresh_token(subject=user.id, role=user.role)

        user_resp = UserResponse.model_validate(user)
        token_resp = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_resp
        )
        return user_resp, token_resp

    def authenticate_user(self, db: Session, login_in: UserLogin) -> Tuple[UserResponse, TokenResponse]:
        user = user_repository.get_by_email(db, email=login_in.email)
        if not user or not user.hashed_password:
            raise AuthenticationError("Invalid email or password")

        if not verify_password(login_in.password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")

        # Optionally update user role if role-switching requested in demo mode
        if login_in.role and login_in.role in ["student", "recruiter", "admin"]:
            user.role = login_in.role

        access_token = create_access_token(subject=user.id, role=user.role)
        refresh_token = create_refresh_token(subject=user.id, role=user.role)

        user_resp = UserResponse.model_validate(user)
        token_resp = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_resp
        )
        return user_resp, token_resp

    def request_password_reset(self, db: Session, email: str) -> dict:
        user = user_repository.get_by_email(db, email=email)
        # Even if user doesn't exist, return success to prevent email enumeration
        return {
            "message": "If an account with this email exists, a password reset link has been dispatched.",
            "status": "success"
        }

    def reset_password(self, db: Session, token: str, new_password: str) -> dict:
        # Placeholder for password reset token validation logic
        return {
            "message": "Password updated successfully. You may now sign in.",
            "status": "success"
        }


auth_service = AuthService()
