from sqlalchemy.orm import Session
from models import Posicion
from schemas import PosicionCreate
from uuid import UUID

def update_position(db: Session, data: PosicionCreate):
    # Buscar si ya existe una posición para este bus
    posicion = db.query(Posicion).filter(Posicion.bus_id == data.bus_id).first()
    
    if posicion:
        # Actualizar existente
        posicion.conductor_id = data.conductor_id
        posicion.latitud = data.latitud
        posicion.longitud = data.longitud
        posicion.velocidad = data.velocidad
    else:
        # Crear nueva entrada
        posicion = Posicion(**data.model_dump())
        db.add(posicion)
    
    db.commit()
    db.refresh(posicion)
    return posicion

def get_all_positions(db: Session):
    return db.query(Posicion).all()

def get_bus_position(db: Session, bus_id: UUID):
    return db.query(Posicion).filter(Posicion.bus_id == bus_id).first()
