from fastapi import APIRouter, HTTPException
import oracledb

# HATA ÇÖZÜMÜ: app.services yerine senin çalışan auth dosyanı kullanıyoruz
from app.routers.auth import DB_CONFIG 

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/stats/{username}")
def get_dashboard_stats(username: str):
    conn = None
    cursor = None
    
    try:
        # Bağlantıyı DB_CONFIG ile oluşturuyoruz
        conn = oracledb.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # 1. Kullanıcının ID'sini bul
        cursor.execute("SELECT id FROM users WHERE username = :username", {"username": username})
        user_row = cursor.fetchone()
        
        if not user_row:
            # Kullanıcı bulunamazsa boş değer dön
            return {"total_presentations": 0, "average_score": 0, "total_duration_minutes": 0}
            
        user_id = user_row[0]

        # 2. İstatistikleri Hesapla (COUNT, AVG, SUM)
        sql_stats = """
            SELECT 
                COUNT(*) as total_count, 
                AVG(score) as avg_score, 
                SUM(duration_seconds) as total_duration
            FROM presentations 
            WHERE user_id = :user_id
        """
        
        cursor.execute(sql_stats, {"user_id": user_id})
        stats_row = cursor.fetchone()
        
        # 3. Verileri Düzenle (Null gelirse 0 yap)
        total_count = stats_row[0] or 0
        avg_score = round(stats_row[1] or 0) # Virgüllü sayıyı yuvarla
        total_duration_sec = stats_row[2] or 0
        
        # Saniyeyi dakikaya çevir (Örn: 150 sn -> 2.5 dk)
        total_duration_min = round(total_duration_sec / 60, 1)

        return {
            "total_presentations": total_count,
            "average_score": avg_score,
            "total_duration_minutes": total_duration_min
        }

    except Exception as e:
        print(f"Dashboard Stats Hatası: {e}")
        return {"total_presentations": 0, "average_score": 0, "total_duration_minutes": 0}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()