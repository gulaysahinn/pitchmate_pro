import oracledb
from app.routers.auth import DB_CONFIG 

def clean_presentations_table():
    print("🧹 Veritabanı temizliği başlıyor...")
    conn = None
    cursor = None
    try:
        conn = oracledb.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # YÖNTEM DEĞİŞİKLİĞİ: DELETE yerine TRUNCATE kullanıyoruz.
        # TRUNCATE çok daha hızlıdır ve işlemi anında bitirir.
        try:
            cursor.execute("TRUNCATE TABLE presentations")
            print("✅ 'presentations' tablosu TRUNCATE ile sıfırlandı.")
        except oracledb.DatabaseError as e:
            # Eğer Truncate yetkisi yoksa DELETE deneriz
            print(f"⚠️ Truncate yapılamadı ({e}), DELETE deneniyor...")
            cursor.execute("DELETE FROM presentations")
            conn.commit()
            print("✅ 'presentations' tablosu DELETE ile temizlendi.")

    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        print("İPUCU: Eğer burası takılıyorsa, açık kalan tüm SQL editörlerini ve Backend terminallerini kapatıp tekrar dene.")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

if __name__ == "__main__":
    clean_presentations_table()