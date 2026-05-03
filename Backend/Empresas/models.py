from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid

class Empresa(Base):
    __tablename__ = "empresas"
    __table_args__ = {"schema": "transporte"}
    empresa_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False)
    razon_social = Column(String(150), nullable=False)
    telefono = Column(String(20), nullable=False)
    color = Column(String(7), default="#1e293b")
    activa = Column(Boolean, default=True)
