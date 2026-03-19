from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import ParadaResponse
from services import stop_service

router = APIRouter(tags=["Paradas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/stops/", response_model=list[ParadaResponse])
def listar_paradas(db: Session = Depends(get_db)):
    return stop_service.get_stops(db)
