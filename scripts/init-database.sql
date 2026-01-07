-- ============================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
-- ============================================
-- Ejecuta este script en Supabase SQL Editor

-- 1. Crear la tabla games (si no existe)
CREATE TABLE IF NOT EXISTS games (
  id BIGSERIAL PRIMARY KEY,
  steam_appid TEXT NOT NULL UNIQUE,
  links TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_games_steam_appid ON games(steam_appid);
CREATE INDEX IF NOT EXISTS idx_games_links ON games(links) WHERE links IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);

-- 3. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_games_updated_at ON games;
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Insertar algunos juegos de ejemplo (opcional)
INSERT INTO games (steam_appid, links) VALUES
  ('730', 'https://ejemplo.com/csgo'),
  ('570', 'https://ejemplo.com/dota2'),
  ('440', 'https://ejemplo.com/tf2')
ON CONFLICT (steam_appid) DO NOTHING;

-- 6. Verificar que todo está correcto
SELECT 
  COUNT(*) as total_juegos,
  COUNT(links) as juegos_con_link,
  COUNT(*) - COUNT(links) as juegos_sin_link
FROM games;

-- 7. Ver estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'games'
ORDER BY ordinal_position;

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública (solo juegos con links)
CREATE POLICY "Allow public read access to games with links"
  ON games
  FOR SELECT
  USING (links IS NOT NULL);

-- Permitir lectura completa para usuarios autenticados (opcional)
CREATE POLICY "Allow authenticated full read access"
  ON games
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir inserción solo para usuarios autenticados (opcional)
CREATE POLICY "Allow authenticated insert"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir actualización solo para usuarios autenticados (opcional)
CREATE POLICY "Allow authenticated update"
  ON games
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para obtener estadísticas
CREATE OR REPLACE FUNCTION get_games_stats()
RETURNS TABLE (
  total_games BIGINT,
  games_with_links BIGINT,
  games_without_links BIGINT,
  percentage_with_links NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_games,
    COUNT(links) as games_with_links,
    COUNT(*) - COUNT(links) as games_without_links,
    ROUND(COUNT(links)::numeric / NULLIF(COUNT(*), 0)::numeric * 100, 2) as percentage_with_links
  FROM games;
END;
$$ LANGUAGE plpgsql;

-- Usar la función:
-- SELECT * FROM get_games_stats();

-- ============================================
-- LIMPIEZA Y MANTENIMIENTO
-- ============================================

-- Eliminar juegos sin link más antiguos de 30 días
CREATE OR REPLACE FUNCTION cleanup_old_games_without_links()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM games 
  WHERE links IS NULL 
  AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar limpieza:
-- SELECT cleanup_old_games_without_links();

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Ver todos los juegos
SELECT 
  id,
  steam_appid,
  CASE 
    WHEN links IS NULL THEN '❌ Sin link (oculto)'
    ELSE '✅ Con link (visible)'
  END as estado,
  created_at
FROM games
ORDER BY created_at DESC
LIMIT 20;

COMMIT;
