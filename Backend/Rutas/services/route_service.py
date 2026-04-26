from sqlalchemy.orm import Session
from models import Ruta, RutaParada, Parada, Lugar
from services.directions import get_directions
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
    
    # Obtener el Polyline usando Google Maps API
    polyline = None
    origen = db.query(Lugar).filter(Lugar.lugar_id == ruta.origen_id).first()
    destino = db.query(Lugar).filter(Lugar.lugar_id == ruta.destino_id).first()
    
    if origen and destino and origen.latitud and destino.latitud:
        waypoints = []
        paradas_enriquecidas = []
        
        for p in paradas:
            lat, lng, nombre_parada = None, None, "Desconocida"
            parada_info = db.query(Parada).filter(Parada.parada_id == p.parada_id).first()
            if parada_info:
                nombre_parada = parada_info.nombre
                lugar_info = db.query(Lugar).filter(Lugar.lugar_id == parada_info.lugar_id).first()
                if lugar_info and lugar_info.latitud and lugar_info.longitud:
                    lat, lng = lugar_info.latitud, lugar_info.longitud
                    waypoints.append((lat, lng))
                    
            paradas_enriquecidas.append({
                "parada_id": p.parada_id,
                "orden": p.orden,
                "nombre": nombre_parada,
                "latitud": lat,
                "longitud": lng
            })
                    
        dir_data = get_directions(origen.latitud, origen.longitud, destino.latitud, destino.longitud, waypoints)
        if dir_data:
            polyline = dir_data["polyline"]
            # Podríamos actualizar la distancia total de la ruta aquí si es necesario
    
    return {
        "ruta": ruta, 
        "paradas": paradas_enriquecidas if 'paradas_enriquecidas' in locals() else paradas, 
        "google_polyline": polyline
    }
