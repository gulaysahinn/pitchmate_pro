import oracledb
import os
import sys
from dotenv import load_dotenv

# .env dosyasının yolunu daha sağlam bulalım
# Bu dosyanın bulunduğu klasör: backend/app/database veya backend/database
current_dir = os.path.dirname(os.path.abspath(__file__))

# Backend ana dizinini bulmaya çalış (genelde 1 veya 2 üst dizindedir)
# Eğer 'backend' klasörünü bulamazsa bir üst dizine bakar.
backend_dir = os.path.dirname(current_dir) 
env_path = os.path.join(backend_dir, '.env')

# Eğer orada yoksa bir üstüne daha bak (garanti olsun)
if not os.path.exists(env_path):
    backend_dir = os.path.dirname(backend_dir)
    env_path = os.path.join(backend_dir, '.env')

load_dotenv(env_path)

def get_db_connection():
    """Oracle veritabanına bağlantı açar"""
    try:
        # TNS veya Connection String kullanımı
        dsn = os.getenv("DB_DSN")
        user = os.getenv("DB_USER")
        password = os.getenv("DB_PASSWORD")

        if not dsn or not user or not password:
            print("❌ HATA: .env dosyasında DB bilgileri eksik!")
            return None

        connection = oracledb.connect(
            user=user,
            password=password,
            dsn=dsn
        )
        return connection
    except Exception as e:
        print(f"❌ HATA: Veritabanına bağlanılamadı -> {e}")
        return None

if __name__ == "__main__":
    conn = get_db_connection()
    if conn:
        print("✅ Başarılı! Oracle Veritabanına bağlandık.")
        print("Oracle Sürümü:", conn.version)
        conn.close()