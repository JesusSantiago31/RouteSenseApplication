from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())

class Administrador(Base):
    __tablename__ = "administradores"
    user_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.user_id", ondelete="CASCADE"), primary_key=True)
    rol = Column(String(20), nullable=False, default="admin")

class Conductor(Base):
    __tablename__ = "conductores"
    __table_args__ = {"schema": "seguridad"}
    conductor_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False)
    licencia = Column(String(50), unique=True, nullable=False)
    activo = Column(Boolean, default=True)

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
    conductor_id = Column(UUID(as_uuid=True), ForeignKey("seguridad.conductores.conductor_id", ondelete="SET NULL"), nullable=True)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey("transporte.empresas.empresa_id", ondelete="CASCADE"), nullable=True)
    placa = Column(String(15), unique=True, nullable=False)
    capacidad = Column(Integer, nullable=False)
    estado = Column(Boolean, nullable=False, default=True)

    empresa = relationship("Empresa")
