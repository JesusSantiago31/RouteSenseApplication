from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import RutaCreate, RutaResponse
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

@router.post("/routes/", response_model=RutaResponse)
@limiter.limit("10/minute")
def crear_ruta(request: Request, data: RutaCreate, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    return route_service.create_route(db, data)
