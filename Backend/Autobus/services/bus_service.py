from sqlalchemy.orm import Session
from models import Autobus
from schemas import BusCreate

def create_bus(db: Session, data: BusCreate):
    bus = Autobus(
        placa=data.placa,
        capacidad=data.capacidad,
        empresa_id=data.empresa_id,
        empresa=data.empresa,
        conductor_id=data.conductor_id,
        estado=data.estado,
        color=data.color
    )
    db.add(bus)
    db.commit()
    db.refresh(bus)
    return bus

def get_buses(db: Session):
    return db.query(Autobus).all()

def update_bus(db: Session, bus_id: str, data: BusCreate):
    bus = db.query(Autobus).filter(Autobus.bus_id == bus_id).first()
    if bus:
        for key, value in data.model_dump().items():
            setattr(bus, key, value)
        db.commit()
        db.refresh(bus)
    return bus

def delete_bus(db: Session, bus_id: str):
    bus = db.query(Autobus).filter(Autobus.bus_id == bus_id).first()
    if bus:
        db.delete(bus)
        db.commit()
        return True
    return False
