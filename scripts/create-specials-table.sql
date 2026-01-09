-- Crear tabla para ofertas de Steam
-- Esta tabla almacena los juegos que están actualmente en oferta
-- y tiene links de descarga disponibles

CREATE TABLE IF NOT EXISTS steam_specials (
  id BIGSERIAL PRIMARY KEY,
  steam_appid TEXT NOT NULL UNIQUE,
  links TEXT, -- Link de descarga para el juego en oferta
  discount_percent INTEGER, -- Porcentaje de descuento actual
  original_price INTEGER, -- Precio original en centavos
  final_price INTEGER, -- Precio final en centavos
  currency TEXT, -- Moneda (USD por defecto)
  offer_ends_at TIMESTAMP WITH TIME ZONE, -- Cuándo termina la oferta (si está disponible)
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Última vez que se vio en ofertas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por steam_appid
CREATE INDEX IF NOT EXISTS idx_steam_specials_appid ON steam_specials(steam_appid);

-- Índice para filtrar solo ofertas con links
CREATE INDEX IF NOT EXISTS idx_steam_specials_links ON steam_specials(links) WHERE links IS NOT NULL;

-- Índice para ofertas activas (vistas recientemente)
CREATE INDEX IF NOT EXISTS idx_steam_specials_active ON steam_specials(last_seen_at) WHERE last_seen_at > NOW() - INTERVAL '24 hours';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_steam_specials_updated_at BEFORE UPDATE
    ON steam_specials FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE steam_specials IS 'Almacena los juegos de Steam que están actualmente en oferta y tienen links de descarga';
COMMENT ON COLUMN steam_specials.steam_appid IS 'ID del juego en Steam (único)';
COMMENT ON COLUMN steam_specials.links IS 'Link de descarga del juego. NULL si no está disponible para descarga';
COMMENT ON COLUMN steam_specials.discount_percent IS 'Porcentaje de descuento actual';
COMMENT ON COLUMN steam_specials.offer_ends_at IS 'Fecha de finalización de la oferta (si está disponible)';
COMMENT ON COLUMN steam_specials.last_seen_at IS 'Última vez que se detectó en ofertas de Steam';

