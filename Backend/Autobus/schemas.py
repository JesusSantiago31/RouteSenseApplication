from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class EmpresaBase(BaseModel):
    nombre: str
    razon_social: str
    telefono: str
    color: str = "#1e293b"
    activa: bool = True

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaResponse(EmpresaBase):
    empresa_id: UUID
    model_config = ConfigDict(from_attributes=True)

class AutobusBase(BaseModel):
    placa: str
    capacidad: int
    empresa_id: UUID | None = None
    conductor_id: UUID | None = None
    estado: bool = True

class AutobusCreate(AutobusBase):
    pass

class AutobusResponse(AutobusBase):
    bus_id: UUID
    model_config = ConfigDict(from_attributes=True)
