from sqlalchemy.orm import Session
from models import Autobus, RutaAutobus
from schemas import BusCreate
from uuid import UUID

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

def assign_bus_to_route(db: Session, bus_id: UUID, ruta_id: UUID):
    assignment = RutaAutobus(bus_id=bus_id, ruta_id=ruta_id)
    db.add(assignment)
    db.commit()
    return assignment
