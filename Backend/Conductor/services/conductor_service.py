from sqlalchemy.orm import Session
from models import Conductor
from schemas import ConductorCreate
from utils.security import hash_password

def create_conductor(db: Session, data: ConductorCreate):
    conductor = Conductor(
        nombre=data.nombre,
        licencia=data.licencia,
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
