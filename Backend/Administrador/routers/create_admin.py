from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import AdminCreate, AdminResponse
from services.admin_service import create_admin
from utils.dependencies import get_current_admin
from main import limiter

router = APIRouter(tags=["Administradores"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/admin/", response_model=AdminResponse)
@limiter.limit("5/minute")
def crear_admin(request: Request, data: AdminCreate, db: Session = Depends(get_db), admin_current = Depends(get_current_admin)):
    usuario, admin_obj = create_admin(db, data)
    return {
        "user_id": usuario.user_id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email,
        "rol": admin_obj.rol,
    }
