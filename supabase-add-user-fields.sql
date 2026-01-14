-- Agregar campos de usuario a la tabla comments para evitar JOINs

-- 1. Agregar columnas para información del usuario
ALTER TABLE comments 
  ADD COLUMN IF NOT EXISTS user_name TEXT,
  ADD COLUMN IF NOT EXISTS user_avatar TEXT,
  ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 2. Crear índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS idx_comments_user_name ON comments(user_name);

-- 3. Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'comments'
ORDER BY ordinal_position;
