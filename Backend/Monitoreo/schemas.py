from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class PosicionBase(BaseModel):
    bus_id: UUID
    conductor_id: UUID
    latitud: float
    longitud: float
    velocidad: Optional[float] = 0

class PosicionCreate(PosicionBase):
    pass

class PosicionResponse(PosicionBase):
    posicion_id: UUID
    ultima_actualizacion: datetime

class ParadaSolicitudCreate(BaseModel):
    user_id: UUID
    bus_id: UUID
    parada_id: UUID
    tipo: str = "subir"

class ParadaSolicitudResponse(ParadaSolicitudCreate):
    solicitud_id: UUID
    estado: str
    fecha_solicitud: datetime
