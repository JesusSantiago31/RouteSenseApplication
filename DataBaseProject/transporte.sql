CREATE SCHEMA IF NOT EXISTS transporte;

CREATE TABLE transporte.autobuses (
    bus_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conductor_id UUID REFERENCES seguridad.conductores(conductor_id),
    placa VARCHAR(15) UNIQUE NOT NULL,
    capacidad INT NOT NULL CHECK (capacidad > 0),
    empresa VARCHAR(100) NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE transporte.rutas (
    ruta_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origen_id UUID NOT NULL REFERENCES lugares(lugar_id),
    destino_id UUID NOT NULL REFERENCES lugares(lugar_id),
    distancia_km NUMERIC(8,2) NOT NULL CHECK (distancia_km > 0),
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    numero_paradas INT NOT NULL CHECK (numero_paradas >= 0),
    CONSTRAINT chk_origen_destino CHECK (origen_id <> destino_id)
);

CREATE TABLE transporte.paradas (
    parada_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lugar_id UUID NOT NULL REFERENCES lugares(lugar_id),
    nombre VARCHAR(70) NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    UNIQUE (lugar_id, nombre)
);

CREATE TABLE transporte.rutas_paradas (
    ruta_id UUID REFERENCES transporte.rutas(ruta_id) ON DELETE CASCADE,
    parada_id UUID REFERENCES transporte.paradas(parada_id) ON DELETE RESTRICT,
    orden INT NOT NULL CHECK (orden > 0),
    distancia_desde_inicio NUMERIC(8,2) NOT NULL CHECK (distancia_desde_inicio >= 0),
    PRIMARY KEY (ruta_id, orden),
    UNIQUE (ruta_id, parada_id)
);

CREATE TABLE transporte.rutas_autobuses (
    bus_id UUID REFERENCES transporte.autobuses(bus_id) ON DELETE CASCADE,
    ruta_id UUID REFERENCES transporte.rutas(ruta_id) ON DELETE CASCADE,
    PRIMARY KEY (bus_id, ruta_id)
);
