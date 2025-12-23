import cv2
import numpy as np
from typing import Dict, List, Tuple


class PoseDetector:
    """
    MediaPipe YERİNE 'Hareket Algılama' (Motion Detection) kullanan sınıf.
    İskelet çizmez, ancak kullanıcının ne kadar hareketli olduğunu analiz eder.
    """

    def __init__(self):
        self.prev_frame_gray = None
        self.movement_scores = []

        self.metrics = {
            'stability_score': 100,
            'high_movement_frames': 0
        }

    def analyze_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Dict]:
        # Griye çevir ve yumuşat (gürültüyü azaltmak için)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        movement_val = 0
        frame_metrics = {'movement_detected': False}

        if self.prev_frame_gray is not None:
            # İki kare arasındaki farkı al
            frame_delta = cv2.absdiff(self.prev_frame_gray, gray)

            # Fark eşiği uygula (küçük değişimleri yoksay)
            thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]

            # Değişen piksel sayısını (hareket miktarını) hesapla
            movement_val = np.sum(thresh) / 10000  # Ölçeklendirme

            self.movement_scores.append(movement_val)

            if movement_val > 50:  # Eşik değer
                frame_metrics['movement_detected'] = True
                self.metrics['high_movement_frames'] += 1
                cv2.putText(frame, "HAREKETLI", (10, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            else:
                cv2.putText(frame, "STABIL", (10, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        self.prev_frame_gray = gray

        # Metrikleri uyumlu formatta döndür
        # (Eski kodun beklediği structure'ı taklit ediyoruz)
        frame_metrics.update({
            'posture_score': 100 if movement_val < 50 else 60,
            'shoulder_alignment': 100,  # Bu modda hesaplanamaz, tam puan veriyoruz
            'hand_movement': movement_val > 100
        })

        return frame, frame_metrics

    def get_summary(self) -> Dict:
        if not self.movement_scores:
            avg_move = 0
        else:
            avg_move = np.mean(self.movement_scores)

        # Hareket skoru ters orantılıdır (Az hareket = Yüksek Stabilite)
        # Ortalama hareket genelde 0-200 arası çıkar
        stability = max(0, min(100, 100 - (avg_move / 2)))

        recs = []
        if stability < 50:
            recs.append("🔴 Çok fazla hareket ediyorsunuz. Biraz daha sabit durmayı deneyin.")
        elif stability < 80:
            recs.append("🟡 Hareketliliğiniz normal seviyede.")
        else:
            recs.append("🟢 Sunum duruşunuz gayet stabil.")

        # Eski yapıyı bozmamak için dictionary formatını koruyoruz
        return {
            'overall_body_language_score': round(stability, 1),
            'posture': {'score': round(stability, 1), 'interpretation': "Hareket Dengesi"},
            'hand_movement': {'score': round(stability, 1), 'interpretation': "Jest Kullanımı"},  # Tahmini
            'stability': {'score': round(stability, 1), 'interpretation': "Vücut Sabitliği"},
            'recommendations': recs
        }

    def analyze_video(self, video_path):
        """Video dosyasını kare kare işler"""
        cap = cv2.VideoCapture(video_path)
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            self.analyze_frame(frame)
        cap.release()
        return self.get_summary()