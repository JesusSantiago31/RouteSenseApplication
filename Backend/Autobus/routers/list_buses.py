from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import BusResponse
from services import bus_service

router = APIRouter(tags=["Autobuses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/buses/", response_model=list[BusResponse])
def listar_buses(db: Session = Depends(get_db)):
    return bus_service.get_buses(db)

@router.get("/autobuses/conductor/{conductor_id}", response_model=BusResponse)
def obtener_bus_por_conductor(conductor_id: str, db: Session = Depends(get_db)):
    bus = bus_service.get_bus_by_conductor(db, conductor_id)
    if not bus:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Autobús no asignado")
    return bus
