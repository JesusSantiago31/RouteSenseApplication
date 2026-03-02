from pydantic import BaseModel, EmailStr
from uuid import UUID

class AdminCreate(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    rol: str = "admin"

class AdminResponse(BaseModel):
    user_id: UUID
    nombre: str
    apellido: str
    email: str
    rol: str

class AdminUpdateRole(BaseModel):
    rol: str
