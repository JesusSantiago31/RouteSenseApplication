from sqlalchemy import Column, String, ForeignKey, Boolean, Numeric, Integer, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class Lugar(Base):
    __tablename__ = "lugares"
    lugar_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre_lugar = Column(String(70), nullable=False)

class Parada(Base):
    __tablename__ = "paradas"
    __table_args__ = {"schema": "transporte"}
    parada_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(70), nullable=False)

class Ruta(Base):
    __tablename__ = "rutas"
    __table_args__ = (
        CheckConstraint('origen_id <> destino_id', name='chk_origen_destino'),
        {"schema": "transporte"}
    )

    ruta_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    origen_id = Column(UUID(as_uuid=True), ForeignKey("lugares.lugar_id"), nullable=False)
    destino_id = Column(UUID(as_uuid=True), ForeignKey("lugares.lugar_id"), nullable=False)
    distancia_km = Column(Numeric(8,2), nullable=False)
    activa = Column(Boolean, nullable=False, default=True)
    numero_paradas = Column(Integer, nullable=False, default=0)

class RutaParada(Base):
    __tablename__ = "rutas_paradas"
    __table_args__ = (
        {"schema": "transporte"}
    )

    ruta_id = Column(UUID(as_uuid=True), ForeignKey("transporte.rutas.ruta_id", ondelete="CASCADE"), primary_key=True)
    parada_id = Column(UUID(as_uuid=True), ForeignKey("transporte.paradas.parada_id", ondelete="RESTRICT"), primary_key=True)
    orden = Column(Integer, nullable=False)
    distancia_desde_inicio = Column(Numeric(8,2), nullable=False)
