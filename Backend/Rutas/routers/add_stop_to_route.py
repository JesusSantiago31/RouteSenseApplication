from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import RutaParadaCreate, RutaParadaResponse
from services import route_service
from utils.dependencies import get_current_admin
from utils.limiter import limiter

router = APIRouter(tags=["Rutas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/routes/{ruta_id}/stops", response_model=RutaParadaResponse)
@limiter.limit("10/minute")
def añadir_parada_a_ruta(ruta_id: str, request: Request, data: RutaParadaCreate, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    return route_service.add_stop_to_route(db, ruta_id, data)
