-- Ejemplos de cómo agregar links de descarga a ofertas de Steam
-- Ejecuta estos comandos en Supabase SQL Editor

-- ============================================
-- AGREGAR LINK A UNA OFERTA ESPECÍFICA
-- ============================================

-- Ejemplo: Counter-Strike 2 (App ID: 730)
UPDATE steam_specials 
SET links = 'https://ejemplo.com/descargas/cs2'
WHERE steam_appid = '730';

-- Ejemplo: Dota 2 (App ID: 570)
UPDATE steam_specials 
SET links = 'https://ejemplo.com/descargas/dota2'
WHERE steam_appid = '570';

-- ============================================
-- AGREGAR MÚLTIPLES LINKS A LA VEZ
-- ============================================

-- Opción 1: Usando CASE
UPDATE steam_specials
SET links = CASE steam_appid
  WHEN '730' THEN 'https://ejemplo.com/descargas/cs2'
  WHEN '570' THEN 'https://ejemplo.com/descargas/dota2'
  WHEN '440' THEN 'https://ejemplo.com/descargas/tf2'
  WHEN '271590' THEN 'https://ejemplo.com/descargas/gtav'
  WHEN '578080' THEN 'https://ejemplo.com/descargas/pubg'
  ELSE links
END
WHERE steam_appid IN ('730', '570', '440', '271590', '578080');

-- ============================================
-- VERIFICAR OFERTAS CON LINKS
-- ============================================

-- Ver todas las ofertas que tienen link de descarga
SELECT 
  steam_appid,
  links,
  updated_at
FROM steam_specials
WHERE links IS NOT NULL
ORDER BY updated_at DESC;

-- ============================================
-- ELIMINAR LINK DE UNA OFERTA
-- ============================================

-- Si ya no quieres que una oferta sea descargable
UPDATE steam_specials 
SET links = NULL
WHERE steam_appid = '730';

-- ============================================
-- ESTADÍSTICAS
-- ============================================

-- Ver cuántas ofertas tienen link vs no tienen
SELECT 
  COUNT(*) as total_ofertas,
  COUNT(links) as ofertas_con_link,
  COUNT(*) - COUNT(links) as ofertas_sin_link,
  ROUND(COUNT(links)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_con_link
FROM steam_specials;

-- ============================================
-- BUSCAR OFERTAS POR APP ID
-- ============================================

-- Verificar si un juego específico está en ofertas
SELECT * FROM steam_specials WHERE steam_appid = '730';

-- ============================================
-- LIMPIAR OFERTAS ANTIGUAS (MANUAL)
-- ============================================

-- Eliminar ofertas que no se han actualizado en más de 7 días
-- (El cron debería hacer esto automáticamente, pero por si acaso)
DELETE FROM steam_specials
WHERE updated_at < NOW() - INTERVAL '7 days';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

-- 1. El steam_appid es el ID del juego en Steam (puedes verlo en la URL de Steam)
--    Ejemplo: https://store.steampowered.com/app/730/ -> App ID es 730

-- 2. Los links deben ser URLs completas y válidas
--    Ejemplo: 'https://ejemplo.com/descargas/juego'

-- 3. Si pones links = NULL, el juego seguirá apareciendo en ofertas
--    pero sin el badge "Disponible" y sin botón de descarga

-- 4. El cron job sincroniza ofertas cada 6 horas, así que nuevas ofertas
--    aparecerán automáticamente en la tabla (sin link por defecto)

-- 5. Puedes agregar links en cualquier momento, incluso después de que
--    el cron haya insertado la oferta
