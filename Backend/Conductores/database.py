from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

SQLALCHEMY_DATABASE_URL = "postgresql://routesensedb_user:E4U163h5M8zofv4GvVz1Wv1NizIIDV8N@dpg-cuid6k3v2p9s73f6v0pg-a.oregon-postgres.render.com/routesensedb"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
