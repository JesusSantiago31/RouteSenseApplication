from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime

class ClientRegister(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str

class ClientResponse(BaseModel):
    user_id: UUID
    nombre: str
    apellido: str
    email: str
    fecha_creacion: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
