from moviepy.editor import VideoFileClip
import os

def extract_audio(video_path):
    """
    Videodan sesi ayıklar ve .wav dosyası olarak kaydeder.
    """
    try:
        # Ses dosyasının yolu (video ile aynı isimde ama .wav uzantılı)
        audio_path = os.path.splitext(video_path)[0] + ".wav"
        
        video = VideoFileClip(video_path)
        # Sesi kaydet (logger=None terminali temiz tutar)
        video.audio.write_audiofile(audio_path, codec='pcm_s16le', logger=None)
        video.close()
        
        return audio_path
    except Exception as e:
        print(f"Ses ayıklama hatası: {e}")
        return None