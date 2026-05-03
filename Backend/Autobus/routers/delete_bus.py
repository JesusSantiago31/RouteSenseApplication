from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from services import bus_service

router = APIRouter(tags=["Autobuses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.delete("/buses/{bus_id}")
def eliminar_bus(bus_id: str, db: Session = Depends(get_db)):
    try:
        success = bus_service.delete_bus(db, bus_id)
        if not success:
            raise HTTPException(status_code=404, detail="Autobús no encontrado")
        return {"detail": "Autobús eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
