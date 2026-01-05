-- Agregar columna steam_appid a la tabla games
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS steam_appid TEXT;

-- Agregar índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_games_steam_appid ON games(steam_appid);

-- Comentario para documentar
COMMENT ON COLUMN games.steam_appid IS 'Steam App ID para obtener datos dinámicos de la API de Steam';
