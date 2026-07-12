from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator

from app.controllers.auth_controller import AuthController
from app.db.session import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.models.erp_models import User
from app.core.security import create_access_token

router = APIRouter(tags=["auth"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "employee"

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        if "@" not in value:
            raise ValueError("email must contain @")
        return value.lower()


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    result = AuthController.login(db=db, email=payload.email, password=payload.password)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    return TokenResponse(**result)


@router.post("/auth/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    new_user = User(
        email=payload.email.lower(),
        password_hash=payload.password,
        full_name=payload.full_name,
        role=payload.role if payload.role in ["employee", "manager"] else "employee",
        xp=0,
        points=0,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(subject=new_user.email, role=new_user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": new_user.role,
        "email": new_user.email,
        "full_name": new_user.full_name,
    }
