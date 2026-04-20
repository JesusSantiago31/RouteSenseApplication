from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import RutaResponse
from services import route_service

router = APIRouter(tags=["Rutas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/routes/", response_model=list[RutaResponse])
def listar_rutas(db: Session = Depends(get_db)):
    return route_service.get_routes(db)
