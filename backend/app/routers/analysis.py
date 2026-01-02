from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app import database, models, schemas, oauth2
from app.utils.video_processor import VideoProcessor
from app.analysis_models.combined_analyzer import CombinedAnalyzer
import shutil
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/analysis", tags=["Analysis"])

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# --- AKILLI MODEL SEÇİCİ ---
def get_working_model():
    try:
        print("🔍 Mevcut modeller taranıyor...")
        all_models = list(genai.list_models())
        valid_models = [m.name for m in all_models if 'generateContent' in m.supported_generation_methods]
        
        # Öncelik: 1.5 Flash -> Flash Latest -> Herhangi bir Flash
        for m in valid_models:
            if 'gemini-1.5-flash' in m: return m
        for m in valid_models:
            if 'gemini-flash-latest' in m: return m
        for m in valid_models:
            if 'flash' in m.lower(): return m
        for m in valid_models:
            if 'pro' in m.lower(): return m
            
        if valid_models: return valid_models[0]
        return 'gemini-pro'
    except Exception as e:
        print(f"⚠️ Model seçimi hatası: {e}")
        return 'gemini-pro'

@router.post("/analyze_video", response_model=schemas.PresentationOut)
async def analyze_video(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user) 
):
    print(f"📥 Video Yüklendi: {file.filename}")

    # 1. Klasör Hazırla
    UPLOAD_DIR = "uploads/videos"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Sesi Ayıkla
    processor = VideoProcessor(file_path)
    audio_path = processor.extract_audio()

    # 3. GERÇEK ANALİZ
    analyzer = CombinedAnalyzer()
    results = analyzer.analyze_session(file_path, audio_path)
    processor.cleanup()

    # 4. Verileri Hazırla
    speech_data = results.get("speech_data", {})
    transcript = speech_data.get("transcript", "")
    wpm = speech_data.get("speaking_rate", {}).get("words_per_minute", 0)
    filler_data = speech_data.get("filler_words", {})
    filler_count = filler_data.get("count", 0)
    filler_list = filler_data.get("list", [])
    filler_summary = ", ".join(filler_list) if filler_list else "Yok"
    
    monotony_score = speech_data.get("audio_features", {}).get("monotony_score", 0)
    eye_contact = results.get("eye_score", 0)
    body_language = results.get("body_score", 0)
    overall_score = results.get("overall_score", 0)

    # 5. YAPAY ZEKA YORUMU (İSTATİSTİK ODAKLI)
    ai_feedback = "Analiz tamamlandı."
    
    if GOOGLE_API_KEY:
        try:
            best_model = get_working_model()
            print(f"🤖 Seçilen Model: {best_model}")
            model = genai.GenerativeModel(best_model)
            
            # --- GELİŞMİŞ PROMPT ---
            prompt = f"""
            Sen "PitchMate"sin. Analiz verilerine bakarak kullanıcıya **çok kısa (maksimum 3 madde)** geri bildirim ver.
            
            Veriler:
            - Transkript: "{transcript}"
            - Hız: {wpm} kelime/dk
            - Dolgu Kelime: {filler_count}
            - Göz Teması: {eye_contact}/100
            - Beden Dili: {body_language}/100
            
            Kurallar:
            1. Asla uzun paragraflar yazma.
            2. Samimi ve motive edici ol.
            3. Sadece en kritik hatayı veya en iyi yönü vurgula.
            4. Eğer kelime sayısı 0 ise sadece: "Sesinizi duyamadım, mikrofonu kontrol edip tekrar deneyin." yaz.
            """
            
            response = model.generate_content(prompt)
            ai_feedback = response.text
            print("✅ AI Yorumu Oluşturuldu")

        except Exception as e:
            print(f"❌ AI Hatası: {e}")
            ai_feedback = "Yapay zeka şu an istatistikleri yorumlayamıyor ancak yukarıdaki grafikler doğrudur."

    # 6. Kaydet
    new_presentation = models.Presentation(
        user_id=current_user.id,
        video_url=file_path,
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