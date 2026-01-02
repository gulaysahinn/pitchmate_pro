from fastapi import APIRouter, HTTPException
import google.generativeai as genai
from app import schemas
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/chat", tags=["Chat"])

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# --- AYNI AKILLI SEÇİCİYİ BURADA DA KULLANIYORUZ ---
def get_working_model():
    try:
        all_models = list(genai.list_models())
        valid_models = [m.name for m in all_models if 'generateContent' in m.supported_generation_methods]
        
        # Öncelik sırası: 1.5-Flash -> Flash-Latest -> Herhangi bir Flash -> Pro
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
    except:
        return 'gemini-pro'

@router.post("/ask")
async def ask_coach(request: schemas.ChatRequest):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="API Key bulunamadı.")

    try:
        # Otomatik Model Seç
        best_model = get_working_model()
        print(f"🤖 Chat Modeli: {best_model}")
        
        model = genai.GenerativeModel(best_model)

        system_prompt = "Sen profesyonel bir sunum koçusun. Kısa, motive edici ve Türkçe cevaplar ver."
        user_message = request.message
        context = request.context if request.context else "Bağlam yok."
        full_prompt = f"{system_prompt}\n\nAnaliz Verileri: {context}\n\nSoru: {user_message}"

        response = model.generate_content(full_prompt)
        return {"response": response.text}
            
    except Exception as e:
        print(f"❌ Chat Hatası: {e}")
        if "429" in str(e):
            return {"response": "Ücretsiz kota sınırına takıldık. Lütfen 1 dakika bekle."}
        return {"response": "Şu an bağlantı kuramıyorum. Lütfen biraz sonra tekrar dene."}