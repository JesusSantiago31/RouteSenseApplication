from sqlalchemy.orm import Session
from models import Autobus
from schemas import BusCreate

def create_bus(db: Session, data: BusCreate):
    bus = Autobus(
        placa=data.placa,
        capacidad=data.capacidad,
        empresa=data.empresa,
        conductor_id=data.conductor_id,
        estado=data.estado
    )
    db.add(bus)
    db.commit()
    db.refresh(bus)
    return bus

def get_buses(db: Session):
    return db.query(Autobus).all()
