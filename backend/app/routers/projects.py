from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas, database, oauth2
# auth modülünün yeri projene göre değişebilir, senin kodunda app.routers.auth görünüyor
# ama genelde app.oauth2 içinden gelir. Kendi yapına göre burayı kontrol et.
from app.oauth2 import get_current_user 

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

# 1. Projeleri Listele (İSTATİSTİKLERLE BİRLİKTE 🚀)
@router.get("/", response_model=List[schemas.ProjectOut])
def get_projects(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Kullanıcının projelerini çek
    projects = db.query(models.Project).filter(
        models.Project.user_id == current_user.id
    ).order_by(models.Project.created_at.desc()).all()
    
    results = []
    
    # 2. Her proje için istatistikleri hesapla
    for p in projects:
        # Bu projeye ait sunumları bul
        presentations = db.query(models.Presentation).filter(
            models.Presentation.project_id == p.id
        ).all()
        
        count = len(presentations) # Toplam sunum sayısı
        avg = 0.0
        
        if count > 0:
            # Overall score'ların toplamını alıp adede böl
            total_score = sum(pres.overall_score for pres in presentations if pres.overall_score is not None)
            avg = total_score / count
            
        # Pydantic şemasına verileri doldur
        # Not: schemas.py dosyasında ProjectOut içine session_count ve average_score eklediğinden emin ol!
        project_data = schemas.ProjectOut(
            id=p.id,
            user_id=p.user_id,
            title=p.title,
            description=p.description,
            created_at=p.created_at,
            session_count=count,        # <-- YENİ VERİ
            average_score=round(avg, 1) # <-- YENİ VERİ (Tek ondalık basamak)
        )
        results.append(project_data)
        
    return results

# 2. Yeni Proje Oluştur (Aynı kalabilir)
# app/routers/projects.py içindeki ilgili fonksiyonu şu şekilde güncelle:

@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_project = models.Project(
        title=project.title,
        description=project.description,
        user_id=current_user.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    return schemas.ProjectOut(
        id=new_project.id,
        user_id=new_project.user_id,
        title=new_project.title,
        description=new_project.description,
        created_at=new_project.created_at,
        session_count=0,
        average_score=0.0
    )

# 3. Tekil Proje Detayı
@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project_detail(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id, 
        models.Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
    
    # Tekil detayda da istatistikleri hesaplayıp gönderelim
    presentations = db.query(models.Presentation).filter(
        models.Presentation.project_id == project.id
    ).all()
    
    count = len(presentations)
    avg = 0.0
    if count > 0:
        total_score = sum(pres.overall_score for pres in presentations if pres.overall_score is not None)
        avg = total_score / count

    # Veritabanı objesini Pydantic modele dönüştürürken ek alanları manuel set ediyoruz
    project_response = schemas.ProjectOut(
        id=project.id,
        user_id=project.user_id,
        title=project.title,
        description=project.description,
        created_at=project.created_at,
        session_count=count,
        average_score=round(avg, 1)
    )
        
    return project_response

# --- projects.py dosyasına ekle ---

@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    project_update: schemas.ProjectCreate, # Aynı şemayı kullanabiliriz
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id, 
        models.Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
    
    project.title = project_update.title
    project.description = project_update.description
    
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id, 
        models.Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
        
    db.delete(project)
    db.commit()
    return {"message": "Proje ve bağlı tüm analizler silindi"}