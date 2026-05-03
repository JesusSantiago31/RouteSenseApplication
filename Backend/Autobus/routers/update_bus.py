from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import BusCreate, BusResponse
from services import bus_service

router = APIRouter(tags=["Autobuses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.put("/buses/{bus_id}", response_model=BusResponse)
def actualizar_bus(bus_id: str, data: BusCreate, db: Session = Depends(get_db)):
    try:
        bus = bus_service.update_bus(db, bus_id, data)
        if not bus:
            raise HTTPException(status_code=404, detail="Autobús no encontrado")
        return bus
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
