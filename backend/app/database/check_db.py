import oracledb
import os
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv() # .env dosyasının aynı klasörde olduğundan emin ol

def check_users():
    try:
        # Backend ile aynı ayarlarla bağlan
        conn = oracledb.connect(
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            dsn=os.getenv("DB_DSN")
        )
        cursor = conn.cursor()
        
        print(f"📡 Bağlanılan Kullanıcı: {os.getenv('DB_USER')}")
        
        # Kullanıcıları Listele
        cursor.execute("SELECT id, username, email FROM users")
        rows = cursor.fetchall()
        
        print(f"📊 Toplam Kullanıcı Sayısı: {len(rows)}")
        print("-" * 30)
        for row in rows:
            print(f"ID: {row[0]} | User: {row[1]} | Email: {row[2]}")
            
        conn.close()
        
    except Exception as e:
        print(f"❌ Hata: {e}")

if __name__ == "__main__":
    check_users()