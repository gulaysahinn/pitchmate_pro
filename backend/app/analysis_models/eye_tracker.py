import cv2
import numpy as np
from typing import Dict, Tuple


class EyeTracker:
    def __init__(self):
        # Yüz tespiti için OpenCV'nin hazır modelini kullanıyoruz
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

        self.metrics = {
            'total_frames': 0,
            'face_detected_frames': 0,
            'eye_contact_frames': 0
        }

    def analyze_video(self, video_path):
        """Video dosyasını kare kare analiz eder."""
        cap = cv2.VideoCapture(video_path)

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            self.analyze_frame(frame)

        cap.release()
        return self.get_summary()

    def analyze_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Dict]:
        self.metrics['total_frames'] += 1

        # Siyah beyaz yap (Daha hızlı tespit için)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Yüzleri ara
        # scaleFactor=1.1, minNeighbors=5 standart iyi değerlerdir
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))

        frame_metrics = {'eye_contact': False, 'face_detected': False}

        if len(faces) > 0:
            self.metrics['face_detected_frames'] += 1
            frame_metrics['face_detected'] = True

            # En büyük yüzü al (Kameraya en yakın kişi)
            faces = sorted(faces, key=lambda x: x[2] * x[3], reverse=True)
            (x, y, w, h) = faces[0]

            # Yüzün merkezini bul
            face_center_x = x + (w // 2)
            frame_center_x = frame.shape[1] // 2

            # Yüz, ekranın merkezine yakın mı? (Tolerans %30)
            threshold = frame.shape[1] * 0.30

            if abs(frame_center_x - face_center_x) < threshold:
                frame_metrics['eye_contact'] = True
                self.metrics['eye_contact_frames'] += 1

            # Görselleştirme (Kare içine al)
            color = (0, 255, 0) if frame_metrics['eye_contact'] else (0, 0, 255)
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            cv2.putText(frame, "ODAK", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

        return frame, frame_metrics

    def get_summary(self) -> Dict:
        # Eğer hiç yüz bulunamadıysa 0 döndür
        if self.metrics['face_detected_frames'] == 0:
            score = 0
            recs = ["⚠️ Videoda yüzünüz tespit edilemedi. Işıklandırmayı kontrol edin veya kameraya daha yakın durun."]
        else:
            # Sadece yüzün göründüğü anları baz alarak puanla
            score = (self.metrics['eye_contact_frames'] / self.metrics['face_detected_frames']) * 100

            recs = []
            if score < 50:
                recs.append("🔴 İzleyiciyle göz temasınız zayıf. Kameraya daha sık bakın.")
            elif score < 80:
                recs.append("🟡 Göz temasınız iyi ama artırılabilir.")
            else:
                recs.append("🟢 Harika göz teması! İzleyiciyle bağ kuruyorsunuz.")

        return {
            'overall_eye_contact_score': round(score, 1),
            'recommendations': recs
        }