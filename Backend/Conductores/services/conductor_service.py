from sqlalchemy.orm import Session
from models import Conductor
from schemas import ConductorCreate, ConductorUpdate
from utils.security import hash_password

def create_conductor(db: Session, data: ConductorCreate):
    conductor = Conductor(
        nombre=data.nombre,
        licencia=data.licencia,
        empresa_id=data.empresa_id,
        password_hash=hash_password(data.password),
        activo=data.activo
    )
    db.add(conductor)
    db.commit()
    db.refresh(conductor)
    return conductor

def get_conductores(db: Session):
    return db.query(Conductor).all()

def get_conductor_by_id(db: Session, conductor_id):
    return db.query(Conductor).filter(Conductor.conductor_id == conductor_id).first()

def update_conductor(db: Session, conductor_id: str, data: ConductorUpdate):
    conductor = get_conductor_by_id(db, conductor_id)
    if not conductor:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["password_hash"] = hash_password(update_data.pop("password"))
        
    for key, value in update_data.items():
        setattr(conductor, key, value)
        
    db.commit()
    db.refresh(conductor)
    return conductor

def delete_conductor(db: Session, conductor_id: str):
    conductor = get_conductor_by_id(db, conductor_id)
    if conductor:
        db.delete(conductor)
        db.commit()
    return conductor
