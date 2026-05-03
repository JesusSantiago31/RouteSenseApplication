import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# LOG DE SEGURIDAD (Se verá en Render Logs)
if not DATABASE_URL:
    print("FATAL ERROR: DATABASE_URL is NOT set in environment variables")
else:
    # Mostramos solo el principio y el final para seguridad
    print(f"DATABASE_URL detected: {DATABASE_URL[:15]}...{DATABASE_URL[-10:]}")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = create_engine(
    DATABASE_URL,
    # Estos parámetros ayudan a que la conexión no se muera
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()
