from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import BusRouteAssignment
from services import bus_service
from utils.dependencies import get_current_admin
from utils.limiter import limiter
from uuid import UUID

router = APIRouter(tags=["Autobuses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/buses/{bus_id}/routes/{ruta_id}")
@limiter.limit("5/minute")
def asignar_ruta_a_bus(bus_id: UUID, ruta_id: UUID, request: Request, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    return bus_service.assign_bus_to_route(db, bus_id, ruta_id)
