# Agregar Búsqueda por Título

## Problema
Actualmente solo guardamos `steam_appid` en la DB, por lo que buscar "Peak" no encuentra nada porque solo busca en el campo numérico.

## Solución
Agregar columnas `title` y `genre` a la tabla `games` para permitir búsquedas por nombre.

---

## Pasos

### 1. Agregar columnas en Supabase

Ve a tu proyecto en Supabase → SQL Editor y ejecuta:

```sql
-- Agregar columnas
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS genre TEXT;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_games_title ON games USING gin(to_tsvector('english', title));
```

### 2. Actualizar juegos existentes (12k juegos)

Este script actualiza automáticamente todos los juegos que no tienen título:

```bash
npx tsx scripts/update-game-titles.ts
```

**Importante:**
- Tarda ~30-45 minutos (12k juegos × 1.5 segundos cada uno)
- Respeta los rate limits de Steam API
- Puedes detenerlo y reiniciarlo, solo actualiza los que faltan
- Muestra progreso en tiempo real

### 3. Verificar que funciona

Después de ejecutar el script, verifica en Supabase que los juegos tienen títulos:

```sql
SELECT steam_appid, title, genre 
FROM games 
WHERE title IS NOT NULL 
LIMIT 10;
```

### 4. Probar búsqueda

Ahora puedes buscar por:
- **Título**: "Peak", "Counter", "Dota"
- **Género**: "Action", "RPG", "Strategy"
- **App ID**: "2231450"

---

## Qué se modificó

### ✅ `src/lib/supabase.ts`
- Tipo `Game` ahora incluye `title` y `genre`
- Función `searchGames` busca en título, género y appid

### ✅ `src/app/api/cron/fetch-games/route.ts`
- Ahora guarda el título cuando inserta juegos nuevos
- SteamSpy ya proporciona el nombre, no necesita llamadas extra

### ✅ `scripts/update-game-titles.ts`
- Script nuevo para actualizar juegos existentes
- Consulta Steam API para obtener título y género
- Procesa en batches con rate limiting

---

## Notas

- **Nuevos juegos**: El cron job ya guarda títulos automáticamente
- **Juegos existentes**: Ejecuta el script una sola vez
- **Búsqueda**: Ahora funciona por título, género o ID
- **Performance**: El índice hace las búsquedas muy rápidas
