from pydantic import BaseModel, EmailStr
from typing import Optional
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

class PresentationBase(BaseModel):
    video_url: str
    overall_score: float
    wpm: float
    filler_count: int
    
    # --- YENİ EKLENEN ---
    filler_breakdown: Optional[str] = None
    # --------------------

    monotony_score: float = 0.0
    eye_contact_score: float
    body_language_score: float = 0.0 
    ai_feedback: Optional[str] = None

class PresentationCreate(PresentationBase):
    pass

class PresentationOut(PresentationBase):
    id: int
    created_at: datetime
    user_id: int
    
    # --- YENİ EKLENEN ---
    filler_breakdown: Optional[str] = None 
    # --------------------

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

# ... (Mevcut kodların altına ekle)

# Şifre Değiştirme Şeması
class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# Profil Güncelleme Şeması (İsim/Email için)
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None