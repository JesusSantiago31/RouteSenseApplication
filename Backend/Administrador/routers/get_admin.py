from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Usuario, Administrador
from utils.dependencies import get_current_admin

router = APIRouter(tags=["Administradores"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/admin/{admin_id}")
def obtener_admin(admin_id: str, db: Session = Depends(get_db), admin_current = Depends(get_current_admin)):
    admin = db.query(Usuario, Administrador)\
        .join(Administrador)\
        .filter(Usuario.user_id == admin_id)\
        .first()

    if not admin:
        raise HTTPException(404, "Administrador no encontrado")

    u, a = admin
    return {
        "user_id": u.user_id,
        "nombre": u.nombre,
        "apellido": u.apellido,
        "email": u.email,
        "rol": a.rol,
    }
