from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
import shutil
import os
import uuid # Dosya isimleri çakışmasın diye

from app import schemas, models, database
from app.utils.security import hash_password, verify_password, create_access_token
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# 1. KAYIT OL
@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    existing_user = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.email == user.email)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Kullanıcı adı veya email zaten kayıtlı.")

    hashed_password = hash_password(user.password)

    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# 2. GİRİŞ YAP
@router.post("/login", response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == user_credentials.username).first()

    if not user:
        raise HTTPException(status_code=403, detail="Geçersiz kimlik bilgileri")

    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Geçersiz kimlik bilgileri")

    access_token = create_access_token(data={"user_id": user.id})

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user 
    }

# 3. ŞİFRE DEĞİŞTİR
@router.post("/change-password")
def change_password(
    request: schemas.ChangePasswordRequest, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mevcut şifreniz yanlış.")

    current_user.hashed_password = hash_password(request.new_password)
    db.commit()

    return {"message": "Şifreniz başarıyla güncellendi."}

# 4. AVATAR YÜKLE
@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Klasör yoksa oluştur
    UPLOAD_DIR = "uploads/avatars"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Dosya adını güvenli hale getir
    file_extension = file.filename.split(".")[-1]
    # UUID kullanarak benzersiz isim yapıyoruz (Browser cache sorununu çözer)
    unique_filename = f"user_{current_user.id}_{uuid.uuid4()}.{file_extension}"
    file_path = f"{UPLOAD_DIR}/{unique_filename}"
    
    # Dosyayı kaydet
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # URL formatı (Windows için ters slash düzeltmesi yapıldı)
    # Örn: http://localhost:8000/uploads/avatars/user_1_...jpg
    clean_path = file_path.replace("\\", "/") 
    avatar_url = f"http://localhost:8000/{clean_path}"
    
    current_user.avatar = avatar_url # Modelindeki alan adı 'avatar' ise
    db.commit()
    
    return {"avatar": avatar_url, "message": "Profil fotoğrafı güncellendi."}

# 5. PROFİL GÜNCELLE (YENİ EKLENDİ)
@router.put("/update-profile")
def update_profile(
    user_data: schemas.UserUpdate, # Bu şemayı schemas.py'a eklemelisin
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Eğer kullanıcı adı değiştirilmek isteniyorsa, başkası kullanıyor mu bak
    if user_data.username and user_data.username != current_user.username:
        existing = db.query(models.User).filter(models.User.username == user_data.username).first()
        if existing:
            raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kullanımda.")
        current_user.username = user_data.username

    # Email değiştirilmek isteniyorsa
    if user_data.email and user_data.email != current_user.email:
        existing_email = db.query(models.User).filter(models.User.email == user_data.email).first()
        if existing_email:
             raise HTTPException(status_code=400, detail="Bu e-posta zaten kullanımda.")
        current_user.email = user_data.email
         
    db.commit()
    
    return {
        "username": current_user.username,
        "email": current_user.email,
        "avatar": current_user.avatar
    }

# 6. HESAP SİL (YENİ EKLENDİ)
@router.delete("/delete-account")
def delete_account(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Kullanıcıyı sil
    db.delete(current_user)
    db.commit()
    return {"message": "Hesap kalıcı olarak silindi."}