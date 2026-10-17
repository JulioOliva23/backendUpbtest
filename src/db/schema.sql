CREATE TABLE IF NOT EXISTS productos (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    precio         NUMERIC(10, 2) NOT NULL,
    stock          INTEGER NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT productos_precio_positivo CHECK (precio > 0),
    CONSTRAINT productos_stock_no_negativo CHECK (stock >= 0)
);

-- Migración para tablas creadas con el esquema anterior (columna created_at, sin CHECKs).
-- Es idempotente: se puede ejecutar en cada arranque sin efectos secundarios.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'productos' AND column_name = 'created_at')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'productos' AND column_name = 'fecha_creacion') THEN
        ALTER TABLE productos RENAME COLUMN created_at TO fecha_creacion;
    END IF;

    ALTER TABLE productos ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE productos ALTER COLUMN fecha_creacion SET DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE productos ALTER COLUMN precio DROP DEFAULT;

    -- NOT VALID: aplica a filas nuevas sin fallar si ya existen filas antiguas con precio 0
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'productos_precio_positivo') THEN
        ALTER TABLE productos ADD CONSTRAINT productos_precio_positivo CHECK (precio > 0) NOT VALID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'productos_stock_no_negativo') THEN
        ALTER TABLE productos ADD CONSTRAINT productos_stock_no_negativo CHECK (stock >= 0) NOT VALID;
    END IF;
END
$$;
