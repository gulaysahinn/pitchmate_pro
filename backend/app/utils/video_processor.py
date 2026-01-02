import os
from moviepy.editor import VideoFileClip

class VideoProcessor:
    def __init__(self, video_path):
        self.video_path = video_path
        # Ses dosyası yolunu oluştur (video ile aynı yerde .wav olarak)
        self.audio_path = os.path.splitext(video_path)[0] + ".wav"

    def extract_audio(self):
        """
        Videodan sesi ayıklar ve kaydeder.
        """
        try:
            video = VideoFileClip(self.video_path)
            if video.audio is None:
                return None
                
            # Librosa uyumlu format (16kHz, mono önerilir ama default da çalışır)
            video.audio.write_audiofile(self.audio_path, codec='pcm_s16le', logger=None)
            video.close()
            return self.audio_path
        except Exception as e:
            print(f"❌ Ses ayıklama hatası: {e}")
            return None

    def cleanup(self):
        """İşlem bitince geçici ses dosyasını siler"""
        if os.path.exists(self.audio_path):
            os.remove(self.audio_path)