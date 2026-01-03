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
                "monotony_score": 0.0,   # 0–100 (yüksek = daha canlı)
                "pitch_variation": 0.0,
                "energy_variation": 0.0
            }
        }

        # -------------------------------------------------
        # 1️⃣ TRANSKRİPT + KONUŞMA HIZI + DOLGU KELİMELER
        # -------------------------------------------------
        recognizer = sr.Recognizer()
        recognizer.energy_threshold = 300
        recognizer.dynamic_energy_threshold = True

        try:
            with sr.AudioFile(audio_path) as source:
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio_data = recognizer.record(source)

                try:
                    text = recognizer.recognize_google(audio_data, language="tr-TR")
                except (sr.UnknownValueError, sr.RequestError):
                    text = ""

                result["transcript"] = text
                words = text.lower().split()
                word_count = len(words)

                # Süre
                duration_sec = librosa.get_duration(path=audio_path)
                if duration_sec > 0:
                    wpm = (word_count / duration_sec) * 60
                    result["speaking_rate"]["words_per_minute"] = int(wpm)

                # Dolgu kelimeler
                fillers_regex = [
                    r"\bı+ı+\b", r"\be+e+\b", r"\bhı+m\b", r"\bhmm+\b",
                    r"\bşey\b", r"\byani\b", r"\bhani\b",
                    r"\bfalan\b", r"\bfilan\b", r"\bacaba\b", r"\bişte\b"
                ]

                found = []
                for f in fillers_regex:
                    found.extend(re.findall(f, text.lower()))

                result["filler_words"]["count"] = len(found)
                result["filler_words"]["list"] = list(set(found))

                if word_count > 0:
                    result["filler_words"]["ratio"] = round(
                        (len(found) / word_count) * 100, 1
                    )

        except Exception as e:
            print(f"Transkript hatası: {e}")

        # -------------------------------------------------
        # 2️⃣ SES SİNYALİ ANALİZİ (CANLILIK / MONOTONLUK)
        # -------------------------------------------------
        try:
            y, sr_lib = librosa.load(audio_path, sr=None)

            # --- Enerji (RMS) ---
            rms = librosa.feature.rms(y=y)[0]
            energy_std = float(np.std(rms))

            # --- Pitch (Gerçek F0 analizi) ---
            f0 = librosa.yin(y, fmin=80, fmax=300, sr=sr_lib)
            f0 = f0[np.isfinite(f0)]

            pitch_std = float(np.std(f0)) if len(f0) > 0 else 0.0

            # -------------------------------------------------
            # 3️⃣ NORMALİZE EDİLMİŞ CANLILIK SKORU (0–100)
            # -------------------------------------------------
            # Tipik aralıklar:
            # energy_std ≈ 0.02 – 0.10
            # pitch_std  ≈ 10 – 60 Hz

            energy_score = np.clip((energy_std / 0.08) * 50, 0, 50)
            pitch_score = np.clip((pitch_std / 40) * 50, 0, 50)

            liveliness_score = energy_score + pitch_score
            final_monotony = 100 - liveliness_score

            result["audio_features"]["monotony_score"] = round(final_monotony, 1)
            result["audio_features"]["energy_variation"] = round(energy_std, 4)
            result["audio_features"]["pitch_variation"] = round(pitch_std, 2)

        except Exception as e:
            print(f"Sinyal analiz hatası: {e}")

        return result
