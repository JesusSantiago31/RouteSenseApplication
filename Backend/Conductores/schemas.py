from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional

class ConductorBase(BaseModel):
    nombre: str
    licencia: str
    empresa_id: Optional[UUID] = None
    activo: bool = True

class ConductorCreate(ConductorBase):
    pass

class ConductorResponse(ConductorBase):
    conductor_id: UUID
    model_config = ConfigDict(from_attributes=True)
