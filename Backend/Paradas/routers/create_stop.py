from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import ParadaCreate, ParadaResponse
from services import stop_service
from utils.dependencies import get_current_admin
from utils.limiter import limiter

router = APIRouter(tags=["Paradas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/stops/", response_model=ParadaResponse)
@limiter.limit("10/minute")
def crear_parada(request: Request, data: ParadaCreate, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    return stop_service.create_stop(db, data)
