from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models, schemas
from services import tracking_service
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from uuid import UUID

# Crear tablas si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="RouteSense Monitoring Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/tracking/update", response_model=schemas.PosicionResponse)
def update_bus_position(data: schemas.PosicionCreate, db: Session = Depends(get_db)):
    """Endpoint para que el conductor (móvil) envíe su ubicación"""
    return tracking_service.update_position(db, data)

@app.get("/tracking/positions", response_model=List[schemas.PosicionResponse])
def get_positions(db: Session = Depends(get_db)):
    """Endpoint para que el dashboard obtenga todas las ubicaciones actuales"""
    return tracking_service.get_all_positions(db)

# Endpoints de Solicitud de Parada
@app.post("/requests/", response_model=schemas.ParadaSolicitudResponse)
def solicitar_parada(data: schemas.ParadaSolicitudCreate, db: Session = Depends(get_db)):
    return tracking_service.create_stop_request(db, data)

@app.put("/requests/{solicitud_id}/cancel", response_model=schemas.ParadaSolicitudResponse)
def cancelar_solicitud(solicitud_id: UUID, db: Session = Depends(get_db)):
    solicitud = tracking_service.cancel_stop_request(db, solicitud_id)
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return solicitud

@app.get("/requests/user/{user_id}", response_model=List[schemas.ParadaSolicitudResponse])
def obtener_solicitudes_usuario(user_id: UUID, db: Session = Depends(get_db)):
    return tracking_service.get_active_requests_by_user(db, user_id)

@app.get("/requests/bus/{bus_id}", response_model=List[schemas.ParadaSolicitudResponse])
def obtener_solicitudes_autobus(bus_id: UUID, db: Session = Depends(get_db)):
    return tracking_service.get_active_requests_by_bus(db, bus_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
