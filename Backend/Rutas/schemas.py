from pydantic import BaseModel, ConfigDict
from uuid import UUID
from decimal import Decimal
from typing import Optional, List

class TarifaBase(BaseModel):
    precio_base: float = 0.0
    costo_por_km: float = 0.0
    activa: bool = True
    acepta_efectivo: bool = True
    acepta_tarjeta: bool = False
    acepta_tarjeta_especial: bool = False

class TarifaCreate(TarifaBase):
    pass

class TarifaResponse(TarifaBase):
    tarifa_id: UUID
    model_config = ConfigDict(from_attributes=True)

class RutaBase(BaseModel):
    nombre: str = "Nueva Ruta"
    origen_id: UUID
    destino_id: UUID
    distancia_km: Decimal
    activa: bool = True
    numero_paradas: int = 0
    color: Optional[str] = "#3498db"
    google_polyline: Optional[str] = None
    # Campos temporales para recibir del front
    tipo_tarifa: Optional[str] = "fija"
    monto_tarifa: Optional[float] = 0.0
    acepta_efectivo: bool = True
    acepta_tarjeta: bool = False
    acepta_tarjeta_especial: bool = False

class RutaCreate(RutaBase):
    pass

class RutaFullCreate(BaseModel):
    nombre: str = "Nueva Ruta"
    color: str = "#3498db"
    activa: bool = True
    distancia_km: Decimal = 0.0
    paradas_ids: List[UUID] = []
    google_polyline: str | None = None
    # Campos de tarifas para creación completa
    tipo_tarifa: Optional[str] = "fija"
    monto_tarifa: Optional[float] = 0.0
    acepta_efectivo: bool = True
    acepta_tarjeta: bool = False
    acepta_tarjeta_especial: bool = False

class RutaResponse(RutaBase):
    ruta_id: UUID
    origen_lat: Optional[Decimal] = None
    origen_lng: Optional[Decimal] = None
    tarifa: Optional[TarifaResponse] = None
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
