from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional

class ConductorBase(BaseModel):
    nombre: str
    licencia: str
    empresa_id: Optional[UUID] = None
    activo: bool = True

class ConductorCreate(ConductorBase):
    password: str

class ConductorUpdate(BaseModel):
    nombre: Optional[str] = None
    licencia: Optional[str] = None
    password: Optional[str] = None
    empresa_id: Optional[UUID] = None
    activo: Optional[bool] = None

class ConductorResponse(ConductorBase):
    conductor_id: UUID
    model_config = ConfigDict(from_attributes=True)
