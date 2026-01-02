from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app import database, models
# SECRET_KEY ve ALGORITHM'i security dosyasından çekiyoruz ki uyumsuzluk olmasın
from app.utils.security import SECRET_KEY, ALGORITHM 

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulanamadı (Token geçersiz)",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Token'ı çöz
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # 2. İçindeki 'user_id' bilgisini al (Burasi eskiden 'sub' arıyor olabilir)
        user_id: int = payload.get("user_id")
        
        if user_id is None:
            print("❌ Token içinde user_id bulunamadı!")
            raise credentials_exception
            
    except JWTError as e:
        print(f"❌ JWT Hatası: {e}")
        raise credentials_exception
    
    # 3. Bu ID'ye sahip kullanıcı veritabanında var mı?
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if user is None:
        print("❌ Token geçerli ama kullanıcı veritabanında yok!")
        raise credentials_exception
        
    return user