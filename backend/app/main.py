from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Veritabanı ve Modeller
from app import models, database
from app.routers import auth, analysis, dashboard, chat, projects

# Tabloları oluştur (yoksa)
models.Base.metadata.create_all(bind=database.engine)

# --- KRİTİK NOKTA: 'app' DEĞİŞKENİ BURADA TANIMLANIYOR ---
app = FastAPI()

# CORS Ayarları (Frontend ile haberleşme için)
origins = [
    "http://localhost:5173",  # React varsayılan portu
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme aşamasında "*" yapabilirsin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Klasörleri Oluştur
os.makedirs("uploads/avatars", exist_ok=True)
os.makedirs("uploads/videos", exist_ok=True)

# Statik Dosyalar (Videolara ve resimlere erişim için)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Router'ları (Sayfaları) Dahil Et
app.include_router(auth.router)
app.include_router(analysis.router)
app.include_router(dashboard.router)
app.include_router(chat.router)
app.include_router(projects.router)

@app.get("/")
def read_root():
    return {"message": "PitchMate API Çalışıyor! 🚀"}