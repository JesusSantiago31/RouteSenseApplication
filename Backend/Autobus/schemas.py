from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class BusBase(BaseModel):
    placa: str
    capacidad: int
    empresa: str
    conductor_id: Optional[UUID] = None
    estado: bool = True

class BusCreate(BusBase):
    pass

class BusResponse(BusBase):
    bus_id: UUID

    class Config:
        from_attributes = True
