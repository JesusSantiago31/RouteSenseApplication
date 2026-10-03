-- ==============================================================================
-- ROUTESENSE - ESQUEMA SQL COMPLETO PARA SUPABASE
-- (PUNTOS POR DINERO GASTADO + SISTEMA DINÁMICO DE SELLOS & GOOGLE WALLET)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. MODIFICAR TABLA 'users' CON CAMPOS PARA EL SISTEMA DE SELLOS Y WALLET
-- ------------------------------------------------------------------------------
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS current_stamps INT4 DEFAULT 0 CHECK (current_stamps >= 0),
ADD COLUMN IF NOT EXISTS max_stamps INT4 DEFAULT 10 CHECK (max_stamps > 0),
ADD COLUMN IF NOT EXISTS total_stamps_earned INT4 DEFAULT 0 CHECK (total_stamps_earned >= 0),
ADD COLUMN IF NOT EXISTS wallet_hero_image_url TEXT;

COMMENT ON COLUMN public.users.current_stamps IS 'Cantidad de sellos acumulados actualmente en el ciclo activo';
COMMENT ON COLUMN public.users.max_stamps IS 'Meta de sellos requerida para completar la tarjeta (configurable por admin, por defecto 10)';
COMMENT ON COLUMN public.users.wallet_hero_image_url IS 'URL de la imagen alojada en ImgBB mostrada dinámicamente en la cartera de Google Wallet y tarjeta de lealtad web';


-- ------------------------------------------------------------------------------
-- 2. TABLA DE CONFIGURACIÓN GLOBAL DE REGLAS DE PUNTOS POR DINERO GASTADO
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.points_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monto_dinero NUMERIC(10,2) NOT NULL DEFAULT 10.00 CHECK (monto_dinero > 0),
    puntos_otorgados INT4 NOT NULL DEFAULT 1 CHECK (puntos_otorgados >= 0),
    descripcion TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar regla inicial por defecto si no existe
INSERT INTO public.points_rules (monto_dinero, puntos_otorgados, descripcion, is_active)
VALUES (10.00, 1, '1 punto por cada $10 MXN gastados', TRUE)
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- 3. TABLAS PARA EL SISTEMA DE SELLOS E IMÁGENES DÉ CARTERA (ImgBB)
-- ------------------------------------------------------------------------------

-- Configuración general del sistema de sellos
CREATE TABLE IF NOT EXISTS public.stamp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    max_stamps INT4 NOT NULL DEFAULT 10 CHECK (max_stamps > 0),
    reward_points_bonus INT4 NOT NULL DEFAULT 50 CHECK (reward_points_bonus >= 0),
    reward_description TEXT DEFAULT 'Recompensa por tarjeta de sellos completada',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mapeo dinámico de imágenes en ImgBB para cada cantidad de sellos (0 sellos, 1 sello, ..., 10 sellos)
CREATE TABLE IF NOT EXISTS public.stamp_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stamp_count INT4 NOT NULL UNIQUE CHECK (stamp_count >= 0),
    image_url TEXT NOT NULL,         -- URL de la imagen en ImgBB (ej. https://i.ibb.co/xxx/1_sello.png)
    wallet_hero_url TEXT,            -- URL de la imagen para Google Wallet API / Apple Pass
    nombre_sello VARCHAR(100) DEFAULT 'Tarjeta de Lealtad',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Semilla de plantilla inicial de URLs para los 11 estados de sellos (0 a 10)
INSERT INTO public.stamp_images (stamp_count, image_url, wallet_hero_url, nombre_sello)
VALUES 
    (0, 'https://i.ibb.co/example/0_sellos.png', 'https://i.ibb.co/example/0_sellos.png', '0 Sellos - Tarjeta Inicial'),
    (1, 'https://i.ibb.co/example/1_sello.png', 'https://i.ibb.co/example/1_sello.png', '1 Sello Acumulado'),
    (2, 'https://i.ibb.co/example/2_sellos.png', 'https://i.ibb.co/example/2_sellos.png', '2 Sellos Acumulados'),
    (3, 'https://i.ibb.co/example/3_sellos.png', 'https://i.ibb.co/example/3_sellos.png', '3 Sellos Acumulados'),
    (4, 'https://i.ibb.co/example/4_sellos.png', 'https://i.ibb.co/example/4_sellos.png', '4 Sellos Acumulados'),
    (5, 'https://i.ibb.co/example/5_sellos.png', 'https://i.ibb.co/example/5_sellos.png', '5 Sellos Acumulados'),
    (6, 'https://i.ibb.co/example/6_sellos.png', 'https://i.ibb.co/example/6_sellos.png', '6 Sellos Acumulados'),
    (7, 'https://i.ibb.co/example/7_sellos.png', 'https://i.ibb.co/example/7_sellos.png', '7 Sellos Acumulados'),
    (8, 'https://i.ibb.co/example/8_sellos.png', 'https://i.ibb.co/example/8_sellos.png', '8 Sellos Acumulados'),
    (9, 'https://i.ibb.co/example/9_sellos.png', 'https://i.ibb.co/example/9_sellos.png', '9 Sellos Acumulados'),
    (10, 'https://i.ibb.co/example/10_sellos.png', 'https://i.ibb.co/example/10_sellos.png', '10 Sellos - ¡Tarjeta Completa!')
ON CONFLICT (stamp_count) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 4. TRIGGER: ACTUALIZACIÓN EN TIEMPO REAL DE IMAGEN DE GOOGLE WALLET AL CAMBIAR SELLOS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_user_wallet_image()
RETURNS TRIGGER AS $$
DECLARE
    v_image_url TEXT;
BEGIN
    -- Si los sellos cambiaron o es un nuevo registro
    IF (TG_OP = 'INSERT') OR (OLD.current_stamps IS DISTINCT FROM NEW.current_stamps) THEN
        -- Buscar la URL correspondiente en ImgBB para el número de sellos actual
        SELECT COALESCE(wallet_hero_url, image_url) INTO v_image_url
        FROM public.stamp_images
        WHERE stamp_count = NEW.current_stamps
        LIMIT 1;

        -- Si existe la imagen registrada, actualizar la propiedad wallet_hero_image_url del usuario
        IF v_image_url IS NOT NULL THEN
            NEW.wallet_hero_image_url := v_image_url;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_user_wallet_image ON public.users;
CREATE TRIGGER trg_update_user_wallet_image
BEFORE INSERT OR UPDATE OF current_stamps ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_user_wallet_image();


-- ------------------------------------------------------------------------------
-- 5. FUNCIÓN SQL PARA CANJEAR RECOMPENSA Y RESETEAR SELLOS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.redeem_user_stamps(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_current_stamps INT4;
    v_max_stamps INT4;
    v_bonus_points INT4 := 50;
    v_initial_img TEXT;
BEGIN
    -- Consultar datos del usuario
    SELECT current_stamps, max_stamps INTO v_current_stamps, v_max_stamps
    FROM public.users
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuario no encontrado');
    END IF;

    -- Validar si ya se completó el máximo de sellos
    IF v_current_stamps < v_max_stamps THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', format('Aún no has completado la tarjeta (%s de %s sellos)', v_current_stamps, v_max_stamps)
        );
    END IF;

    -- Obtener la imagen inicial de 0 sellos
    SELECT COALESCE(wallet_hero_url, image_url) INTO v_initial_img
    FROM public.stamp_images
    WHERE stamp_count = 0
    LIMIT 1;

    -- Resetear sellos a 0 y abonar puntos adicionales de recompensa
    UPDATE public.users
    SET 
        current_stamps = 0,
        current_points = COALESCE(current_points, 0) + v_bonus_points,
        total_points_earned = COALESCE(total_points_earned, 0) + v_bonus_points,
        wallet_hero_image_url = COALESCE(v_initial_img, wallet_hero_image_url),
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Registrar la transacción del canje en el historial
    INSERT INTO public.transactions (
        user_id, 
        transaction_type, 
        purchase_amount, 
        points_transacted, 
        description
    ) VALUES (
        p_user_id,
        'STAMP_REDEEM',
        0,
        v_bonus_points,
        'Tarjeta de sellos completada y canjeada exitosamente'
    );

    RETURN jsonb_build_object(
        'success', true, 
        'message', '¡Felicidades! Tarjeta de sellos canjeada exitosamente. Tus sellos se han reseteado a 0 y tus puntos han sido actualizados.',
        'new_current_stamps', 0,
        'points_awarded', v_bonus_points
    );
END;
$$ LANGUAGE plpgsql;


-- ------------------------------------------------------------------------------
-- 6. VISTA DE COMPATIBILIDAD EN ESPAÑOL DE REGLAS DE PUNTOS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.reglas_puntos AS
SELECT 
    id AS rule_id,
    monto_dinero,
    puntos_otorgados,
    descripcion,
    is_active AS activa,
    updated_at AS fecha_actualizacion
FROM public.points_rules;
