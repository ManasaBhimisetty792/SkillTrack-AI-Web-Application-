from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import UserCreate
from app.utils.security import hash_password


class UserRepository:
    def get_by_id(self, db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower()).first()

    def create(self, db: Session, obj_in: UserCreate) -> User:
        db_user = User(
            email=obj_in.email.lower(),
            name=obj_in.name,
            hashed_password=hash_password(obj_in.password),
            role=obj_in.role,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def update_password(self, db: Session, db_user: User, new_password: str) -> User:
        db_user.hashed_password = hash_password(new_password)
        db.commit()
        db.refresh(db_user)
        return db_user


user_repository = UserRepository()
