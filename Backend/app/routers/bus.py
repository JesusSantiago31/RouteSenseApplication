from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import BusCreate, BusResponse
from services import bus_service, conductor_service

router = APIRouter(prefix="/buses", tags=["Autobuses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=BusResponse)
def crear_bus(data: BusCreate, db: Session = Depends(get_db)):
    if data.conductor_id:
        conductor = conductor_service.get_conductor_by_id(db, data.conductor_id)
        if not conductor:
            raise HTTPException(400, "El conductor especificado no existe")
    
    return bus_service.create_bus(db, data)

@router.get("/", response_model=list[BusResponse])
def listar_buses(db: Session = Depends(get_db)):
    return bus_service.get_buses(db)
