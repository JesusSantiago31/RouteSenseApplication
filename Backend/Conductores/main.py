from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import conductor_router
from database import Base, engine
import models

app = FastAPI(title="RouteSense Conductores API")

# Movemos la creación de tablas para que no bloquee el arranque si falla la DB
@app.on_event("startup")
def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Error al crear tablas: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://routesense.onrender.com", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Microservicio de Conductores Online", "status": "active"}

app.include_router(conductor_router.router)
