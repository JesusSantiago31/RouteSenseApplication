from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
from models import ReglaPuntos
from schemas import ReglaPuntosCreate, ReglaPuntosResponse
from utils.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["Puntos y Bonificaciones"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/puntos-config", response_model=ReglaPuntosResponse)
def obtener_regla_puntos(db: Session = Depends(get_db)):
    """
    Obtiene la regla activa de bonificación de puntos por dinero gastado.
    """
    regla = db.query(ReglaPuntos).filter(ReglaPuntos.activa == True).order_by(ReglaPuntos.fecha_actualizacion.desc()).first()
    if not regla:
        # Regla por defecto si no existe en BD aún
        regla = ReglaPuntos(monto_dinero=10, puntos_otorgados=1, descripcion="1 punto por cada $10 gastados", activa=True)
        db.add(regla)
        db.commit()
        db.refresh(regla)
    return regla

@router.post("/puntos-config", response_model=ReglaPuntosResponse)
def guardar_regla_puntos(payload: ReglaPuntosCreate, db: Session = Depends(get_db), admin_current = Depends(get_current_admin)):
    """
    Crea o actualiza la regla activa de bonificación de puntos por dinero gastado.
    """
    if payload.monto_dinero <= 0:
        raise HTTPException(status_code=400, detail="El monto de dinero debe ser mayor a 0.")
    if payload.puntos_otorgados < 0:
        raise HTTPException(status_code=400, detail="Los puntos otorgados no pueden ser negativos.")

    # Desactivar reglas anteriores para mantener historial si se desea
    db.query(ReglaPuntos).update({ReglaPuntos.activa: False})

    desc = payload.descripcion or f"{payload.puntos_otorgados} punto(s) por cada ${payload.monto_dinero} gastados"

    nueva_regla = ReglaPuntos(
        monto_dinero=payload.monto_dinero,
        puntos_otorgados=payload.puntos_otorgados,
        descripcion=desc,
        activa=True
    )
    db.add(nueva_regla)
    db.commit()
    db.refresh(nueva_regla)
    return nueva_regla
