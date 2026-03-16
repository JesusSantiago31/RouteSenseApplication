from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Administrador
from utils.dependencies import get_current_admin

router = APIRouter(tags=["Administradores"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.delete("/admin/{admin_id}")
def eliminar_admin(admin_id: str, db: Session = Depends(get_db), admin_current = Depends(get_current_admin)):
    admin = db.query(Administrador).filter_by(user_id=admin_id).first()
    if not admin:
        raise HTTPException(404, "Administrador no encontrado")

    db.delete(admin)
    db.commit()
    return {"mensaje": "Administrador eliminado"}
