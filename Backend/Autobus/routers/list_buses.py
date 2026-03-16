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
