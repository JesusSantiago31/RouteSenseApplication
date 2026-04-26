from sqlalchemy.orm import Session
from models import Lugar, Parada
from schemas import ParadaCreate
from services.geocoding import get_coordinates

def create_stop(db: Session, data: ParadaCreate):
    # Calcular coordenadas con Geocoding de Google Maps si vienen vacías
    latitud_final = data.latitud
    longitud_final = data.longitud

    if latitud_final is None or longitud_final is None:
        direccion_completa = f"{data.nombre_lugar}, {data.municipio}, {data.estado}"
        lat, lng = get_coordinates(direccion_completa)
        if lat and lng:
            latitud_final = lat
            longitud_final = lng

    lugar = Lugar(
        nombre_lugar=data.nombre_lugar,
        latitud=latitud_final,
        longitud=longitud_final,
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
