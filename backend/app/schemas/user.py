from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 1. Frontend'den Kayıt Olurken Gelecek Veri Modeli
class UserCreate(BaseModel):
    username: str
    password: str

# 2. Frontend'den Giriş Yaparken Gelecek Veri Modeli
class UserLogin(BaseModel):
    username: str
    password: str

# 3. Backend'den Frontend'e Dönecek Veri Modeli (Şifreyi gizliyoruz!)
class UserOut(BaseModel):
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True