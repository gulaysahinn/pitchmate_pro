from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr 

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str 
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UserOut(UserBase):
    id: int
    created_at: datetime
    avatar: Optional[str] = None 
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut 

class TokenData(BaseModel):
    id: Optional[str] = None

# --- SUNUM ŞEMALARI ---

class PresentationBase(BaseModel):
    video_filename: str
    overall_score: float
    wpm: float
    filler_count: int
    filler_breakdown: Optional[str] = None
    monotony_score: float = 0.0
    eye_contact_score: float
    body_language_score: float = 0.0 
    ai_feedback: Optional[str] = None

class PresentationCreate(PresentationBase):
    project_id: Optional[int] = None # Kayıt sırasında proje ID'si gönderilebilmesi için

class PresentationOut(PresentationBase):
    id: int
    created_at: datetime
    user_id: int
    # 🟢 KRİTİK: Frontend filtrelemesi için bu alanın burada tanımlı olması şarttır
    project_id: Optional[int] = None 

    class Config:
        from_attributes = True

# --- DİĞER ŞEMALAR ---

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None

# --- PROJE ŞEMALARI ---

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id: int
    created_at: datetime
    user_id: int
    session_count: int = 0 
    average_score: float = 0.0 

    class Config:
        from_attributes = True