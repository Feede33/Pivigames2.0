# 🚀 Pasos para Probar el Sistema

## 1. Verificar Variables de Entorno

Abre el archivo `.env.local` y asegúrate de que tenga:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ktakrkxxyezczbogmuiq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YWtya3h4eWV6Y3pib2dtdWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NzkyNzAsImV4cCI6MjA4MjU1NTI3MH0.n_gbSsg8rvk3jvDDo9HMCqwpj9yH6LstfwnojZuC3vU
```

## 2. Reiniciar el Servidor

Si el servidor ya está corriendo, deténlo (Ctrl+C) y reinícialo:

```bash
npm run dev
```

## 3. Probar la Página de Test

Abre tu navegador y ve a:
```
http://localhost:3000/test-db
```

Esta página te mostrará:
- ✅ Si la conexión a Supabase funciona
- ✅ Cuántos juegos hay en la DB
- ✅ Si los datos de Steam se cargan correctamente
- ✅ Toda la información de cada juego

## 4. Ver la Página Principal

Si el test funciona, ve a:
```
http://localhost:3000
```

Deberías ver los juegos cargados con toda su información de Steam.

## 5. Revisar la Consola del Navegador

Abre las herramientas de desarrollo (F12) y ve a la pestaña "Console".

Deberías ver:
```
Games from DB: [{id: 2, steam_appid: "1091500", links: "..."}, ...]
Enriched games: [{id: 2, title: "Cyberpunk 2077", genre: "...", ...}, ...]
```

## 6. Si Aún No Funciona

### Opción A: Verificar en Supabase

1. Ve a https://supabase.com/dashboard
2. Abre tu proyecto "jueguitosflix"
3. Ve a "Table Editor" → "games"
4. Verifica que haya 2 juegos:
   - ID 1: steam_appid = "1214650" (Elden Ring)
   - ID 2: steam_appid = "1091500" (Cyberpunk 2077)

### Opción B: Agregar Juegos Manualmente

Si no hay juegos, ve a "SQL Editor" en Supabase y ejecuta:

```sql
INSERT INTO games (steam_appid, links) 
VALUES 
  ('1091500', 'https://playpaste.net/?v=jagI'),
  ('1245620', 'https://tu-link.com');
```

### Opción C: Verificar RLS

En "SQL Editor" ejecuta:

```sql
-- Verificar que RLS permita lectura pública
SELECT * FROM games;
```

Si da error, ejecuta:

```sql
-- Habilitar lectura pública
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON games FOR SELECT 
TO public 
USING (true);
```

## 7. Logs Útiles

El código incluye logs detallados en la consola:

- `Games from DB:` → Juegos obtenidos de Supabase
- `Enriched games:` → Juegos con datos de Steam
- `Error loading games:` → Error general
- `Error loading Steam data for [appid]:` → Error específico de Steam

## 8. Problemas Comunes

### "No hay juegos disponibles"
- ✅ Verifica que haya juegos en la DB
- ✅ Verifica las variables de entorno
- ✅ Reinicia el servidor

### Error de CORS
- ✅ Verifica que las variables empiecen con `NEXT_PUBLIC_`
- ✅ Reinicia el servidor

### Error de Steam API
- ✅ Verifica tu conexión a internet
- ✅ Intenta con otro navegador
- ✅ Verifica que el steam_appid sea correcto

## 9. Contacto

Si nada funciona, revisa:
1. La página de test: `/test-db`
2. La consola del navegador (F12)
3. Los logs del servidor en la terminal

¡Todo debería funcionar ahora! 🎮
