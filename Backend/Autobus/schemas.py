from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional

# --- EMPRESAS ---
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

# --- CONDUCTORES ---
class ConductorBase(BaseModel):
    nombre: str
    licencia: str
    activo: bool = True

class ConductorCreate(ConductorBase):
    pass

class ConductorResponse(ConductorBase):
    conductor_id: UUID
    model_config = ConfigDict(from_attributes=True)

# --- BUSES ---
class BusBase(BaseModel):
    placa: str
    capacidad: int
    empresa_id: Optional[UUID] = None
    conductor_id: Optional[UUID] = None
    estado: bool = True

class BusCreate(BusBase):
    pass

class BusResponse(BusBase):
    bus_id: UUID
    model_config = ConfigDict(from_attributes=True)
