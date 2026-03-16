from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import ConductorCreate, ConductorResponse
from services import conductor_service
from utils.dependencies import get_current_admin
from main import limiter

router = APIRouter(prefix="/conductores", tags=["Conductores"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ConductorResponse)
@limiter.limit("10/minute")
def crear_conductor(request: Request, data: ConductorCreate, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    return conductor_service.create_conductor(db, data)

@router.get("/", response_model=list[ConductorResponse])
def listar_conductores(db: Session = Depends(get_db)):
    return conductor_service.get_conductores(db)

@router.get("/{conductor_id}", response_model=ConductorResponse)
def obtener_conductor(conductor_id: str, db: Session = Depends(get_db)):
    conductor = conductor_service.get_conductor_by_id(db, conductor_id)
    if not conductor:
        raise HTTPException(404, "Conductor no encontrado")
    return conductor
