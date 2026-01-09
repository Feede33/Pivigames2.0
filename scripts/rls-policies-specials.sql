-- Políticas RLS para steam_specials (OPCIONAL)
-- Solo si quieres mayor control de seguridad

-- Habilitar RLS en la tabla
ALTER TABLE steam_specials ENABLE ROW LEVEL SECURITY;

-- Política 1: Permitir lectura pública (SELECT)
-- Todos pueden ver las ofertas
CREATE POLICY "Permitir lectura pública de ofertas"
ON steam_specials
FOR SELECT
TO public
USING (true);

-- Política 2: Solo service role puede insertar
-- Solo el cron job puede agregar ofertas
CREATE POLICY "Solo service role puede insertar ofertas"
ON steam_specials
FOR INSERT
TO service_role
WITH CHECK (true);

-- Política 3: Solo service role puede actualizar
-- Solo el cron job puede actualizar ofertas
CREATE POLICY "Solo service role puede actualizar ofertas"
ON steam_specials
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Política 4: Solo service role puede eliminar
-- Solo el cron job puede eliminar ofertas expiradas
CREATE POLICY "Solo service role puede eliminar ofertas"
ON steam_specials
FOR DELETE
TO service_role
USING (true);

-- NOTA: Con estas políticas:
-- ✅ Usuarios pueden leer ofertas (SELECT)
-- ❌ Usuarios NO pueden modificar ofertas (INSERT/UPDATE/DELETE)
-- ✅ Cron job puede hacer todo (usa service_role key)

-- Para verificar las políticas:
SELECT * FROM pg_policies WHERE tablename = 'steam_specials';
