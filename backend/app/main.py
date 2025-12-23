from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# BURAYA EKLENDİ: dashboard router'ını import et
from app.routers import auth, analysis, dashboard 
import os

app = FastAPI(title="PitchMate AI Backend")

# --- CORS AYARLARI ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları bağla
app.include_router(auth.router)
app.include_router(analysis.router)
app.include_router(dashboard.router) # <-- BURAYA EKLENDİ

@app.get("/")
def read_root():
    return {"status": "Backend Çalışıyor 🚀"}