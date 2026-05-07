from sqlalchemy.orm import Session
from models import Posicion, ParadaSolicitada
from schemas import PosicionCreate, ParadaSolicitudCreate
from uuid import UUID

def update_position(db: Session, data: PosicionCreate):
    posicion = db.query(Posicion).filter(Posicion.bus_id == data.bus_id).first()
    if posicion:
        posicion.conductor_id = data.conductor_id
        posicion.latitud = data.latitud
        posicion.longitud = data.longitud
        posicion.velocidad = data.velocidad
    else:
        posicion = Posicion(**data.model_dump())
        db.add(posicion)
    db.commit()
    db.refresh(posicion)
    return posicion

from datetime import datetime, timedelta

def get_all_positions(db: Session):
    # Solo devolver posiciones actualizadas en el último minuto para garantizar tiempo real
    umbral = datetime.utcnow() - timedelta(seconds=60)
    return db.query(Posicion).filter(Posicion.ultima_actualizacion >= umbral).all()

# Solicitudes de parada
def create_stop_request(db: Session, data: ParadaSolicitudCreate):
    solicitud = ParadaSolicitada(**data.model_dump())
    db.add(solicitud)
    db.commit()
    db.refresh(solicitud)
    return solicitud

def cancel_stop_request(db: Session, solicitud_id: UUID):
    solicitud = db.query(ParadaSolicitada).filter(ParadaSolicitada.solicitud_id == solicitud_id).first()
    if solicitud:
        solicitud.estado = "cancelada"
        db.commit()
        db.refresh(solicitud)
    return solicitud

def get_active_requests_by_user(db: Session, user_id: UUID):
    return db.query(ParadaSolicitada).filter(
        ParadaSolicitada.user_id == user_id, 
        ParadaSolicitada.estado == "pendiente"
    ).all()
