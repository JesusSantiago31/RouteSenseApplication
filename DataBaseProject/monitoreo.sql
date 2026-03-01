CREATE SCHEMA IF NOT EXISTS monitoreo;
CREATE TABLE monitoreo.ubicacion_autobus (
    ubicacion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id UUID NOT NULL REFERENCES transporte.autobuses(bus_id) ON DELETE CASCADE,
    latitud NUMERIC(9,6) NOT NULL,
    longitud NUMERIC(9,6) NOT NULL,
    velocidad INT CHECK (velocidad >= 0),
    tiempo TIMESTAMP NOT NULL DEFAULT NOW()
);
