from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import EmpresaCreate, EmpresaResponse
from services import company_service
from typing import List

router = APIRouter(prefix="/companies", tags=["Empresas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=EmpresaResponse)
def crear_empresa(data: EmpresaCreate, db: Session = Depends(get_db)):
    return company_service.create_company(db, data)

@router.get("/", response_model=List[EmpresaResponse])
def listar_empresas(db: Session = Depends(get_db)):
    return company_service.get_companies(db)

@router.delete("/{empresa_id}")
def eliminar_empresa(empresa_id: str, db: Session = Depends(get_db)):
    empresa = company_service.delete_company(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return {"message": "Empresa eliminada correctamente"}
