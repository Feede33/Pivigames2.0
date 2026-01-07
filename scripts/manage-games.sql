-- ============================================
-- SCRIPT DE ADMINISTRACIÓN DE JUEGOS
-- ============================================

-- 1. Ver todos los juegos sin link de descarga
-- (Estos NO se muestran en la web)
SELECT 
  id,
  steam_appid,
  created_at,
  'Sin link' as estado
FROM games 
WHERE links IS NULL 
ORDER BY created_at DESC;

-- 2. Ver todos los juegos CON link de descarga
-- (Estos SÍ se muestran en la web)
SELECT 
  id,
  steam_appid,
  links,
  created_at,
  'Con link' as estado
FROM games 
WHERE links IS NOT NULL 
ORDER BY created_at DESC;

-- 3. Estadísticas generales
SELECT 
  COUNT(*) as total_juegos,
  COUNT(links) as juegos_con_link,
  COUNT(*) - COUNT(links) as juegos_sin_link,
  ROUND(COUNT(links)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_con_link
FROM games;

-- 4. AGREGAR link de descarga a un juego específico
-- Reemplaza 'APPID_AQUI' con el steam_appid y 'URL_AQUI' con tu link
UPDATE games 
SET links = 'https://tu-link-de-descarga.com/juego.zip' 
WHERE steam_appid = '730';

-- 5. AGREGAR links a múltiples juegos a la vez
UPDATE games 
SET links = CASE steam_appid
  WHEN '730' THEN 'https://link1.com'
  WHEN '570' THEN 'https://link2.com'
  WHEN '440' THEN 'https://link3.com'
  ELSE links
END
WHERE steam_appid IN ('730', '570', '440');

-- 6. ELIMINAR link de descarga (ocultar juego de la web)
UPDATE games 
SET links = NULL 
WHERE steam_appid = '730';

-- 7. Ver los últimos 10 juegos agregados
SELECT 
  id,
  steam_appid,
  links,
  created_at,
  CASE 
    WHEN links IS NULL THEN '❌ Oculto'
    ELSE '✅ Visible'
  END as visibilidad
FROM games 
ORDER BY created_at DESC 
LIMIT 10;

-- 8. Buscar juego por App ID
SELECT * FROM games WHERE steam_appid = '730';

-- 9. ELIMINAR juegos sin link más antiguos de 30 días
DELETE FROM games 
WHERE links IS NULL 
AND created_at < NOW() - INTERVAL '30 days';

-- 10. Ver juegos agregados hoy
SELECT 
  id,
  steam_appid,
  links,
  created_at
FROM games 
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
