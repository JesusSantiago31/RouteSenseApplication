from sqlalchemy.orm import Session
from models import Ruta, RutaParada
from schemas import RutaCreate, RutaParadaCreate

def create_route(db: Session, data: RutaCreate):
    ruta = Ruta(**data.model_dump())
    db.add(ruta)
    db.commit()
    db.refresh(ruta)
    return ruta

def get_routes(db: Session):
    return db.query(Ruta).all()

def add_stop_to_route(db: Session, ruta_id: str, data: RutaParadaCreate):
    nueva_parada = RutaParada(ruta_id=ruta_id, **data.model_dump())
    db.add(nueva_parada)
    # Actualizamos el número de paradas en la ruta
    ruta = db.query(Ruta).filter(Ruta.ruta_id == ruta_id).first()
    if ruta:
        ruta.numero_paradas += 1
    db.commit()
    db.refresh(nueva_parada)
    return nueva_parada

def get_route_with_stops(db: Session, ruta_id: str):
    ruta = db.query(Ruta).filter(Ruta.ruta_id == ruta_id).first()
    if not ruta:
        return None
    paradas = db.query(RutaParada).filter(RutaParada.ruta_id == ruta_id).order_by(RutaParada.orden).all()
    return {"ruta": ruta, "paradas": paradas}
