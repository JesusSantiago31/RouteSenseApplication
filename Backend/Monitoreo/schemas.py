from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from decimal import Decimal

class PosicionBase(BaseModel):
    bus_id: UUID
    conductor_id: UUID
    latitud: Decimal
    longitud: Decimal
    velocidad: Decimal | None = None

class PosicionCreate(PosicionBase):
    pass

class PosicionResponse(PosicionBase):
    posicion_id: UUID
    ultima_actualizacion: datetime

    class Config:
        from_attributes = True
