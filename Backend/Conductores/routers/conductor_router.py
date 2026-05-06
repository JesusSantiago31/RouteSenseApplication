from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import ConductorCreate, ConductorResponse, ConductorUpdate
from services import conductor_service
from typing import List
from utils.security import verify_password, create_access_token
from pydantic import BaseModel
import models

router = APIRouter(prefix="/conductores", tags=["Conductores"])

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

@router.post("/", response_model=ConductorResponse)
def crear_conductor(data: ConductorCreate, db: Session = Depends(get_db)):
    try:
        return conductor_service.create_conductor(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ConductorResponse])
def listar_conductores(db: Session = Depends(get_db)):
    return conductor_service.get_conductores(db)

@router.get("/{conductor_id}", response_model=ConductorResponse)
def obtener_conductor(conductor_id: str, db: Session = Depends(get_db)):
    conductor = conductor_service.get_conductor_by_id(db, conductor_id)
    if not conductor:
        raise HTTPException(status_code=404, detail="Conductor no encontrado")
    return conductor

@router.put("/{conductor_id}", response_model=ConductorResponse)
def actualizar_conductor(conductor_id: str, data: ConductorUpdate, db: Session = Depends(get_db)):
    try:
        conductor = conductor_service.update_conductor(db, conductor_id, data)
        if not conductor:
            raise HTTPException(status_code=404, detail="Conductor no encontrado")
        return conductor
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{conductor_id}")
def eliminar_conductor(conductor_id: str, db: Session = Depends(get_db)):
    conductor = conductor_service.delete_conductor(db, conductor_id)
    if not conductor:
        raise HTTPException(status_code=404, detail="Conductor no encontrado")
    return {"detail": "Conductor eliminado correctamente"}

@router.post("/login")
def login_conductor(data: ConductorLogin, db: Session = Depends(get_db)):
    conductor = db.query(models.Conductor).filter(models.Conductor.licencia == data.licencia).first()
    
    if not conductor:
        raise HTTPException(status_code=401, detail="Matrícula no encontrada")
    
    if conductor.nombre.lower() != data.nombre_completo.lower():
        raise HTTPException(status_code=401, detail="El nombre no coincide")
        
    if not verify_password(data.password, conductor.password_hash):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
        
    access_token = create_access_token(data={"sub": str(conductor.conductor_id), "role": "conductor"})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "conductor": {
            "id": conductor.conductor_id,
            "nombre": conductor.nombre,
            "licencia": conductor.licencia
        }
    }
