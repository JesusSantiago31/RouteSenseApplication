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

from schemas import RutaFullCreate

def create_full_route(db: Session, data: RutaFullCreate):
    origen_id = None
    destino_id = None
    
    if len(data.paradas_ids) >= 2:
        o_parada = db.query(Parada).filter(Parada.parada_id == data.paradas_ids[0]).first()
        d_parada = db.query(Parada).filter(Parada.parada_id == data.paradas_ids[-1]).first()
        if o_parada: origen_id = o_parada.lugar_id
        if d_parada: destino_id = d_parada.lugar_id

    if not origen_id or not destino_id:
        raise ValueError("No se pudieron determinar el origen y destino desde las paradas")

    ruta = Ruta(
        nombre=data.nombre,
        color=data.color,
        activa=data.activa,
        distancia_km=data.distancia_km if data.distancia_km > 0 else 1.0,
        numero_paradas=len(data.paradas_ids),
        origen_id=origen_id,
        destino_id=destino_id,
        google_polyline=data.google_polyline
    )
    db.add(ruta)
    db.commit()
    db.refresh(ruta)

    for idx, parada_id in enumerate(data.paradas_ids):
        rp = RutaParada(ruta_id=ruta.ruta_id, parada_id=parada_id, orden=idx+1, distancia_desde_inicio=0)
        db.add(rp)
    
    db.commit()
    return ruta

def get_routes(db: Session):
    # Usamos un join para traer las coordenadas del origen y destino
    from models import Lugar
    results = db.query(Ruta, Lugar.latitud, Lugar.longitud).\
        join(Lugar, Ruta.origen_id == Lugar.lugar_id).all()
    
    routes_with_coords = []
    for ruta, lat, lng in results:
        # Convertimos el objeto de SQLAlchemy a un diccionario y añadimos las coordenadas
        r_dict = {c.name: getattr(ruta, c.name) for c in ruta.__table__.columns}
        r_dict['origen_lat'] = lat
        r_dict['origen_lng'] = lng
        routes_with_coords.append(r_dict)
        
    return routes_with_coords

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
                "longitud": lng,
                "color": parada_info.color if parada_info else "#3498db"
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

def update_route(db: Session, ruta_id: str, data: RutaFullCreate):
    ruta = db.query(Ruta).filter(Ruta.ruta_id == ruta_id).first()
    if not ruta:
        return None
    
    # Actualizar campos básicos
    ruta.nombre = data.nombre
    ruta.color = data.color
    ruta.activa = data.activa
    ruta.distancia_km = data.distancia_km
    ruta.google_polyline = data.google_polyline
    ruta.numero_paradas = len(data.paradas_ids)

    # Determinar origen y destino desde las nuevas paradas
    if len(data.paradas_ids) >= 2:
        o_parada = db.query(Parada).filter(Parada.parada_id == data.paradas_ids[0]).first()
        d_parada = db.query(Parada).filter(Parada.parada_id == data.paradas_ids[-1]).first()
        if o_parada: ruta.origen_id = o_parada.lugar_id
        if d_parada: ruta.destino_id = d_parada.lugar_id

    # Sincronizar paradas en transporte.rutas_paradas
    # Primero eliminamos las asociaciones actuales
    db.query(RutaParada).filter(RutaParada.ruta_id == ruta_id).delete()
    
    # Insertamos la nueva secuencia de paradas
    for idx, parada_id in enumerate(data.paradas_ids):
        rp = RutaParada(
            ruta_id=ruta.ruta_id, 
            parada_id=parada_id, 
            orden=idx+1, 
            distancia_desde_inicio=0
        )
        db.add(rp)

    db.commit()
    db.refresh(ruta)
    return ruta

def delete_route(db: Session, ruta_id: str):
    ruta = db.query(Ruta).filter(Ruta.ruta_id == ruta_id).first()
    if ruta:
        db.delete(ruta)
        db.commit()
    return ruta
