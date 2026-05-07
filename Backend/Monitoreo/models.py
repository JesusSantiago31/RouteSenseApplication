from sqlalchemy import Column, String, DECIMAL, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from database import Base

class Posicion(Base):
    __tablename__ = "posiciones"
    __table_args__ = {"schema": "monitoreo"}

    posicion_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bus_id = Column(UUID(as_uuid=True), nullable=False)
    conductor_id = Column(UUID(as_uuid=True), nullable=False)
    latitud = Column(DECIMAL(9,6), nullable=False)
    longitud = Column(DECIMAL(9,6), nullable=False)
    velocidad = Column(DECIMAL(5,2), nullable=True)
    ultima_actualizacion = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class ParadaSolicitada(Base):
    __tablename__ = "paradas_solicitadas"
    __table_args__ = {"schema": "monitoreo"}

    solicitud_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    bus_id = Column(UUID(as_uuid=True), nullable=False)
    parada_id = Column(UUID(as_uuid=True), nullable=False)
    tipo = Column(String(10), default="subir") # subir, bajar
    estado = Column(String(20), default="pendiente") # pendiente, completada, cancelada
    fecha_solicitud = Column(TIMESTAMP, server_default=func.now())
