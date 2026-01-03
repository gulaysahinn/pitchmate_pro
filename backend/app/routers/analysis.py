from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app import database, models, schemas, oauth2
from app.utils.video_processor import VideoProcessor
from app.analysis_models.combined_analyzer import CombinedAnalyzer
import shutil
import os
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Optional, List

load_dotenv()

router = APIRouter(prefix="/analysis", tags=["Analysis"])

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

def get_working_model():
    try:
        all_models = list(genai.list_models())
        valid_models = [m.name for m in all_models if 'generateContent' in m.supported_generation_methods]
        for m in valid_models:
            if 'gemini-1.5-flash' in m: return m
        for m in valid_models:
            if 'gemini-flash-latest' in m: return m
        if valid_models: return valid_models[0]
        return 'gemini-pro'
    except Exception as e:
        print(f"⚠️ Model seçimi hatası: {e}")
        return 'gemini-pro'

@router.post("/upload", response_model=schemas.PresentationOut) 
async def analyze_video(
    file: UploadFile = File(...),
    project_id: Optional[int] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user) 
):
    # 1. Klasör Hazırla ve Kaydet
    UPLOAD_DIR = "uploads/videos"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Analiz Süreçleri
    processor = VideoProcessor(file_path)
    audio_path = processor.extract_audio()
    analyzer = CombinedAnalyzer()
    results = analyzer.analyze_session(file_path, audio_path)
    processor.cleanup()

    # 3. Metrikleri Topla
    speech_data = results.get("speech_data", {})
    transcript = speech_data.get("transcript", "")
    wpm = speech_data.get("speaking_rate", {}).get("words_per_minute", 0)
    filler_data = speech_data.get("filler_words", {})
    filler_count = filler_data.get("count", 0)
    filler_summary = ", ".join(filler_data.get("list", [])) if filler_data.get("list") else "Yok"
    
    monotony_score = speech_data.get("audio_features", {}).get("monotony_score", 0)
    eye_contact = results.get("eye_score", 0)
    body_language = results.get("body_score", 0)
    overall_score = results.get("overall_score", 0)

    # 🟢 4. HAFIZALI AI COACH MANTIĞI
    ai_feedback = "Analiz tamamlandı."
    
    if GOOGLE_API_KEY:
        try:
            # Kullanıcının geçmiş sunumlarını çek (Hafıza oluşturma)
            past_sessions = db.query(models.Presentation)\
                .filter(models.Presentation.user_id == current_user.id)\
                .order_by(models.Presentation.created_at.desc())\
                .limit(3).all()

            if past_sessions:
                avg_past_score = sum(p.overall_score for p in past_sessions) / len(past_sessions)
                avg_past_filler = sum(p.filler_count for p in past_sessions) / len(past_sessions)
                history_context = f"Kullanıcının geçmiş ortalaması: %{avg_past_score:.1f} skor ve {avg_past_filler:.1f} dolgu kelime."
            else:
                history_context = "Bu kullanıcının ilk sunumu. Onu motive et ve sıcak bir karşılama yap."

            model = genai.GenerativeModel(get_working_model())
            
            prompt = f"""
            Sen "PitchMate AI Mentor"sun. Kullanıcının şu anki analizini geçmişiyle kıyaslayarak profesyonel yorum yap.
            
            ŞU ANKİ VERİLER:
            - Skor: %{overall_score}
            - Hız: {wpm} kelime/dk
            - Dolgu Kelime: {filler_count}
            - Göz Teması: %{eye_contact}
            
            GEÇMİŞ BAĞLAMI:
            {history_context}
            
            KURALLAR:
            1. Eğer şu anki skor geçmişten yüksekse tebrik et.
            2. "Dolgu kelimelerin azalmış" veya "Göz temasın artmış" gibi kıyaslamalar yap.
            3. Samimi ve profesyonel bir mentor gibi konuş.
            4. Maksimum 3 kısa madde kullan.
            """
            
            response = model.generate_content(prompt)
            ai_feedback = response.text

        except Exception as e:
            print(f"❌ AI Hatası: {e}")
            ai_feedback = "Sunumun kaydedildi, istatistiklerin yukarıdaki grafiklerde yer alıyor."

    # 5. Veritabanına Kaydet
    new_presentation = models.Presentation(
        user_id=current_user.id,
        project_id=project_id,
        video_filename=file_path,
        overall_score=overall_score,
        wpm=wpm,
        filler_count=filler_count,
        filler_breakdown=filler_summary,
        monotony_score=monotony_score,
        eye_contact_score=eye_contact,
        body_language_score=body_language,
        ai_feedback=ai_feedback
    )
    
    db.add(new_presentation)
    db.commit()
    db.refresh(new_presentation)
    
    return new_presentation

@router.get("/history", response_model=List[schemas.PresentationOut])
def get_analysis_history(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    return db.query(models.Presentation)\
        .filter(models.Presentation.user_id == current_user.id)\
        .order_by(models.Presentation.created_at.desc())\
        .all()

@router.delete("/delete/{id}")
def delete_analysis(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    presentation = db.query(models.Presentation).filter(models.Presentation.id == id).first()
    if not presentation or presentation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analiz bulunamadı.")
        
    db.delete(presentation)
    db.commit()
    return {"message": "Başarıyla silindi."}