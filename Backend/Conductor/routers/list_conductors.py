from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import ConductorResponse
from services import conductor_service

router = APIRouter(tags=["Conductores"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/conductores/", response_model=list[ConductorResponse])
def listar_conductores(db: Session = Depends(get_db)):
    return conductor_service.get_conductors(db)
