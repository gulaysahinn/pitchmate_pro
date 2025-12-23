# models/speech_analyzer.py
import speech_recognition as sr
import librosa
import numpy as np
import re


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

        try:
            with sr.AudioFile(audio_path) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(audio_data, language="tr-TR")
                result["transcript"] = text

                words = text.lower().split()
                word_count = len(words)

                # ✅ DOĞRU SÜRE HESABI
                duration_sec = len(audio_data.frame_data) / (
                    source.SAMPLE_RATE * source.SAMPLE_WIDTH
                )

                if duration_sec > 0:
                    wpm = (word_count / duration_sec) * 60
                    result["speaking_rate"]["words_per_minute"] = int(wpm)

                # --- Dolgu Kelimeler ---
                fillers = [
                    r"\bı+ı+\b", r"\be+e+\b", r"\bhı+m\b", r"\bhmm+\b",
                    "şey", "yani", "hani", "falan", "filan"
                ]

                found = []
                for f in fillers:
                    found += re.findall(f, text.lower())

                result["filler_words"]["count"] = len(found)
                result["filler_words"]["list"] = list(set(found))
                if word_count > 0:
                    result["filler_words"]["ratio"] = round(len(found) / word_count * 100, 1)

        except Exception:
            result["transcript"] = "⚠️ Ses çözümlenemedi."

        # ---------------------------
        # 2️⃣ SİNYAL ANALİZİ (MONOTONLUK)
        # ---------------------------
        try:
            y, sr_lib = librosa.load(audio_path)

            # Enerji (RMS)
            rms = librosa.feature.rms(y=y)[0]
            energy_std = np.std(rms)

            # Zero Crossing Rate (Pitch proxy)
            zcr = librosa.feature.zero_crossing_rate(y)[0]
            zcr_std = np.std(zcr)

            # Normalize
            dynamic_score = min(100, (energy_std * 800) + (zcr_std * 300))
            monotony = max(0, 100 - dynamic_score)

            result["audio_features"]["monotony_score"] = round(monotony, 1)
            result["audio_features"]["energy_variation"] = round(energy_std, 4)
            result["audio_features"]["pitch_variation"] = round(zcr_std, 4)

        except Exception as e:
            print("Ses sinyal hata:", e)

        return result
