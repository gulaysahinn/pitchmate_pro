import cv2
import os
import numpy as np
from app.analysis_models.eye_tracker import EyeTracker
from app.analysis_models.pose_detector import PoseDetector
from app.analysis_models.speech_analyz import SpeechAnalyzer

class CombinedAnalyzer:
    def __init__(self):
        self.eye_tracker = EyeTracker()
        self.pose_detector = PoseDetector()
        self.speech_analyzer = SpeechAnalyzer()

    # --- GÜNCELLENEN TEMİZLEME FONKSİYONU (NumPy 2.0 Uyumlu) ---
    def clean_numpy(self, data):
        """
        NumPy verilerini standart Python verilerine çevirir.
        NumPy 2.0 uyumlu hale getirildi.
        """
        if isinstance(data, dict):
            return {k: self.clean_numpy(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.clean_numpy(v) for v in data]
        
        # NumPy Sayılarını Kontrol Et (float_ ve int_ kaldırıldı)
        # Sadece güncel tipleri kontrol ediyoruz:
        elif isinstance(data, (np.int8, np.int16, np.int32, np.int64, 
                               np.uint8, np.uint16, np.uint32, np.uint64)):
            return int(data)
        elif isinstance(data, (np.float16, np.float32, np.float64)):
            return float(data)
        elif isinstance(data, np.bool_): # Boolean kontrolü
             return bool(data)
        else:
            return data

    def analyze_session(self, video_path, audio_path):
        print("🚀 Analiz başladı...")
        
        results = {
            "video_metrics": {},
            "audio_metrics": {},
            "overall_score": 0,
            "recommendations": []
        }

        # --- 1. GÖRÜNTÜ ANALİZİ ---
        cap = cv2.VideoCapture(video_path)
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            self.eye_tracker.analyze_frame(frame)
            self.pose_detector.analyze_frame(frame)

        cap.release()

        eye_result = self.eye_tracker.get_summary()
        pose_result = self.pose_detector.get_summary()
        
        results["video_metrics"]["eye_contact"] = eye_result
        results["video_metrics"]["body_language"] = pose_result
        
        if "recommendations" in eye_result:
            results["recommendations"].extend(eye_result["recommendations"])
        if "recommendations" in pose_result:
            results["recommendations"].extend(pose_result["recommendations"])

        # --- 2. SES ANALİZİ ---
        if audio_path and os.path.exists(audio_path):
            print("🎤 Ses analizi yapılıyor...")
            try:
                audio_result = self.speech_analyzer.analyze_audio(audio_path)
                results["audio_metrics"] = audio_result
                
                # Ses metriklerini güvenli şekilde al (hata varsa 0 al)
                wpm = audio_result.get("speaking_rate", {}).get("words_per_minute", 0)
                fillers = audio_result.get("filler_words", {}).get("count", 0)
                
                if wpm > 160: results["recommendations"].append("🔴 Çok hızlı konuştunuz, biraz yavaşlayın.")
                elif wpm > 0 and wpm < 90: results["recommendations"].append("🟡 Çok yavaş konuştunuz, enerjinizi artırın.")
                if fillers > 4: results["recommendations"].append(f"⚠️ {fillers} kez dolgu kelime (eee, hmmm) kullandınız.")
            except Exception as e:
                print(f"Ses analizi hatası: {e}")

        # --- 3. GENEL PUAN ---
        eye_score = eye_result.get("overall_eye_contact_score", 50)
        body_score = pose_result.get("overall_body_language_score", 50)
        speech_score = 100 
        
        results["overall_score"] = round((eye_score + body_score + speech_score) / 3, 1)

        print("✅ Analiz tamamlandı. Veriler temizleniyor...")
        
        # Temizlenmiş veriyi döndür
        return self.clean_numpy(results)