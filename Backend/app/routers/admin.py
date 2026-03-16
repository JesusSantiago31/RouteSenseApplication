from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import AdminCreate, AdminResponse, AdminUpdateRole
from services.admin_service import create_admin
from models import Usuario, Administrador
from utils.dependencies import get_current_admin
from main import limiter

router = APIRouter(prefix="/admin", tags=["Administradores"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Crear administrador
@router.post("/", response_model=AdminResponse)
@limiter.limit("5/minute")
def crear_admin(request: Request, data: AdminCreate, db: Session = Depends(get_db), admin_current = Depends(get_current_admin)):
    usuario, admin_obj = create_admin(db, data)

    return {
        "user_id": usuario.user_id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email,
        "rol": admin.rol,
    }

# Listar administradores
@router.get("/")
def listar_admins(db: Session = Depends(get_db)):
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

# Obtener administrador
@router.get("/{admin_id}")
def obtener_admin(admin_id: str, db: Session = Depends(get_db)):
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

# Actualizar rol
@router.patch("/{admin_id}/rol")
def actualizar_rol(admin_id: str, data: AdminUpdateRole, db: Session = Depends(get_db)):
    admin = db.query(Administrador).filter_by(user_id=admin_id).first()
    if not admin:
        raise HTTPException(404, "Administrador no encontrado")

    admin.rol = data.rol
    db.commit()
    return {"mensaje": "Rol actualizado"}

# Eliminar administrador
@router.delete("/{admin_id}")
def eliminar_admin(admin_id: str, db: Session = Depends(get_db)):
    admin = db.query(Administrador).filter_by(user_id=admin_id).first()
    if not admin:
        raise HTTPException(404, "Administrador no encontrado")

    db.delete(admin)
    db.commit()
    return {"mensaje": "Administrador eliminado"}
