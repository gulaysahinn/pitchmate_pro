from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Veritabanı Dosyası (Proje klasöründe sql_app.db oluşur)
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# Engine oluşturma (SQLite için check_same_thread gerekli)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Oturum (Session) oluşturucu
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Modellerin miras alacağı temel sınıf (Base)
Base = declarative_base()

# Dependency (Diğer dosyalarda db = Depends(get_db) olarak kullanılan fonksiyon)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()