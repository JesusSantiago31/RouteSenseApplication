from sqlalchemy import Column, String, ForeignKey, Boolean, Numeric
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class Lugar(Base):
    __tablename__ = "lugares"

    lugar_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre_lugar = Column(String(70), nullable=False)
    latitud = Column(Numeric(9,6), nullable=False)
    longitud = Column(Numeric(9,6), nullable=False)
    estado = Column(String(50), nullable=False)
    municipio = Column(String(50), nullable=False)
    localidad = Column(String(50), nullable=False)

class Parada(Base):
    __tablename__ = "paradas"
    __table_args__ = {"schema": "transporte"}

    parada_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lugar_id = Column(UUID(as_uuid=True), ForeignKey("lugares.lugar_id"), nullable=False)
    nombre = Column(String(70), nullable=False)
    activa = Column(Boolean, default=True)

class Administrador(Base):
    __tablename__ = "administradores"
    user_id = Column(UUID(as_uuid=True), primary_key=True)
    rol = Column(String(20), nullable=False)
