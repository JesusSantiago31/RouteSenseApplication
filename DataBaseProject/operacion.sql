CREATE TABLE solicitud_paradas (
    solicitud_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id UUID NOT NULL REFERENCES transporte.autobuses(bus_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES usuarios(user_id) ON DELETE CASCADE,
    parada_id UUID NOT NULL REFERENCES transporte.paradas(parada_id),
    estado VARCHAR(20) NOT NULL
        CHECK (estado IN ('pending','accepted','completed','canceled')),
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE viajes (
    viaje_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES usuarios(user_id) ON DELETE SET NULL,
    ruta_id UUID REFERENCES transporte.rutas(ruta_id),
    parada_origen UUID REFERENCES transporte.paradas(parada_id),
    parada_destino UUID REFERENCES transporte.paradas(parada_id),
    distancia_recorrida NUMERIC(8,2) NOT NULL CHECK (distancia_recorrida >= 0),
    tarifa_id UUID REFERENCES tarifas(tarifa_id),
    precio_final NUMERIC(8,2) NOT NULL,
    fecha TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_paradas_distintas CHECK (parada_origen <> parada_destino)
);
