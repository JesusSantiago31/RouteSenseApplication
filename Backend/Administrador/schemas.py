from pydantic import BaseModel, EmailStr
from uuid import UUID

from typing import Literal

class AdminCreate(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    rol: Literal["admin", "superadmin"] = "admin"

class AdminResponse(BaseModel):
    user_id: UUID
    nombre: str
    apellido: str
    email: str
    rol: Literal["admin", "superadmin"]

class AdminUpdateRole(BaseModel):
    rol: str

# Conductores
class ConductorCreate(BaseModel):
    nombre: str
    licencia: str
    activo: bool = True

class ConductorResponse(BaseModel):
    conductor_id: UUID
    nombre: str
    licencia: str
    activo: bool

    class Config:
        from_attributes = True

# Autobuses
class BusCreate(BaseModel):
    placa: str
    capacidad: int
    empresa: str
    conductor_id: UUID | None = None
    estado: bool = True

class BusResponse(BaseModel):
    bus_id: UUID
    placa: str
    capacidad: int
    empresa: str
    conductor_id: UUID | None
    estado: bool

    class Config:
        from_attributes = True

# Reglas de Puntos por Dinero Gastado
class ReglaPuntosCreate(BaseModel):
    monto_dinero: int
    puntos_otorgados: int
    descripcion: str | None = None
    activa: bool = True

class ReglaPuntosResponse(BaseModel):
    rule_id: UUID
    monto_dinero: int
    puntos_otorgados: int
    descripcion: str | None = None
    activa: bool

    class Config:
        from_attributes = True

