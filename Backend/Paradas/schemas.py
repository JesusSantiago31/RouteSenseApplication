from pydantic import BaseModel, ConfigDict
from uuid import UUID
from decimal import Decimal

class LugarBase(BaseModel):
    nombre_lugar: str
    latitud: Decimal
    longitud: Decimal
    estado: str
    municipio: str
    localidad: str

class LugarCreate(LugarBase):
    pass

class LugarResponse(LugarBase):
    lugar_id: UUID
    model_config = ConfigDict(from_attributes=True)

class ParadaBase(BaseModel):
    nombre: str
    activa: bool = True

class ParadaCreate(ParadaBase):
    nombre_lugar: str
    latitud: Decimal
    longitud: Decimal
    estado: str
    municipio: str
    localidad: str

class ParadaResponse(ParadaBase):
    parada_id: UUID
    lugar: LugarResponse
    model_config = ConfigDict(from_attributes=True)
