from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import BusCreate, BusResponse
from services import bus_service, conductor_service
from utils.dependencies import get_current_admin
from main import limiter

router = APIRouter(prefix="/buses", tags=["Autobuses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=BusResponse)
@limiter.limit("10/minute")
def crear_bus(request: Request, data: BusCreate, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    # Limitamos la creación por IP si es necesario, pero aquí usaremos el limiter global si se prefiere. 
    # FastAPI slowapi requiere el objeto 'request'.
    if data.conductor_id:
        conductor = conductor_service.get_conductor_by_id(db, data.conductor_id)
        if not conductor:
            raise HTTPException(400, "El conductor especificado no existe")
    
    return bus_service.create_bus(db, data)

@router.get("/", response_model=list[BusResponse])
def listar_buses(db: Session = Depends(get_db)):
    return bus_service.get_buses(db)
