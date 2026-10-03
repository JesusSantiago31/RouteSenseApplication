-- ==============================================================================
-- ROUTESENSE - ESQUEMA SQL PARA SUPABASE (GESTIÓN DE PUNTOS Y RECOMPENSAS)
-- ==============================================================================

-- 1. Tabla de Reglas de Bonificación de Puntos (points_rules)
-- Permite al administrador configurar la tasa de bonificación (ej. Por cada $10 gastados -> 1 punto)
CREATE TABLE IF NOT EXISTS public.points_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monto_dinero NUMERIC(10,2) NOT NULL DEFAULT 10.00 CHECK (monto_dinero > 0),
    puntos_otorgados INT4 NOT NULL DEFAULT 1 CHECK (puntos_otorgados >= 0),
    descripcion TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentarios descriptivos
COMMENT ON TABLE public.points_rules IS 'Almacena las reglas de equivalencia de puntos bonificados por dinero gastado dictadas por el Administrador';
COMMENT ON COLUMN public.points_rules.monto_dinero IS 'Monto de dinero gastado necesario para obtener la bonificación (ej. $10.00 MXN)';
COMMENT ON COLUMN public.points_rules.puntos_otorgados IS 'Cantidad de puntos abonados al cliente por cada múltiplo del monto de dinero gastado';

-- 2. Insertar regla inicial por defecto (1 Punto por cada $10 MXN gastados)
INSERT INTO public.points_rules (monto_dinero, puntos_otorgados, descripcion, is_active)
VALUES (10.00, 1, '1 punto por cada $10 MXN gastados', TRUE)
ON CONFLICT DO NOTHING;

-- 3. Vista de compatibilidad en español (opcional si la aplicación consulta "reglas_puntos")
CREATE OR REPLACE VIEW public.reglas_puntos AS
SELECT 
    id AS rule_id,
    monto_dinero,
    puntos_otorgados,
    descripcion,
    is_active AS activa,
    updated_at AS fecha_actualizacion
FROM public.points_rules;

-- 4. Función de ayuda (Opcional): Aplicar automáticamente puntos cuando se inserta una transacción de compra en "transactions"
CREATE OR REPLACE FUNCTION public.apply_points_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_monto_rule NUMERIC(10,2);
    v_puntos_rule INT4;
    v_puntos_ganados INT4 := 0;
BEGIN
    -- Solo procesar si es una transacción de acumulación/compra ('EARN' o 'PURCHASE')
    IF NEW.transaction_type IN ('EARN', 'PURCHASE') AND NEW.purchase_amount > 0 THEN
        -- Obtener la regla activa más reciente
        SELECT monto_dinero, puntos_otorgados 
        INTO v_monto_rule, v_puntos_rule
        FROM public.points_rules 
        WHERE is_active = TRUE 
        ORDER BY updated_at DESC 
        LIMIT 1;

        IF FOUND AND v_monto_rule > 0 THEN
            -- Calcular puntos ganados (redondeo hacia abajo por bloque)
            v_puntos_ganados := FLOOR(NEW.purchase_amount / v_monto_rule) * v_puntos_rule;
            NEW.points_transacted := v_puntos_ganados;

            -- Actualizar saldo del usuario en la tabla "users"
            UPDATE public.users 
            SET 
                current_points = COALESCE(current_points, 0) + v_puntos_ganados,
                total_points_earned = COALESCE(total_points_earned, 0) + v_puntos_ganados,
                total_purchases_count = COALESCE(total_purchases_count, 0) + 1,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger automático al insertar en transactions (Opcional - desentar si se desea automatizar en BD)
-- DROP TRIGGER IF EXISTS trg_apply_points ON public.transactions;
-- CREATE TRIGGER trg_apply_points
-- BEFORE INSERT ON public.transactions
-- FOR EACH ROW EXECUTE FUNCTION public.apply_points_on_transaction();
