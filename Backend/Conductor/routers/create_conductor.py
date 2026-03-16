from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import ConductorCreate, ConductorResponse
from services import conductor_service
from utils.dependencies import get_current_admin
from main import limiter

router = APIRouter(tags=["Conductores"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/conductores/", response_model=ConductorResponse)
@limiter.limit("10/minute")
def crear_conductor(request: Request, data: ConductorCreate, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    return conductor_service.create_conductor(db, data)
