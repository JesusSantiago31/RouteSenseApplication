from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models, schemas
from services import tracking_service
from fastapi.middleware.cors import CORSMiddleware
from typing import List

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

@app.get("/tracking/{bus_id}", response_model=schemas.PosicionResponse)
def get_bus_position(bus_id: str, db: Session = Depends(get_db)):
    return tracking_service.get_bus_position(db, bus_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
