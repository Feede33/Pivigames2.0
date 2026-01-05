-- Agregar la columna 'links' a la tabla games
-- Esta columna almacenará el link único de descarga para cada juego

ALTER TABLE games 
ADD COLUMN IF NOT EXISTS links TEXT;

-- Comentario para documentar la columna
COMMENT ON COLUMN games.links IS 'Link único de descarga para el juego (puede ser Mediafire, Mega, Google Drive, etc.)';

-- Ejemplo de cómo actualizar un juego con su link:
-- UPDATE games SET links = 'https://mediafire.com/file/xxxxx' WHERE id = 1;
-- UPDATE games SET links = 'https://mega.nz/file/xxxxx' WHERE id = 2;
