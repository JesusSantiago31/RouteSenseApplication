from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Conductor
from utils.security import verify_password, create_access_token
from pydantic import BaseModel

router = APIRouter(prefix="/conductores", tags=["Auth Conductor"])

class ConductorLogin(BaseModel):
    licencia: str
    nombre_completo: str
    password: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
def login_conductor(data: ConductorLogin, db: Session = Depends(get_db)):
    # 1. Buscar por licencia (matrícula)
    conductor = db.query(Conductor).filter(Conductor.licencia == data.licencia).first()
    
    if not conductor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Matrícula no encontrada"
        )
    
    # 2. Validar que el nombre coincida (opcional, pero pedido por el usuario)
    if conductor.nombre.lower() != data.nombre_completo.lower():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El nombre no coincide con la matrícula"
        )
    
    # 3. Verificar contraseña
    if not verify_password(data.password, conductor.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta"
        )
    
    # 4. Generar Token
    access_token = create_access_token(
        data={"sub": str(conductor.conductor_id), "role": "conductor"}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "conductor": {
            "id": conductor.conductor_id,
            "nombre": conductor.nombre,
            "licencia": conductor.licencia
        }
    }
