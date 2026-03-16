from fastapi import APIRouter, Depends
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

@router.get("/admin/")
def listar_admins(db: Session = Depends(get_db), admin_current = Depends(get_current_admin)):
    admins = db.query(Usuario, Administrador)\
        .join(Administrador, Usuario.user_id == Administrador.user_id)\
        .all()

    return [
        {
            "user_id": u.user_id,
            "nombre": u.nombre,
            "apellido": u.apellido,
            "email": u.email,
            "rol": a.rol,
        }
        for u, a in admins
    ]
