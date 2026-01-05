-- Agregar columna cover_image para imágenes horizontales de las categorías
ALTER TABLE games
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Comentario explicativo
COMMENT ON COLUMN games.cover_image IS 'Imagen horizontal (aspect-video) para mostrar en las categorías de juegos';
COMMENT ON COLUMN games.image IS 'Imagen vertical (aspect-[2/3]) para mostrar en la sección Trending Now';

-- Opcional: Si quieres copiar temporalmente los valores de image a cover_image
-- UPDATE games SET cover_image = image WHERE cover_image IS NULL;
