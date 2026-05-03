from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from utils.limiter import limiter
from routers import create_bus, list_buses, company_router, conductor_router
from database import Base, engine
import models
import os

app = FastAPI(title="RouteSense Autobus API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.on_event("startup")
def startup_event():
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        print(f"DEBUG: DATABASE_URL encontrada. Comienza con: {db_url[:20]}...")
    else:
        print("DEBUG ERROR: DATABASE_URL NO ENCONTRADA")
    try:
        # Esto creará las tablas si no existen, pero no detendrá el servidor si falla
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Error al crear tablas o conectar: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Bienvenido a RouteSense Autobus API",
        "status": "online"
    }

app.include_router(company_router.router)
app.include_router(conductor_router.router)
app.include_router(create_bus.router)
app.include_router(list_buses.router)
