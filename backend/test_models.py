import sys
import os
from dotenv import load_dotenv # Bunu ekledik

# App klasörünü bulmak için
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 1. .env dosyasını YÜKLE (Çok Önemli!)
# Script backend klasöründe olduğu için .env dosyası hemen yanındadır.
load_dotenv()

# Ortam değişkenlerini kontrol et (Debug için)
db_user = os.getenv("DB_USER")
print(f"📡 Bağlanılmaya çalışılan kullanıcı: {db_user if db_user else 'BİLİNMİYOR (Env yüklenemedi!)'}")

# Eğer Env yüklenmediyse uyarı ver ve dur
if not db_user:
    print("❌ HATA: .env dosyası okunamadı veya DB_USER tanımlı değil.")
    print("   Lütfen .env dosyasının bu script ile aynı klasörde olduğundan emin ol.")
    sys.exit(1)

from app.database import SessionLocal
from app.models import User, Project, Presentation
from sqlalchemy import text

def test_mappings():
    print("🔄 Veritabanı bağlantısı ve Modeller test ediliyor...")
    
    db = SessionLocal()
    try:
        # Hangi veritabanına bağlı olduğunu kontrol et
        # Oracle ise 'Oracle', SQLite ise 'SQLite' yazar.
        result = db.execute(text("SELECT 'Baglanti Basarili' FROM DUAL"))
        print(f"✅ Veritabanı Erişimi: {result.scalar()} (Oracle bağlantısı aktif)")

        # 1. USERS Tablosunu Test Et
        print("👤 Users tablosu kontrol ediliyor...")
        user = db.query(User).first()
        print(f"   ✅ Users tablosu OK. (Kullanıcı: {user.username if user else 'Tablo boş'})")

        # 2. PROJECTS Tablosunu Test Et
        print("📁 Projects tablosu kontrol ediliyor...")
        project = db.query(Project).first()
        print(f"   ✅ Projects tablosu OK.")

        # 3. PRESENTATIONS Tablosunu Test Et
        print("📊 Presentations tablosu kontrol ediliyor...")
        presentation = db.query(Presentation).first()
        print(f"   ✅ Presentations tablosu OK.")

        print("\n🎉 HARİKA! Tüm modeller Oracle tabloları ile birebir uyumlu.")
        
    except Exception as e:
        print("\n❌ HATA TESPİT EDİLDİ!")
        if "sqlite" in str(e).lower():
            print("🚨 HATA SEBEBİ: Kodun hala SQLite veritabanına bağlanıyor!")
            print("   Lütfen app/database.py dosyanı kontrol et.")
            print("   SQLALCHEMY_DATABASE_URL ayarın Oracle yerine SQLite gösteriyor olabilir.")
        else:
            print(f"Hata Detayı: {e}")
        
    finally:
        db.close()

if __name__ == "__main__":
    test_mappings()