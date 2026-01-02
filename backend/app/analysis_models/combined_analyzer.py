import cv2
import os
import numpy as np
from app.analysis_models.eye_tracker import EyeTracker
from app.analysis_models.pose_detector import PoseDetector
from app.analysis_models.speech_analyzer import SpeechAnalyzer # Dosya ismine dikkat (analyzer.py)

class CombinedAnalyzer:
    def __init__(self):
        self.eye_tracker = EyeTracker()
        self.pose_detector = PoseDetector()
        self.speech_analyzer = SpeechAnalyzer()

    def clean_numpy(self, data):
        """NumPy verilerini JSON formatına uygun hale getirir."""
        if isinstance(data, dict):
            return {k: self.clean_numpy(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.clean_numpy(v) for v in data]
        elif isinstance(data, (np.integer, np.int64, np.int32)):
            return int(data)
        elif isinstance(data, (np.floating, np.float64, np.float32)):
            return float(data)
        elif isinstance(data, np.bool_):
            return bool(data)
        return data

    def analyze_session(self, video_path, audio_path):
        print("🚀 CombinedAnalyzer Çalışıyor...")
        
        results = {
            "eye_score": 0,
            "body_score": 0,
            "speech_data": {}, # Transkript ve ses verileri buraya
            "overall_score": 0
        }

        # 1. GÖRÜNTÜ ANALİZİ (OpenCV)
        cap = cv2.VideoCapture(video_path)
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            self.eye_tracker.analyze_frame(frame)
            self.pose_detector.analyze_frame(frame)
        cap.release()

        eye_summary = self.eye_tracker.get_summary()
        pose_summary = self.pose_detector.get_summary()

        results["eye_score"] = eye_summary.get("overall_eye_contact_score", 0)
        results["body_score"] = pose_summary.get("overall_body_language_score", 0)

        # 2. SES ANALİZİ (Librosa & SR)
        if audio_path and os.path.exists(audio_path):
            print("🎤 SpeechAnalyzer devreye girdi...")
            speech_results = self.speech_analyzer.analyze_audio(audio_path)
            results["speech_data"] = speech_results
        else:
            print("⚠️ Ses dosyası bulunamadı!")
            results["speech_data"] = {
                "transcript": "",
                "speaking_rate": {"words_per_minute": 0},
                "filler_words": {"count": 0, "list": []},
                "audio_features": {"monotony_score": 0}
            }

        # 3. GENEL PUAN HESAPLAMA
        # Ağırlıklar: Göz %30, Beden %20, Ses/İçerik %50 (Basit bir mantık)
        # Şimdilik dolgu kelime cezası vb. router tarafında veya burada yapılabilir.
        # Biz basit ortalama alalım:
        avg_score = (results["eye_score"] + results["body_score"]) / 2
        
        # Ses canlılığı varsa onu da katalım
        monotony = results["speech_data"].get("audio_features", {}).get("monotony_score", 0)
        if monotony > 0:
            avg_score = (results["eye_score"] + results["body_score"] + monotony) / 3

        results["overall_score"] = round(avg_score, 1)

        return self.clean_numpy(results)