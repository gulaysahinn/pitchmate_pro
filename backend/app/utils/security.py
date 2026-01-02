from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from typing import Optional

# Gizli Anahtar Ayarları (Normalde .env dosyasında olmalı ama şimdilik buraya yazıyoruz)
SECRET_KEY = "cok_gizli_ve_guvenli_bir_anahtar_buraya_yaz"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Şifreleme Bağlamı (Bcrypt kullanıyoruz)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """
    Girilen düz şifreyi (plain), veritabanındaki hashlenmiş şifreyle karşılaştırır.
    """
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    """
    Düz şifreyi alır ve hashlenmiş (şifrelenmiş) halini döndürür.
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Kullanıcı giriş yaptığında ona verilecek JWT token'ı oluşturur.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt