from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    avatar = Column(String, nullable=True)

    presentations = relationship("Presentation", back_populates="owner")

class Presentation(Base):
    __tablename__ = "presentations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    video_url = Column(String)
    
    overall_score = Column(Float)
    wpm = Column(Float)
    filler_count = Column(Integer)
    
    # --- YENİ EKLENEN SÜTUN ---
    filler_breakdown = Column(String, nullable=True) # Örn: "eee (3), hmm (2)"
    # --------------------------

    eye_contact_score = Column(Float)
    body_language_score = Column(Float, default=0.0)
    monotony_score = Column(Float, default=0.0)

    ai_feedback = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="presentations")