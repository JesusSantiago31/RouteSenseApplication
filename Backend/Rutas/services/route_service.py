from sqlalchemy.orm import Session
from models import Ruta, RutaParada, Parada, Lugar, Tarifa
from services.directions import get_directions
from schemas import RutaCreate, RutaParadaCreate, RutaFullCreate
from uuid import UUID

def create_route(db: Session, data: RutaCreate):
    # 1. Crear la tarifa vinculada
    nueva_tarifa = Tarifa(
        precio_base=data.monto_tarifa if data.tipo_tarifa == 'fija' else 0.0,
        costo_por_km=data.monto_tarifa if data.tipo_tarifa == 'por_parada' else 0.0,
        acepta_efectivo=data.acepta_efectivo,
        acepta_tarjeta=data.acepta_tarjeta,
        acepta_tarjeta_especial=data.acepta_tarjeta_especial
    )
    db.add(nueva_tarifa)
    db.commit()
    db.refresh(nueva_tarifa)

    # 2. Crear la ruta vinculada
    ruta_dict = data.model_dump()
    # Removemos campos que son solo para la tarifa en el esquema plano
    for f in ['tipo_tarifa', 'monto_tarifa', 'acepta_efectivo', 'acepta_tarjeta', 'acepta_tarjeta_especial']:
        ruta_dict.pop(f, None)

    ruta = Ruta(**ruta_dict, tarifa_id=nueva_tarifa.tarifa_id)
    db.add(ruta)
    db.commit()
    db.refresh(ruta)
    return ruta

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

    # 1. Crear tarifa vinculada
    nueva_tarifa = Tarifa(
        precio_base=data.monto_tarifa if data.tipo_tarifa == 'fija' else 0.0,
        costo_por_km=data.monto_tarifa if data.tipo_tarifa == 'por_parada' else 0.0,
        acepta_efectivo=data.acepta_efectivo,
        acepta_tarjeta=data.acepta_tarjeta,
        acepta_tarjeta_especial=data.acepta_tarjeta_especial
    )
    db.add(nueva_tarifa)
    db.commit()
    db.refresh(nueva_tarifa)

    # 2. Crear ruta
    ruta = Ruta(
        nombre=data.nombre,
        color=data.color,
        activa=data.activa,
        distancia_km=data.distancia_km if data.distancia_km > 0 else 1.0,
        numero_paradas=len(data.paradas_ids),
        origen_id=origen_id,
        destino_id=destino_id,
        google_polyline=data.google_polyline,
        tarifa_id=nueva_tarifa.tarifa_id
    )
    db.add(ruta)
    db.commit()
    db.refresh(ruta)

    # 3. Vincular paradas
    for idx, parada_id in enumerate(data.paradas_ids):
        rp = RutaParada(ruta_id=ruta.ruta_id, parada_id=parada_id, orden=idx+1, distancia_desde_inicio=0)
        db.add(rp)
    
    db.commit()
    return ruta

def get_routes(db: Session):
    # Join con Lugar para coordenadas y con Tarifa para precios
    results = db.query(Ruta, Lugar.latitud, Lugar.longitud, Tarifa).\
        join(Lugar, Ruta.origen_id == Lugar.lugar_id).\
        outerjoin(Tarifa, Ruta.tarifa_id == Tarifa.tarifa_id).all()
    
    routes_with_extras = []
    for ruta, lat, lng, tarifa in results:
        r_dict = {c.name: getattr(ruta, c.name) for c in ruta.__table__.columns}
        r_dict['origen_lat'] = lat
        r_dict['origen_lng'] = lng
        if tarifa:
            r_dict['tarifa'] = {c.name: getattr(tarifa, c.name) for c in tarifa.__table__.columns}
            # Mapeo plano para compatibilidad UI
            r_dict['tipo_tarifa'] = 'fija' if float(tarifa.costo_por_km) == 0 else 'por_parada'
            r_dict['monto_tarifa'] = float(tarifa.precio_base if r_dict['tipo_tarifa'] == 'fija' else tarifa.costo_por_km)
            r_dict['acepta_efectivo'] = tarifa.acepta_efectivo
            r_dict['acepta_tarjeta'] = tarifa.acepta_tarjeta
            r_dict['acepta_tarjeta_especial'] = tarifa.acepta_tarjeta_especial
            
        routes_with_extras.append(r_dict)
    return routes_with_extras

def get_route_with_stops(db: Session, ruta_id: str):
    ruta = db.query(Ruta).filter(Ruta.ruta_id == ruta_id).first()
    if not ruta: return None
    
    paradas = db.query(RutaParada).filter(RutaParada.ruta_id == ruta_id).order_by(RutaParada.orden).all()
    origen = db.query(Lugar).filter(Lugar.lugar_id == ruta.origen_id).first()
    destino = db.query(Lugar).filter(Lugar.lugar_id == ruta.destino_id).first()
    
    waypoints = []
    paradas_enriquecidas = []
    for p in paradas:
        parada_info = db.query(Parada).filter(Parada.parada_id == p.parada_id).first()
        lat, lng, nombre = None, None, "Desconocida"
        if parada_info:
            nombre = parada_info.nombre
            lugar = db.query(Lugar).filter(Lugar.lugar_id == parada_info.lugar_id).first()
            if lugar:
                lat, lng = lugar.latitud, lugar.longitud
                waypoints.append((lat, lng))
        paradas_enriquecidas.append({
            "parada_id": p.parada_id, "orden": p.orden, "nombre": nombre,
            "latitud": lat, "longitud": lng, "color": parada_info.color if parada_info else "#3498db"
        })

    polyline = None
    if origen and destino:
        dir_data = get_directions(origen.latitud, origen.longitud, destino.latitud, destino.longitud, waypoints)
        if dir_data: polyline = dir_data["polyline"]

    # Traer tarifa
    tarifa = db.query(Tarifa).filter(Tarifa.tarifa_id == ruta.tarifa_id).first()
    r_dict = {c.name: getattr(ruta, c.name) for c in ruta.__table__.columns}
    if tarifa:
        r_dict['tarifa'] = {c.name: getattr(tarifa, c.name) for c in tarifa.__table__.columns}
        r_dict['tipo_tarifa'] = 'fija' if float(tarifa.costo_por_km) == 0 else 'por_parada'
        r_dict['monto_tarifa'] = float(tarifa.precio_base if r_dict['tipo_tarifa'] == 'fija' else tarifa.costo_por_km)
        r_dict['acepta_efectivo'] = tarifa.acepta_efectivo
        r_dict['acepta_tarjeta'] = tarifa.acepta_tarjeta
        r_dict['acepta_tarjeta_especial'] = tarifa.acepta_tarjeta_especial

    return {
        "ruta": r_dict, "paradas": paradas_enriquecidas, "google_polyline": polyline
    }

def update_route(db: Session, ruta_id: str, data: RutaFullCreate):
    ruta = db.query(Ruta).filter(Ruta.ruta_id == ruta_id).first()
    if not ruta: return None
    
    # Sincronizar Tarifa
    if not ruta.tarifa_id:
        nueva_tarifa = Tarifa(
            precio_base=data.monto_tarifa if data.tipo_tarifa == 'fija' else 0.0,
            costo_por_km=data.monto_tarifa if data.tipo_tarifa == 'por_parada' else 0.0,
            acepta_efectivo=data.acepta_efectivo,
            acepta_tarjeta=data.acepta_tarjeta,
            acepta_tarjeta_especial=data.acepta_tarjeta_especial
        )
        db.add(nueva_tarifa)
        db.commit()
        db.refresh(nueva_tarifa)
        ruta.tarifa_id = nueva_tarifa.tarifa_id
    else:
        tarifa = db.query(Tarifa).filter(Tarifa.tarifa_id == ruta.tarifa_id).first()
        if tarifa:
            tarifa.precio_base = data.monto_tarifa if data.tipo_tarifa == 'fija' else 0.0
            tarifa.costo_por_km = data.monto_tarifa if data.tipo_tarifa == 'por_parada' else 0.0
            tarifa.acepta_efectivo = data.acepta_efectivo
            tarifa.acepta_tarjeta = data.acepta_tarjeta
            tarifa.acepta_tarjeta_especial = data.acepta_tarjeta_especial

    # Campos básicos
    ruta.nombre = data.nombre
    ruta.color = data.color
    ruta.activa = data.activa
    ruta.distancia_km = data.distancia_km
    ruta.google_polyline = data.google_polyline
    ruta.numero_paradas = len(data.paradas_ids)

    if len(data.paradas_ids) >= 2:
        o_parada = db.query(Parada).filter(Parada.parada_id == data.paradas_ids[0]).first()
        d_parada = db.query(Parada).filter(Parada.parada_id == data.paradas_ids[-1]).first()
        if o_parada: ruta.origen_id = o_parada.lugar_id
        if d_parada: ruta.destino_id = d_parada.lugar_id

    # Sincronizar paradas
    db.query(RutaParada).filter(RutaParada.ruta_id == ruta_id).delete()
    for idx, parada_id in enumerate(data.paradas_ids):
        rp = RutaParada(ruta_id=ruta.ruta_id, parada_id=parada_id, orden=idx+1, distancia_desde_inicio=0)
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
