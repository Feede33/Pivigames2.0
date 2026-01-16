# Test de Integración RAWG

## ✅ Implementación Corregida

### Cambio importante
La lógica de RAWG ahora se ejecuta en el **servidor** (API de Steam) en lugar del cliente, lo que permite:
- Acceso seguro a la API key de RAWG
- Mejor rendimiento (una sola llamada)
- Cache más eficiente

### Archivos modificados

**1. `src/app/api/steam/[appid]/route.ts`**
- ✅ Agregada función `getRawgRating()` en el servidor
- ✅ Se obtiene rating de RAWG cuando no hay Metacritic
- ✅ Se incluye `rawg_rating` en la respuesta de la API

**2. `src/lib/supabase.ts`**
- ✅ Usa `steamData.rawg_rating` de la API
- ✅ Eliminado import de `getRawgRating` (ya no se usa en cliente)

**3. `src/app/[locale]/page.tsx`**
- ✅ Usa `steamData.rawg_rating` de la API
- ✅ Eliminado import de `getRawgRating`

**4. `.env.local`**
- ✅ Agregada variable `RAWG_API_KEY=`

### Flujo de rating implementado

```
Cliente solicita juego
   ↓
API Steam (/api/steam/[appid])
   ↓
Obtener datos de Steam
   ↓
¿Tiene Metacritic?
   ├─ SÍ → Incluir Metacritic en respuesta
   └─ NO → Consultar RAWG API
       ↓
       Incluir rawg_rating en respuesta
   ↓
Cliente recibe datos con rating
   ↓
Mostrar rating (Metacritic > RAWG > 7.5)
```

### 🧪 Cómo probar

1. **Configurar RAWG API Key**
   - Ve a https://rawg.io/apidocs
   - Crea una cuenta y obtén tu API key
   - Agrégala a `.env.local`:
   ```bash
   RAWG_API_KEY=tu_api_key_aqui
   ```

2. **Reiniciar el servidor**
   ```bash
   npm run dev
   ```

3. **Verificar en consola del servidor (terminal)**
   - Busca logs como: `[RAWG] Rating for [Game Name]: X/10`
   - Verifica que juegos sin Metacritic consulten RAWG

4. **Verificar en la aplicación**
   - Abre un juego que NO tenga Metacritic
   - El rating debería ser diferente a 7.5
   - Revisa la consola del navegador para ver el rating recibido

### 📊 Ejemplos de juegos para probar

| Juego | Metacritic | RAWG | Resultado esperado |
|-------|-----------|------|-------------------|
| The Witcher 3 | ✅ 92 | ✅ 4.6 | 9.2 (Metacritic) |
| Stardew Valley | ❌ No | ✅ 4.5 | 9.0 (RAWG) |
| Juego indie pequeño | ❌ No | ❌ No | 7.5 (Fallback) |

### 🔍 Verificar en el código

**En `src/app/api/steam/[appid]/route.ts` línea ~18:**
```typescript
// Función para obtener rating de RAWG
async function getRawgRating(gameName: string): Promise<number> {
  if (!RAWG_API_KEY) {
    console.warn('[RAWG] API key not configured');
    return 0;
  }
  // ... consulta a RAWG API
}
```

**En `src/app/api/steam/[appid]/route.ts` línea ~255:**
```typescript
// Obtener rating de RAWG si no hay Metacritic
let rawgRating = 0;
if (!metacritic) {
  rawgRating = await getRawgRating(gameData.name);
}
```

**En `src/lib/supabase.ts` línea ~206:**
```typescript
// Obtener rating: priorizar Metacritic, luego RAWG, luego fallback
let rating = 7.5;

if (steamData.metacritic) {
  rating = steamData.metacritic / 10;
} else if (steamData.rawg_rating && steamData.rawg_rating > 0) {
  rating = steamData.rawg_rating;
}
```

### ✅ Componentes que muestran el rating

Todos estos componentes reciben `game.rating` que ya viene calculado:

1. **HeroSlider.tsx** - Muestra rating en el hero slider
2. **GamesGrid.tsx** - Muestra rating en cada card del grid
3. **GameModal/Sidebar.tsx** - Muestra rating en el modal
4. **GameModal/InfoBadges.tsx** - Muestra rating como badge

### 🎯 Estado final

- ✅ Todos los juegos ahora tienen ratings dinámicos
- ✅ Se prioriza Metacritic cuando está disponible
- ✅ Se usa RAWG como segunda opción
- ✅ Fallback a 7.5 solo cuando no hay datos
- ✅ Cache de 24 horas para reducir llamadas a RAWG
- ✅ No más ratings fijos de 7.5 para todos los juegos
