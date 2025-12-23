from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import oracledb
import hashlib
import jwt
import datetime
from typing import Optional
from fastapi.security import OAuth2PasswordBearer
import os  # <--- EKLENDİ
from dotenv import load_dotenv # <--- EKLENDİ

# .env dosyasını yükle (Backend klasöründe arar)
load_dotenv()

router = APIRouter(prefix="/auth", tags=["Auth"])

# --- AYARLAR (.env dosyasından çekiliyor) ---
SECRET_KEY = os.getenv("SECRET_KEY", "varsayilan_gizli_anahtar") # .env'de yoksa varsayılanı kullanır
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# DB Bağlantı Bilgileri (GÜNCELLENDİ) 🚀
DB_CONFIG = {
    "user": os.getenv("DB_USER", "system"),         # .env'den DB_USER oku
    "password": os.getenv("DB_PASSWORD"),           # .env'den DB_PASSWORD oku
    "dsn": os.getenv("DB_DSN", "localhost/XE")      # .env'den DB_DSN oku
}

# ... Dosyanın geri kalanı (modeller, fonksiyonlar, login/register) AYNI KALSIN ...

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --- MODELLER (GÜNCELLENDİ: Esnek Yapı) ---
class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    # Hem username hem email opsiyonel yapıldı, hangisi gelirse onu kullanacağız
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

# --- YARDIMCI FONKSİYONLAR ---
def get_db_connection():
    return oracledb.connect(**DB_CONFIG)

def verify_password(plain_password, hashed_password):
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Kimlik doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        if username is None or user_id is None:
            raise credentials_exception
        return {"username": username, "user_id": user_id}
    except jwt.PyJWTError:
        raise credentials_exception

# --- ENDPOINTLER ---
@router.post("/register")
def register(user: UserRegister):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Önce kullanıcı var mı diye kontrol edelim
        cursor.execute("SELECT count(*) FROM users WHERE username = :1 OR email = :2", (user.username, user.email))
        if cursor.fetchone()[0] > 0:
             raise HTTPException(status_code=400, detail="Bu kullanıcı adı veya email zaten kayıtlı.")

        hashed_pw = get_password_hash(user.password)
        cursor.execute("INSERT INTO users (username, email, password) VALUES (:1, :2, :3)",
                       (user.username, user.email, hashed_pw))
        conn.commit()
        return {"message": "Kayıt başarılı! Giriş yapabilirsiniz."}
    except Exception as e:
        print(f"Kayıt Hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.post("/login")
def login(user: UserLogin):
    # 1. Gelen veriyi kontrol et (Hata ayıklama için print)
    print(f"Giriş Denemesi: {user}")

    # Username veya Email'den en az biri dolu olmalı
    identifier = user.username or user.email
    if not identifier:
        raise HTTPException(status_code=422, detail="Kullanıcı adı veya Email girilmelidir.")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 2. Hem kullanıcı adına hem e-postaya bakıyoruz
        cursor.execute("SELECT id, username, password FROM users WHERE username = :1 OR email = :1", (identifier,identifier))
        result = cursor.fetchone()
        
        if result is None:
            raise HTTPException(status_code=400, detail="Kullanıcı bulunamadı.")
            
        db_id, db_username, db_password = result
        
        if not verify_password(user.password, db_password):
            raise HTTPException(status_code=400, detail="Şifre hatalı.")
            
        # Token oluştur
        access_token = create_access_token(data={"sub": db_username, "id": db_id})
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {"username": db_username} 
        }
    except Exception as e:
        print(f"Login Hatası: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()