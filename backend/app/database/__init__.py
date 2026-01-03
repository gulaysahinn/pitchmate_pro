import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# 1. .env DOSYASINI BUL VE YÜKLE
# Dosyanın yerini sağlama alıyoruz (backend klasöründe arıyoruz)
current_dir = os.path.dirname(os.path.abspath(__file__)) # app/
backend_dir = os.path.dirname(current_dir) # backend/
env_path = os.path.join(backend_dir, '.env')

# Eğer backend klasöründe yoksa bir üstüne bak
if not os.path.exists(env_path):
    backend_dir = os.path.dirname(backend_dir)
    env_path = os.path.join(backend_dir, '.env')

load_dotenv(env_path)

# 2. VERİTABANI BİLGİLERİNİ AL
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_dsn = os.getenv("DB_DSN")  # Örn: localhost:1521/XEPDB1

# Güvenlik kontrolü
if not db_user or not db_password or not db_dsn:
    raise ValueError("❌ .env dosyasında DB bilgileri eksik! (DB_USER, DB_PASSWORD, DB_DSN)")

# 3. SQLALCHEMY BAĞLANTI ADRESİNİ OLUŞTUR
# Format: oracle+oracledb://KULLANICI:SIFRE@DSN
SQLALCHEMY_DATABASE_URL = f"oracle+oracledb://{db_user}:{db_password}@{db_dsn}"

# 4. ENGINE (MOTOR) OLUŞTUR
# Bu motor, uygulamanın veritabanı ile konuşmasını sağlar.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # Oracle için büyük/küçük harf duyarlılığı gibi ayarlar gerekebilir
    max_identifier_length=128
)

# 5. OTURUM (SESSION) OLUŞTURUCU
# Her istek geldiğinde veritabanında yeni bir 'oturum' açar.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 6. MODEL TABANI (BASE)
# models.py dosyasındaki User, Project gibi sınıflar bundan türetilir.
Base = declarative_base()

# 7. DEPENDENCY (BAĞIMLILIK ENJEKSİYONU)
# FastAPI rotalarında (auth.py vb.) "db: Session = Depends(get_db)" dediğinde bu çalışır.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()