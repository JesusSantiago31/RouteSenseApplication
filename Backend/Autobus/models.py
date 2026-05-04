from sqlalchemy import Column, String, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class Empresa(Base):
    __tablename__ = "empresas"
    __table_args__ = {"schema": "transporte"}
    empresa_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False)
    razon_social = Column(String(150), nullable=False)
    telefono = Column(String(20), nullable=False)
    color = Column(String(7), default="#1e293b")
    activa = Column(Boolean, default=True)

class Autobus(Base):
    __tablename__ = "autobuses"
    __table_args__ = {"schema": "transporte"}
    bus_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conductor_id = Column(UUID(as_uuid=True), nullable=True)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey("transporte.empresas.empresa_id", ondelete="CASCADE"), nullable=True)
    empresa = Column(String(100), nullable=True)
    placa = Column(String(15), unique=True, nullable=False)
    capacidad = Column(Integer, nullable=False)
    estado = Column(Boolean, nullable=False, default=True)
    color = Column(String(7), nullable=True)
    ruta_id = Column(UUID(as_uuid=True), nullable=True)

    empresa_rel = relationship("Empresa")
