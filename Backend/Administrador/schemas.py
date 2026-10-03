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

# Schemas para Sistema de Sellos y Google Wallet Pass
class ImagenSelloCreate(BaseModel):
    stamp_count: int
    image_url: str
    wallet_hero_url: str | None = None
    nombre_sello: str | None = "Tarjeta de Lealtad"

class ImagenSelloResponse(BaseModel):
    id: UUID
    stamp_count: int
    image_url: str
    wallet_hero_url: str | None = None
    nombre_sello: str | None

    class Config:
        from_attributes = True

class ConfigSellosCreate(BaseModel):
    max_stamps: int = 10
    reward_points_bonus: int = 50
    reward_description: str | None = "Recompensa por tarjeta de sellos completada"
    is_active: bool = True

class ConfigSellosResponse(BaseModel):
    id: UUID
    max_stamps: int
    reward_points_bonus: int
    reward_description: str | None
    is_active: bool

    class Config:
        from_attributes = True


