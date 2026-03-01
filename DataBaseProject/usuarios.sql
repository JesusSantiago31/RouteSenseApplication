CREATE TABLE usuarios (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL CHECK (position('@' in email) > 1),
    password_hash TEXT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE administradores (
    user_id UUID PRIMARY KEY REFERENCES usuarios(user_id) ON DELETE CASCADE,
    rol VARCHAR(20) NOT NULL DEFAULT 'admin'
        CHECK (rol IN ('admin','superadmin'))
);

CREATE TABLE lugares (
    lugar_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_lugar VARCHAR(70) NOT NULL,
    latitud NUMERIC(9,6) NOT NULL,
    longitud NUMERIC(9,6) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    municipio VARCHAR(50) NOT NULL,
    localidad VARCHAR(50) NOT NULL
);

CREATE TABLE tarifas (
    tarifa_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    precio_base NUMERIC(6,2) NOT NULL CHECK (precio_base >= 0),
    costo_por_km NUMERIC(6,2) NOT NULL CHECK (costo_por_km >= 0),
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE reportes (
    reporte_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(50) NOT NULL,
    fecha TIMESTAMP DEFAULT NOW(),
    total_viajes INT DEFAULT 0,
    promedio_eta NUMERIC(6,2)
);
