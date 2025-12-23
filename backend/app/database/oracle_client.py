import oracledb
import os
from dotenv import load_dotenv

# 1. .env dosyasındaki şifreleri yükle
# (Dosya bir üst dizinde olduğu için path belirtiyoruz veya otomatik bulmasını umuyoruz)
# Garantili yöntem: backend klasörünü bulup oradaki .env'i okutmak
current_dir = os.path.dirname(os.path.abspath(__file__)) # database klasörü
backend_dir = os.path.dirname(os.path.dirname(current_dir)) # backend klasörü
env_path = os.path.join(backend_dir, '.env')

load_dotenv(env_path)

def get_db_connection():
    """Oracle veritabanına bağlantı açar"""
    try:
        connection = oracledb.connect(
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            dsn=os.getenv("DB_DSN")
        )
        return connection
    except Exception as e:
        print(f"❌ HATA: Veritabanına bağlanılamadı -> {e}")
        return None

# Test etmek için (Dosyayı doğrudan çalıştırırsan burası devreye girer)
if __name__ == "__main__":
    conn = get_db_connection()
    if conn:
        print("✅ Başarılı! Oracle Veritabanına bağlandık.")
        print("Oracle Sürümü:", conn.version)
        conn.close()