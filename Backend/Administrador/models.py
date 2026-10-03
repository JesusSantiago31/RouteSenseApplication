from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
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


class Autobus(Base):
    __tablename__ = "autobuses"
    __table_args__ = {"schema": "transporte"}

    bus_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conductor_id = Column(UUID(as_uuid=True), ForeignKey("seguridad.conductores.conductor_id", ondelete="SET NULL"), nullable=True)
    placa = Column(String(15), unique=True, nullable=False)
    capacidad = Column(Integer, nullable=False)
    empresa = Column(String(100), nullable=False)
    estado = Column(Boolean, nullable=False, default=True)


class ReglaPuntos(Base):
    __tablename__ = "points_rules"

    rule_id = Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    monto_dinero = Column(Integer, nullable=False, default=10) # Cantidad de dinero gastado (ej. $10 MXN)
    puntos_otorgados = Column(Integer, nullable=False, default=1) # Puntos bonificados por esa cantidad
    descripcion = Column(String(255), nullable=True)
    activa = Column("is_active", Boolean, nullable=False, default=True)
    fecha_actualizacion = Column("updated_at", TIMESTAMP, server_default=func.now(), onupdate=func.now())


class ConfigSellos(Base):
    __tablename__ = "stamp_config"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    max_stamps = Column(Integer, nullable=False, default=10)
    reward_points_bonus = Column(Integer, nullable=False, default=50)
    reward_description = Column(String(255), default="Recompensa por tarjeta de sellos completada")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class ImagenSello(Base):
    __tablename__ = "stamp_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stamp_count = Column(Integer, unique=True, nullable=False)
    image_url = Column(String(500), nullable=False)
    wallet_hero_url = Column(String(500), nullable=True)
    nombre_sello = Column(String(100), default="Tarjeta de Lealtad")
    created_at = Column(TIMESTAMP, server_default=func.now())



