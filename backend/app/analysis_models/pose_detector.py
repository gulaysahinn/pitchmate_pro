import cv2
import numpy as np
from typing import Dict, Tuple

class PoseDetector:
    def __init__(self):
        self.prev_frame_gray = None
        self.movement_scores = []

        self.metrics = {
            'stability_score': 0,
            'high_movement_frames': 0
        }

    def analyze_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Dict]:
        # Griye çevir ve yumuşat
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        movement_ratio = 0.0
        frame_metrics = {'movement_detected': False}

        if self.prev_frame_gray is not None:
            # İki kare arasındaki farkı al
            frame_delta = cv2.absdiff(self.prev_frame_gray, gray)
            thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]

            # Hareket eden piksellerin toplam alana oranı (0.0 - 1.0 arası)
            total_pixels = frame.shape[0] * frame.shape[1]
            movement_pixels = np.count_nonzero(thresh)
            
            # Yüzdeye çevir (Örn: %0.5 hareket)
            movement_ratio = (movement_pixels / total_pixels) * 100
            self.movement_scores.append(movement_ratio)

            # Eşik değeri: Eğer ekrandaki piksellerin %1'inden fazlası değişiyorsa hareket var demektir
            if movement_ratio > 1.0: 
                frame_metrics['movement_detected'] = True
                self.metrics['high_movement_frames'] += 1
                cv2.putText(frame, "HAREKETLI", (10, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            else:
                cv2.putText(frame, "STABIL", (10, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        self.prev_frame_gray = gray
        return frame, frame_metrics

    def get_summary(self) -> Dict:
        if not self.movement_scores:
            avg_move = 0.0
        else:
            avg_move = np.mean(self.movement_scores)

        # --- PUANLAMA MANTIĞI (GÜNCELLENDİ) ---
        # İdeal hareket oranı %0.5 ile %3.0 arasıdır (Jest ve mimikler).
        # 0'a yakınsa: Robot gibi duruyor (Kötü)
        # 5'ten büyükse: Çok sallanıyor (Kötü)
        
        score = 0
        
        if avg_move < 0.2:
            # Çok hareketsiz (Robot) -> Puan düşük
            score = 60
            interpretation = "Çok Hareketsiz"
        elif 0.2 <= avg_move <= 3.0:
            # İdeal bölge
            score = 90 + (10 * (1 - abs(1.5 - avg_move)/1.5)) # 90-100 arası
            interpretation = "İdeal Hareketlilik"
        else:
            # Çok hareketli
            diff = avg_move - 3.0
            score = max(0, 90 - (diff * 10))
            interpretation = "Aşırı Hareketli"

        score = round(min(100, max(0, score)), 1)

        recs = []
        if score < 70:
            if avg_move < 0.2:
                recs.append("🔴 Çok donuk duruyorsunuz. Ellerinizi ve vücut dilinizi kullanarak anlatımı güçlendirin.")
            else:
                recs.append("🔴 Çok fazla sallanıyorsunuz. Ayaklarınızı yere sağlam basmaya çalışın.")
        elif score < 90:
            recs.append("🟢 Beden diliniz iyi, ancak biraz daha doğal olabilirsiniz.")
        else:
            recs.append("🟢 Harika sahne hakimiyeti! Hareketleriniz dengeli.")

        return {
            'overall_body_language_score': score,
            'avg_movement_ratio': round(avg_move, 2),
            'interpretation': interpretation,
            'recommendations': recs
        }

    def analyze_video(self, video_path):
        cap = cv2.VideoCapture(video_path)
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            self.analyze_frame(frame)
        cap.release()
        return self.get_summary()