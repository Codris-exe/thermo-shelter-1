import re

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.auth import (
    authenticate_user,
    create_token,
    get_current_user,
    register_user,
)


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class AuthRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)


class RegisterRequest(AuthRequest):
    name: str = Field(min_length=2, max_length=80)


def _validate_email(email: str):
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email.strip()):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")


@router.post("/register")
def register(payload: RegisterRequest):
    _validate_email(payload.email)
    user = register_user(payload.name, payload.email, payload.password)
    return {
        "access_token": create_token(user["id"], user["email"]),
        "token_type": "bearer",
        "user": user,
    }


@router.post("/login")
def login(payload: AuthRequest):
    _validate_email(payload.email)
    user = authenticate_user(payload.email, payload.password)
    return {
        "access_token": create_token(user["id"], user["email"]),
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me")
def me(user=Depends(get_current_user)):
    return {"user": user}
