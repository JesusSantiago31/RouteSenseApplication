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

@router.post("/buses/", response_model=BusResponse)
def crear_bus(data: BusCreate, db: Session = Depends(get_db)):
    try:
        return bus_service.create_bus(db, data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
