from pydantic import BaseModel, ConfigDict
from uuid import UUID
from decimal import Decimal

class RutaBase(BaseModel):
    origen_id: UUID
    destino_id: UUID
    distancia_km: Decimal
    activa: bool = True
    numero_paradas: int = 0

class RutaCreate(RutaBase):
    pass

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
