from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import shutil
import os
import uuid
import json
import oracledb
from moviepy.editor import VideoFileClip # <-- SÜRE HESAPLAMAK İÇİN EKLENDİ

# Auth ve User işlemleri
from app.routers.auth import get_current_user, DB_CONFIG 

# Senin yazdığın yardımcı fonksiyonlar
from app.utils.video_processor import extract_audio
from app.analysis_models.combined_analyzer import CombinedAnalyzer

router = APIRouter(prefix="/analyze", tags=["Analysis"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- GÜNCELLENEN VERİTABANI KAYIT FONKSİYONU ---
def save_result_to_db(user_id, video_path, report):
    conn = None
    cursor = None
    duration = 0 # Varsayılan süre

    # 1. Videonun süresini hesapla (Dashboard'daki 'Pratik Süresi' için)
    try:
        clip = VideoFileClip(video_path)
        duration = int(clip.duration) # Saniye cinsinden
        clip.close()
    except Exception as e:
        print(f"⚠️ Video süresi hesaplanamadı: {e}")

    try:
        conn = oracledb.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # AI Raporundan Skoru Al
        overall_score = report.get("overall_score", 0)
        
        # Dosya adını al (path'den sadece ismi ayıkla)
        filename = os.path.basename(video_path)

        # TABLO ADI: presentations (Dashboard burayı okuyor!)
        sql = """
            INSERT INTO presentations 
            (user_id, score, duration_seconds, video_filename)
            VALUES (:1, :2, :3, :4)
        """
        
        cursor.execute(sql, (
            user_id, 
            overall_score, 
            duration, 
            filename
        ))
        
        conn.commit()
        print(f"💾 Analiz sonucu 'presentations' tablosuna kaydedildi! (Puan: {overall_score}, Süre: {duration}sn)")

    except Exception as e:
        print(f"⚠️ Veritabanı Kayıt Hatası: {e}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/upload")
def upload_video(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        # 1. Dosya Uzantı Kontrolü
        allowed_extensions = {".mp4", ".avi", ".mov", ".webm"}
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Sadece video dosyaları kabul edilir.")

        # 2. Dosyayı Kaydet
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        video_path = os.path.join(UPLOAD_DIR, unique_filename)

        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 3. Ses Çıkarma ve Analiz
        audio_path = extract_audio(video_path)
        if not audio_path:
             raise HTTPException(status_code=500, detail="Videodan ses çıkarılamadı.")

        print("🔍 Yapay zeka analizi başlıyor...")
        analyzer = CombinedAnalyzer()
        report = analyzer.analyze_session(video_path, audio_path)

        # 4. VERİTABANINA KAYIT (User ID varsa)
        user_id = current_user.get("user_id") or current_user.get("id") # Bazen id, bazen user_id dönebilir, garantiye alalım.
        
        if user_id:
            save_result_to_db(user_id, video_path, report)
        else:
            print("⚠️ Uyarı: User ID bulunamadı, veritabanına kayıt yapılmadı.")

        return {
            "message": "Analiz Başarılı! 🎉",
            "file_id": unique_filename,
            "analysis_results": report
        }

    except Exception as e:
        print(f"Sunucu Hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))