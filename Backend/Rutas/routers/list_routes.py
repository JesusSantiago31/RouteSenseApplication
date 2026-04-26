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

@router.get("/routes/{ruta_id}/details")
def obtener_detalles_ruta(ruta_id: str, db: Session = Depends(get_db)):
    detalles = route_service.get_route_with_stops(db, ruta_id)
    from fastapi import HTTPException
    if not detalles:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    return detalles
