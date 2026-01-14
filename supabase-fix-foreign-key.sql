-- Arreglar la foreign key de user_id en la tabla comments

-- 1. Primero, eliminar la constraint existente si existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_user_id_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE comments DROP CONSTRAINT comments_user_id_fkey;
    END IF;
END $$;

-- 2. Asegurarse de que user_id no sea NULL y sea UUID
ALTER TABLE comments 
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- 3. Agregar la foreign key correctamente
ALTER TABLE comments
  ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 4. Verificar la estructura
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='comments';
