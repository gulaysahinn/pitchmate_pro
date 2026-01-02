import speech_recognition as sr
import librosa
import numpy as np
import re
import os

class SpeechAnalyzer:
    def analyze_audio(self, audio_path):
        result = {
            "transcript": "",
            "speaking_rate": {"words_per_minute": 0},
            "filler_words": {"count": 0, "list": [], "ratio": 0.0},
            "audio_features": {
                "monotony_score": 0,
                "pitch_variation": 0,
                "energy_variation": 0
            }
        }

        # ---------------------------
        # 1️⃣ TRANSKRİPT + HIZ + DOLGU
        # ---------------------------
        recognizer = sr.Recognizer()
        
        # Gürültü eşiğini dinamik ayarla
        recognizer.energy_threshold = 300 
        recognizer.dynamic_energy_threshold = True

        try:
            with sr.AudioFile(audio_path) as source:
                # Gürültüyü öğren
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio_data = recognizer.record(source)
                
                try:
                    text = recognizer.recognize_google(audio_data, language="tr-TR")
                except sr.UnknownValueError:
                    text = "" 
                except sr.RequestError:
                    text = ""

                result["transcript"] = text

                words = text.lower().split()
                word_count = len(words)

                # Süreyi Librosa ile al (Daha hassas)
                duration_sec = librosa.get_duration(filename=audio_path)

                if duration_sec > 0:
                    wpm = (word_count / duration_sec) * 60
                    result["speaking_rate"]["words_per_minute"] = int(wpm)

                # --- Dolgu Kelimeler ---
                fillers_regex = [
                    r"\bı+ı+\b", r"\be+e+\b", r"\bhı+m\b", r"\bhmm+\b",
                    r"\bşey\b", r"\byani\b", r"\bhani\b", r"\bfalan\b", r"\bfilan\b", r"\bacaba\b", r"\bişte\b"
                ]

                found = []
                for f in fillers_regex:
                    found += re.findall(f, text.lower())

                result["filler_words"]["count"] = len(found)
                result["filler_words"]["list"] = list(set(found))
                
                if word_count > 0:
                    result["filler_words"]["ratio"] = round(len(found) / word_count * 100, 1)

        except Exception as e:
            print(f"Transkript hatası: {e}")
            result["transcript"] = ""

        # ---------------------------
        # 2️⃣ SİNYAL ANALİZİ (MONOTONLUK)
        # ---------------------------
        try:
            y, sr_lib = librosa.load(audio_path)

            rms = librosa.feature.rms(y=y)[0]
            energy_std = np.std(rms)

            zcr = librosa.feature.zero_crossing_rate(y)[0]
            zcr_std = np.std(zcr)

            # Monotonluk Formülü
            # Eğer enerji değişimi çok azsa (energy_std < 0.01), monotonluk yüksektir.
            
            dynamic_score = (energy_std * 500) + (zcr_std * 200)
            monotony = max(0, min(100, dynamic_score * 100))
            
            # Skoru tersine çeviriyoruz: 100 = Çok Canlı, 0 = Çok Monoton
            # Ama arayüzde "Ses Enerjisi" dediğimiz için yüksek puan iyidir.
            
            result["audio_features"]["monotony_score"] = round(monotony, 1)
            result["audio_features"]["energy_variation"] = round(energy_std, 4)
            result["audio_features"]["pitch_variation"] = round(zcr_std, 4)

        except Exception as e:
            print(f"Sinyal analiz hatası: {e}")

        return result