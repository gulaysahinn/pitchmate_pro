from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
import shutil
import os
import uuid

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

    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# 2. GİRİŞ YAP
@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Geçersiz kimlik bilgileri")

    access_token = create_access_token(data={"user_id": user.id})

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user 
    }

# 3. ŞİFRE DEĞİŞTİR (Yol Düzeltildi: /password)
@router.put("/password")
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

# 4. AVATAR YÜKLE (Yol Düzeltildi: /avatar)
@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    UPLOAD_DIR = "uploads/avatars"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"user_{current_user.id}_{uuid.uuid4()}.{file_extension}"
    file_path = f"{UPLOAD_DIR}/{unique_filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    avatar_url = file_path.replace("\\", "/") 
    current_user.avatar = avatar_url
    db.commit()
    
    return {"avatar": avatar_url, "message": "Profil fotoğrafı güncellendi."}

# 5. PROFİL GÜNCELLE (Yol Düzeltildi: /me)
@router.put("/me")
def update_profile(
    user_data: schemas.UserUpdate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Email güncelleme mantığı
    if user_data.email and user_data.email != current_user.email:
        existing_email = db.query(models.User).filter(models.User.email == user_data.email).first()
        if existing_email:
             raise HTTPException(status_code=400, detail="Bu e-posta zaten kullanımda.")
        current_user.email = user_data.email
          
    db.commit()
    db.refresh(current_user)
    return current_user

# 6. HESAP SİL
@router.delete("/me")
def delete_account(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        # Kullanıcıyı veritabanından siliyoruz
        db.delete(current_user)
        db.commit()
        return {"message": "Hesap ve ilişkili veriler başarıyla silindi."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Hesap silinirken bir hata oluştu.")