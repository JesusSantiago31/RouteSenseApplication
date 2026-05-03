from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import company_router
from database import Base, engine
import models

app = FastAPI(title="RouteSense Empresas API")

# Crear tablas
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Microservicio de Empresas Online", "status": "active"}

app.include_router(company_router.router)
