from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class BusBase(BaseModel):
    placa: str
    capacidad: int
    empresa_id: Optional[UUID] = None
    empresa: Optional[str] = None
    conductor_id: Optional[UUID] = None
    estado: bool = True
    color: Optional[str] = None

class BusCreate(BusBase):
    pass

class BusResponse(BusBase):
    bus_id: UUID

    class Config:
        from_attributes = True
