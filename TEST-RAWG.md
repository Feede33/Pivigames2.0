# Test de Integración RAWG

## Verificación de la implementación

### ✅ Archivos creados
- [x] `src/app/api/rawg/[slug]/route.ts` - API endpoint para RAWG
- [x] `src/lib/rawg.ts` - Funciones helper
- [x] `RAWG-SETUP.md` - Documentación

### ✅ Archivos modificados
- [x] `src/lib/supabase.ts` - Función `enrichGameWithSteamData` actualizada
- [x] `src/app/[locale]/page.tsx` - Función `handleSpecialClick` actualizada
- [x] `.env.local.example` - Variable `RAWG_API_KEY` agregada

### ✅ Flujo de rating implementado

```
1. Cargar juego desde DB
   ↓
2. Obtener datos de Steam
   ↓
3. ¿Tiene Metacritic?
   ├─ SÍ → Usar Metacritic / 10
   └─ NO → Consultar RAWG
       ↓
       ¿RAWG tiene rating?
       ├─ SÍ → Usar rating de RAWG (0-5) * 2
       └─ NO → Usar 7.5 como fallback
```

### 🧪 Cómo probar

1. **Configurar RAWG API Key**
   ```bash
   # En .env.local
   RAWG_API_KEY=tu_api_key_aqui
   ```

2. **Reiniciar el servidor**
   ```bash
   npm run dev
   ```

3. **Verificar en consola del navegador**
   - Busca logs como: `[RAWG] Rating for [Game Name]: X/10`
   - Verifica que juegos sin Metacritic muestren ratings diferentes a 7.5

4. **Probar con juegos específicos**
   - Juegos con Metacritic: Deberían mostrar el rating de Metacritic
   - Juegos sin Metacritic: Deberían consultar RAWG
   - Juegos no encontrados en RAWG: Deberían mostrar 7.5

### 📊 Ejemplos de juegos para probar

| Juego | Metacritic | RAWG | Resultado esperado |
|-------|-----------|------|-------------------|
| The Witcher 3 | ✅ 92 | ✅ 4.6 | 9.2 (Metacritic) |
| Stardew Valley | ❌ No | ✅ 4.5 | 9.0 (RAWG) |
| Juego indie pequeño | ❌ No | ❌ No | 7.5 (Fallback) |

### 🔍 Verificar en el código

**En `src/lib/supabase.ts` línea ~204:**
```typescript
// Obtener rating de RAWG si no hay Metacritic
let rating = 7.5; // Valor por defecto

if (steamData.metacritic) {
  rating = steamData.metacritic / 10;
} else {
  // Intentar obtener rating de RAWG
  const rawgRating = await getRawgRating(steamData.name || game.title || '');
  if (rawgRating > 0) {
    rating = rawgRating;
  }
}
```

**En `src/app/[locale]/page.tsx` línea ~372:**
```typescript
// Obtener rating de RAWG si no hay Metacritic
let rating = 7.5;
if (steamData.metacritic) {
  rating = steamData.metacritic / 10;
} else {
  const rawgRating = await getRawgRating(steamData.name || special.name);
  if (rawgRating > 0) {
    rating = rawgRating;
  }
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
