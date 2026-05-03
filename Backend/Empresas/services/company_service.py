from sqlalchemy.orm import Session
from models import Empresa
from schemas import EmpresaCreate

def create_company(db: Session, data: EmpresaCreate):
    nueva_empresa = Empresa(**data.model_dump())
    db.add(nueva_empresa)
    db.commit()
    db.refresh(nueva_empresa)
    return nueva_empresa

def get_companies(db: Session):
    return db.query(Empresa).all()

def get_company_by_id(db: Session, empresa_id: str):
    return db.query(Empresa).filter(Empresa.empresa_id == empresa_id).first()

def delete_company(db: Session, empresa_id: str):
    empresa = db.query(Empresa).filter(Empresa.empresa_id == empresa_id).first()
    if empresa:
        db.delete(empresa)
        db.commit()
    return empresa
