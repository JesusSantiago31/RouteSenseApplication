from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from services import stop_service
from utils.dependencies import get_current_admin

router = APIRouter(tags=["Paradas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.delete("/stops/{stop_id}")
def eliminar_parada(stop_id: str, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    parada = stop_service.delete_stop(db, stop_id)
    if not parada:
        raise HTTPException(404, "Parada no encontrada")
    return {"mensaje": "Parada eliminada"}
