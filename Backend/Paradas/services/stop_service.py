from sqlalchemy.orm import Session
from models import Lugar, Parada
from schemas import ParadaCreate

def create_stop(db: Session, data: ParadaCreate):
    # Primero buscamos si el lugar ya existe por nombre o coordenadas exactas (opcional)
    # Por ahora creamos uno nuevo por cada parada (según el esquema SQL)
    lugar = Lugar(
        nombre_lugar=data.nombre_lugar,
        latitud=data.latitud,
        longitud=data.longitud,
        estado=data.estado,
        municipio=data.municipio,
        localidad=data.localidad
    )
    db.add(lugar)
    db.flush() # Para obtener el lugar_id

    parada = Parada(
        lugar_id=lugar.lugar_id,
        nombre=data.nombre,
        activa=data.activa
    )
    db.add(parada)
    db.commit()
    db.refresh(parada)
    return parada

def get_stops(db: Session):
    return db.query(Parada).all()

def get_stop_by_id(db: Session, parada_id: str):
    return db.query(Parada).filter(Parada.parada_id == parada_id).first()

def delete_stop(db: Session, parada_id: str):
    parada = db.query(Parada).filter(Parada.parada_id == parada_id).first()
    if parada:
        db.delete(parada)
        db.commit()
    return parada
