from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid

class Conductor(Base):
    __tablename__ = "conductores"
    __table_args__ = {"schema": "seguridad"}
    conductor_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    empresa_id = Column(UUID(as_uuid=True), nullable=True)
    nombre = Column(String(100), nullable=False)
    licencia = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    activo = Column(Boolean, default=True)
