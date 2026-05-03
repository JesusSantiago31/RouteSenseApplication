from fastapi import APIRouter, Depends, Request, HTTPException
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

@router.put("/routes/{ruta_id}", response_model=RutaResponse)
@limiter.limit("5/minute")
def actualizar_ruta(request: Request, ruta_id: str, data: RutaCreate, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    ruta = route_service.update_route(db, ruta_id, data)
    if not ruta:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    return ruta

@router.delete("/routes/{ruta_id}")
@limiter.limit("5/minute")
def eliminar_ruta(request: Request, ruta_id: str, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    ruta = route_service.delete_route(db, ruta_id)
    if not ruta:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    return {"message": "Ruta eliminada correctamente"}
