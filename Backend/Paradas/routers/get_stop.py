from fastapi import APIRouter, Depends, HTTPException
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

@router.get("/stops/{stop_id}", response_model=ParadaResponse)
def obtener_parada(stop_id: str, db: Session = Depends(get_db)):
    parada = stop_service.get_stop_by_id(db, stop_id)
    if not parada:
        raise HTTPException(404, "Parada no encontrada")
    return parada
