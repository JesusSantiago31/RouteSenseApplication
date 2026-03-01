CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE TABLE seguridad.conductores (
    conductor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    licencia VARCHAR(50) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);
