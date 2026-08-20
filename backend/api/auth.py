from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from core.security import verify_password, get_password_hash, create_access_token, get_current_user
from database import User, async_session
from sqlalchemy import select
from core.email import send_reset_password_email
import secrets
from datetime import datetime, timedelta

router = APIRouter()

class UserAuth(BaseModel):
    username: str
    email: str
    password: str

class LoginAuth(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/register", response_model=Token)
async def register(user: UserAuth):
    async with async_session() as session:
        result = await session.execute(select(User).where(User.username == user.username))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Username already registered")
            
        result_email = await session.execute(select(User).where(User.email == user.email))
        if result_email.scalars().first():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_pw = get_password_hash(user.password)
        new_user = User(username=user.username, email=user.email, hashed_password=hashed_pw)
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        
        access_token = create_access_token(data={"sub": str(new_user.id)})
        return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(user: LoginAuth):
    async with async_session() as session:
        result = await session.execute(
            select(User).where((User.username == user.username) | (User.email == user.username))
        )
        db_user = result.scalars().first()
        if not db_user or not verify_password(user.password, db_user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect username or password")
        
        access_token = create_access_token(data={"sub": str(db_user.id)})
        return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == req.email))
        user = result.scalars().first()
        
        if not user:
            # For security, do not reveal whether the email exists
            return {"message": "If that email exists, a reset link has been generated."}
            
        # Generate token
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        
        await session.commit()
        
        # Send email (or log to console)
        await send_reset_password_email(user.email, token)
        
        return {"message": "If that email exists, a reset link has been generated."}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    async with async_session() as session:
        result = await session.execute(select(User).where(User.reset_token == req.token))
        user = result.scalars().first()
        
        if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
            
        # Update password
        user.hashed_password = get_password_hash(req.new_password)
        user.reset_token = None
        user.reset_token_expires = None
        
        await session.commit()
        
        return {"message": "Password successfully reset"}

@router.post("/update-password")
async def update_password(req: UpdatePasswordRequest, user_id: int = Depends(get_current_user)):
    async with async_session() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        
        if not user or not verify_password(req.current_password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect current password")
            
        user.hashed_password = get_password_hash(req.new_password)
        await session.commit()
        return {"message": "Password updated successfully"}

@router.get("/me")
async def get_me(user_id: int = Depends(get_current_user)):
    async with async_session() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"id": user.id, "username": user.username, "email": user.email}
