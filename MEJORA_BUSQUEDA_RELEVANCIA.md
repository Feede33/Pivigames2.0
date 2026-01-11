# Sistema de Búsqueda Mejorado con Relevancia

## Problema Original
Cuando se escribía una letra como "P", aparecían todos los juegos que contenían esa letra en cualquier parte del título o género, sin importar la relevancia. Esto hacía que la búsqueda fuera poco útil para queries cortos.

**Ejemplo del problema:**
- Escribir "P" mostraba: Portal, Payday, Grand Theft Auto, Apex Legends, etc.
- Todos los juegos con "P" en cualquier parte aparecían sin orden lógico

## Mejoras Implementadas

### 1. Búsqueda Inteligente por Longitud de Query

**Para queries cortos (1-2 caracteres):**
- Solo busca juegos cuyo título **empiece** con esas letras
- Ejemplo: "P" → "Portal", "Payday", "PUBG" (no "Grand Theft Auto" aunque tenga una "P")
- También busca coincidencias exactas con `steam_appid`

**Para queries largos (3+ caracteres):**
- Busca en cualquier parte del título o género
- Ordena por relevancia (ver siguiente sección)

### 2. Sistema de Relevancia y Priorización

Los resultados se ordenan por relevancia usando el siguiente sistema de puntuación:

```typescript
// Prioridad 1: Coincidencia exacta con steam_appid (1000 puntos)
if (game.steam_appid === query) return 1000;

// Prioridad 2: Título empieza con el query (100 puntos)
if (title.startsWith(query)) return 100;

// Prioridad 3: Query al inicio de una palabra (50 puntos)
// Ejemplo: "theft" encuentra "Grand Theft Auto"
if (words.some(word => word.startsWith(query))) return 50;

// Prioridad 4: Título contiene el query (25 puntos)
if (title.includes(query)) return 25;

// Prioridad 5: Género contiene el query (10 puntos)
if (genre.includes(query)) return 10;
```

### 3. Búsqueda en Múltiples Fuentes

El sistema busca en dos lugares:

1. **Caché local** (instantáneo):
   - Busca en todos los juegos ya cargados en memoria
   - Ordena por relevancia
   - Respuesta inmediata

2. **Base de datos** (si es necesario):
   - Se activa si no hay resultados en caché
   - O si el query tiene 3+ caracteres (para encontrar más resultados)
   - Combina resultados sin duplicados

### 4. Ordenamiento Mejorado en Supabase

La función `searchGames` en el servidor ahora:
- Para queries cortos (1-2 chars): Solo busca al inicio del título
- Para queries largos: Obtiene más resultados y los ordena por relevancia
- Prioriza: steam_appid exacto → título empieza con query → posición en título → alfabético

```typescript
// Ordenar por:
// 1. steam_appid exacto
// 2. Título que empieza con el query
// 3. Posición del query en el título (más cerca del inicio = mejor)
// 4. Orden alfabético
```

## Código Implementado

### `src/lib/supabase.ts`
```typescript
export async function searchGames(query: string, limit: number = 10): Promise<Game[]> {
  const trimmedQuery = query.trim();
  
  // Si el query es muy corto (1-2 caracteres), solo buscar al inicio del título
  if (trimmedQuery.length <= 2) {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .not('links', 'is', null)
      .or(`title.ilike.${trimmedQuery}%,steam_appid.eq.${trimmedQuery}`)
      .limit(limit);

    return data as Game[];
  }
  
  // Para queries más largos, buscar en cualquier parte pero ordenar por relevancia
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .not('links', 'is', null)
    .or(`title.ilike.%${trimmedQuery}%,genre.ilike.%${trimmedQuery}%,steam_appid.eq.${trimmedQuery}`)
    .limit(limit * 2);

  // Ordenar por relevancia en el cliente
  const results = (data as Game[]).sort((a, b) => {
    // Sistema de priorización...
  });

  return results.slice(0, limit);
}
```

### `src/components/ui/search-system.tsx`
```typescript
// Función para calcular relevancia
const calculateRelevance = (game: GameWithSteamData): number => {
  const title = game.title.toLowerCase();
  const genre = game.genre.toLowerCase();
  
  if (game.steam_appid === query) return 1000;
  if (title.startsWith(query)) return 100;
  
  const words = title.split(/\s+/);
  if (words.some(word => word.startsWith(query))) return 50;
  if (title.includes(query)) return 25;
  if (genre.includes(query)) return 10;
  
  return 0;
};

// Buscar y ordenar por relevancia
let results = gamesToSearch
  .map(game => ({ game, relevance: calculateRelevance(game) }))
  .filter(({ relevance }) => relevance > 0)
  .sort((a, b) => b.relevance - a.relevance)
  .map(({ game }) => game);
```

## Ejemplos de Uso

### Query: "P"
**Antes:** Portal, Payday, Grand Theft Auto, Apex Legends, etc. (sin orden)
**Ahora:** Portal, Payday, PUBG, Project Zomboid (solo los que empiezan con P)

### Query: "Por"
**Antes:** Portal, Portal 2, cualquier juego con "por" en el título
**Ahora:** Portal, Portal 2 (priorizados al inicio), luego otros

### Query: "theft"
**Antes:** Grand Theft Auto (si estaba en caché)
**Ahora:** Grand Theft Auto (encontrado porque "theft" está al inicio de una palabra)

### Query: "action"
**Antes:** Resultados aleatorios con "action" en cualquier parte
**Ahora:** Juegos de acción ordenados por relevancia

### Query: "123456" (steam_appid)
**Antes:** Podría no encontrarse
**Ahora:** Coincidencia exacta, aparece primero siempre

## Beneficios

1. ✅ **Búsquedas más precisas**: Queries cortos solo muestran resultados relevantes
2. ✅ **Mejor UX**: Los usuarios encuentran lo que buscan más rápido
3. ✅ **Resultados ordenados**: Los más relevantes aparecen primero
4. ✅ **Búsqueda por ID**: Puedes buscar juegos por su steam_appid
5. ✅ **Búsqueda por palabras**: Encuentra juegos aunque no escribas desde el inicio
6. ✅ **Sin resultados irrelevantes**: Queries cortos no muestran basura
7. ✅ **Combinación de fuentes**: Busca en caché y DB sin duplicados

## Testing

Para probar las mejoras:

1. **Query corto**: Escribe "P" → Solo juegos que empiezan con P
2. **Query medio**: Escribe "Por" → Portal aparece primero
3. **Búsqueda por palabra**: Escribe "theft" → Grand Theft Auto aparece
4. **Búsqueda por ID**: Escribe un steam_appid → Encuentra el juego exacto
5. **Búsqueda por género**: Escribe "action" → Encuentra juegos de acción
6. **Query largo**: Escribe "counter strike" → Counter-Strike aparece primero

## Comparación Antes/Después

| Query | Antes | Ahora |
|-------|-------|-------|
| "P" | 50+ juegos con P en cualquier parte | 10 juegos que empiezan con P |
| "Por" | Portal mezclado con otros | Portal primero, ordenado |
| "theft" | No encontraba | Grand Theft Auto |
| "123456" | No encontraba | Juego exacto |
| "action" | Desordenado | Ordenado por relevancia |

## Archivos Modificados

- ✅ `src/lib/supabase.ts` - Función `searchGames` mejorada
- ✅ `src/components/ui/search-system.tsx` - Sistema de relevancia en caché
