from pydantic import BaseModel, ConfigDict
from uuid import UUID
from decimal import Decimal

class RutaBase(BaseModel):
    nombre: str = "Nueva Ruta"
    origen_id: UUID
    destino_id: UUID
    distancia_km: Decimal
    activa: bool = True
    numero_paradas: int = 0
    color: str = "#3498db"
    google_polyline: str | None = None

class RutaCreate(RutaBase):
    pass

from typing import List

class RutaFullCreate(BaseModel):
    nombre: str = "Nueva Ruta"
    color: str = "#3498db"
    activa: bool = True
    distancia_km: Decimal = 0.0
    paradas_ids: List[UUID] = []
    google_polyline: str | None = None

class RutaResponse(RutaBase):
    ruta_id: UUID
    model_config = ConfigDict(from_attributes=True)

class RutaParadaBase(BaseModel):
    parada_id: UUID
    orden: int
    distancia_desde_inicio: Decimal

class RutaParadaCreate(RutaParadaBase):
    pass

class RutaParadaResponse(RutaParadaBase):
    ruta_id: UUID
    model_config = ConfigDict(from_attributes=True)
