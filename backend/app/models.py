from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

# Oracle ve SQLAlchemy Arasındaki Eşleştirme Ayarları

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column("password_hash", String(255))
    
    avatar = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="owner")
    presentations = relationship("Presentation", back_populates="owner")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(150))
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # İlişkiler
    owner = relationship("User", back_populates="projects")
    presentations = relationship("Presentation", back_populates="project")


class Presentation(Base):
    __tablename__ = "presentations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Oracle'da 'project_id' olarak tanımladık, burası doğru.
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    # ⚠️ DÜZELTME: Oracle tablosunda 'video_filename' demiştik.
    # Python modelindeki 'video_url' ismini 'video_filename' olarak düzelttim.
    video_filename = Column(String(255)) 
    
    # Analiz Sonuçları (Oracle FLOAT ile uyumlu)
    overall_score = Column(Float, default=0)
    wpm = Column(Float, default=0)
    filler_count = Column(Integer, default=0)
    
    # ⚠️ DÜZELTME: Oracle'daki CLOB veri tipi için SQLAlchemy'de 'Text' kullanıyoruz.
    # String(255) yetmez, Text sınırsız uzunluktadır.
    filler_breakdown = Column(Text, nullable=True) 

    eye_contact_score = Column(Float, default=0)
    body_language_score = Column(Float, default=0)
    monotony_score = Column(Float, default=0)
    
    # Süre bilgisi tabloda vardı, modele ekledim
    duration_seconds = Column(Integer, default=0)

    # Oracle'daki CLOB alanlar
    ai_feedback = Column(Text, nullable=True)
    analysis_json = Column(Text, nullable=True) # Tabloda var, buraya da ekledim.

    created_at = Column(DateTime, default=datetime.utcnow)

    # İlişkiler
    owner = relationship("User", back_populates="presentations")
    project = relationship("Project", back_populates="presentations")