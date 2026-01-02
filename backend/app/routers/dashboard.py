from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import database, models, schemas, oauth2

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

# 1. Analiz Geçmişini Getir
@router.get("/history/{username}", response_model=List[schemas.PresentationOut])
def get_user_history(
    username: str, 
    db: Session = Depends(database.get_db),
    # BURASI ÖNEMLİ: Token kontrolü yapıyoruz
    current_user: models.User = Depends(oauth2.get_current_user) 
):
    # Güvenlik Kontrolü: Sadece kendi verisini görebilsin
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Bu veriye erişim izniniz yok.")

    presentations = db.query(models.Presentation).filter(
        models.Presentation.user_id == current_user.id
    ).order_by(models.Presentation.created_at.desc()).all()
    
    return presentations

# 2. İstatistikleri Getir (Opsiyonel, Dashboard'da kullanıyorsan)
@router.get("/stats/{username}")
def get_user_stats(
    username: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Erişim izni yok.")
        
    total_presentations = db.query(models.Presentation).filter(models.Presentation.user_id == current_user.id).count()
    
    # Basit bir istatistik döndür
    return {
        "total_presentations": total_presentations,
        "username": current_user.username
    }

# ... (Mevcut kodların altına ekle)

# 3. Sunum Silme Endpoint'i
@router.delete("/delete/{presentation_id}")
def delete_presentation(
    presentation_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # 1. Sunumu bul
    presentation = db.query(models.Presentation).filter(
        models.Presentation.id == presentation_id
    ).first()

    # 2. Sunum var mı?
    if not presentation:
        raise HTTPException(status_code=404, detail="Sunum bulunamadı.")

    # 3. Bu sunum, silmeye çalışan kullanıcıya mı ait? (Güvenlik)
    if presentation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu sunumu silme yetkiniz yok.")

    # 4. Sil ve Kaydet
    db.delete(presentation)
    db.commit()

    return {"message": "Sunum başarıyla silindi."}