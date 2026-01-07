# Solución al Problema del Wallpaper Azulado

## Problema
Cuando se agregaba un nuevo App ID en Supabase, el wallpaper que se mostraba tenía un tono azulado no deseado.

## Causa Raíz Identificada
El problema se debe a que Steam API devuelve diferentes tipos de URLs de background:

1. **`page_bg_raw.jpg`** (✓ Funciona bien): Imagen RAW sin procesar
   - Ejemplo: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/.../page_bg_raw.jpg`
   - Usado por: Cyberpunk 2077, South Park: Snow Day

2. **`storepagebackground/app/`** (✗ Problema): URL dinámica con fondo azul generado por Steam
   - Ejemplo: `https://store.akamai.steamstatic.com/images/storepagebackground/app/413150`
   - Usado por: Stardew Valley, y otros juegos sin background_raw
   - **Este tipo de URL genera un fondo azul por defecto**

## Soluciones Implementadas

### 1. Detección Inteligente de URLs Dinámicas
**Archivo modificado:** `src/app/api/steam/[appid]/route.ts`

Se agregó lógica para detectar URLs dinámicas y usar alternativas mejores:

```typescript
// Detectar si background es una URL dinámica de Steam (con fondo azul)
const isDynamicBackground = gameData.background?.includes('storepagebackground');

// Prioridades para seleccionar el mejor background:
// 1. background_raw (imagen sin procesar) - MEJOR OPCIÓN
// 2. Primer screenshot si background es dinámico - EVITA FONDO AZUL
// 3. background normal (no dinámico)
// 4. header_image como último recurso

let bestBackground = gameData.background_raw;

if (!bestBackground) {
  if (isDynamicBackground && screenshots.length > 0) {
    bestBackground = screenshots[0].full; // Usar screenshot en lugar de fondo azul
  } else if (gameData.background && !isDynamicBackground) {
    bestBackground = gameData.background;
  } else {
    bestBackground = gameData.header_image;
  }
}
```

### 2. Componente de Detección Automática de Color
**Archivo creado:** `src/components/WallpaperImage.tsx`

Componente que analiza el color dominante de la imagen y aplica corrección automática si detecta tinte azul:

```typescript
// Analiza los canales RGB de la imagen
// Si el azul es dominante (>25 puntos más que R/G), aplica corrección
if (blueDominance > 25) {
  setImageStyle({
    filter: 'saturate(1.2) contrast(1.1) hue-rotate(-5deg)',
    // ...
  });
}
```

### 3. Cambio de `background-image` a `<img>` tag
**Archivos modificados:**
- `src/components/GameModal.tsx`
- `src/app/page.tsx`

Uso del componente `WallpaperImage` para mejor control:

```tsx
<WallpaperImage
  src={game.wallpaper}
  alt={game.title}
  className="absolute inset-0 w-full h-full object-cover"
/>
```

### 4. Logging Mejorado
**Archivo modificado:** `src/lib/supabase.ts`

Se agregaron logs detallados para debugging:

```typescript
console.log(`✓ Using background_raw for ${steamData.name}`);
console.log(`⚠ Using background (compressed) for ${steamData.name}`);
console.log(`⚠ Using header_image (fallback) for ${steamData.name}`);
```

## Cómo Funciona la Solución

1. **API Route detecta el tipo de URL**: Identifica si Steam está devolviendo una URL dinámica con fondo azul
2. **Selecciona la mejor alternativa**: Si detecta URL dinámica, usa el primer screenshot en alta calidad
3. **Componente analiza el color**: WallpaperImage analiza la imagen y aplica corrección si es necesario
4. **Renderizado optimizado**: Usa etiquetas `<img>` con filtros CSS apropiados

## Resultados Esperados

- **Juegos con `background_raw`**: Se muestran perfectamente (Cyberpunk, South Park)
- **Juegos sin `background_raw`**: Usan el primer screenshot como wallpaper (Stardew Valley)
- **Detección automática**: Si aún hay tinte azul, se corrige automáticamente

## Cómo Probar

1. Agrega un nuevo juego en Supabase con un `steam_appid` válido
2. Abre la consola del navegador (F12)
3. Busca los logs:
   - `Background type for [nombre]:` - Muestra qué tipo de background se está usando
   - `Color analysis for [nombre]:` - Muestra el análisis de color RGB
   - `⚠ Blue tint detected` - Indica si se aplicó corrección automática
4. Verifica que el wallpaper se muestre con los colores correctos

## Ejemplos de Logs

```
Background type for Stardew Valley: {
  has_raw: false,
  has_background: true,
  is_dynamic: true,
  using: "https://cdn.akamai.steamstatic.com/steam/apps/413150/ss_..."
}
⚠ Using first screenshot as background for Stardew Valley (avoiding blue background)
```

## Notas Adicionales

- Steam no proporciona `background_raw` para todos los juegos
- Las URLs dinámicas (`storepagebackground`) siempre tienen fondo azul
- Los screenshots son una excelente alternativa y suelen tener mejor calidad
- El componente WallpaperImage funciona como fallback adicional por si acaso
