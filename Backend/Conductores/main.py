from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import conductor_router
from database import Base, engine
import models
import os

app = FastAPI(title="RouteSense Conductores API")

# Movemos la creación de tablas para que no bloquee el arranque si falla la DB
@app.on_event("startup")
def startup_event():
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        print(f"DEBUG: DATABASE_URL encontrada. Comienza con: {db_url[:20]}...")
    else:
        print("DEBUG ERROR: DATABASE_URL NO ENCONTRADA")
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Error al crear tablas: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Microservicio de Conductores Online", "status": "active"}

app.include_router(conductor_router.router)
