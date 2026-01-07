# Solución al Problema del Wallpaper Azulado

## Problema
Cuando se agregaba un nuevo App ID en Supabase, el wallpaper que se mostraba tenía un tono azulado no deseado.

## Causa
El problema se debía a varios factores:
1. Uso de `background-image` en lugar de etiquetas `<img>` para mostrar las imágenes
2. Falta de especificación explícita de `filter: none` en las imágenes
3. Posible compresión o formato de imagen de Steam API

## Soluciones Implementadas

### 1. Cambio de `background-image` a `<img>` tag
**Archivos modificados:**
- `src/components/GameModal.tsx`
- `src/app/page.tsx`

**Antes:**
```tsx
<div
  className="absolute inset-0 bg-cover bg-center"
  style={{ backgroundImage: `url(${game.wallpaper})` }}
/>
```

**Después:**
```tsx
<img
  src={game.wallpaper}
  alt={game.title}
  className="absolute inset-0 w-full h-full object-cover"
  style={{ 
    filter: 'none',
    imageRendering: '-webkit-optimize-contrast'
  }}
/>
```

### 2. Configuración CSS Global
**Archivo modificado:** `src/app/globals.css`

Se agregó una regla CSS global para asegurar que todas las imágenes se rendericen sin filtros de color:

```css
img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  filter: none;
}
```

### 3. Priorización de `background_raw` en Steam API
**Archivo modificado:** `src/lib/supabase.ts`

Se agregó un console.log para debugging y se priorizó explícitamente `background_raw` (imagen sin compresión) sobre `background`:

```typescript
const wallpaperUrl = steamData.background_raw || steamData.background || steamData.header_image || '';
console.log(`Wallpaper URL for ${steamData.name}:`, wallpaperUrl);
```

## Beneficios de los Cambios

1. **Mejor calidad de imagen**: Uso de etiquetas `<img>` permite mejor control sobre el renderizado
2. **Sin filtros de color**: Especificación explícita de `filter: none` elimina cualquier tinte azulado
3. **Mejor rendimiento**: `image-rendering: -webkit-optimize-contrast` optimiza la visualización
4. **Debugging mejorado**: Console.log ayuda a identificar qué URL de wallpaper se está usando

## Cómo Probar

1. Agrega un nuevo juego en Supabase con un `steam_appid` válido
2. Abre la aplicación y verifica que el wallpaper se muestre con los colores correctos
3. Revisa la consola del navegador para ver la URL del wallpaper que se está cargando
4. Compara el wallpaper en tu aplicación con el wallpaper original en Steam

## Notas Adicionales

- Si el problema persiste, verifica que la URL del wallpaper en Steam API sea correcta
- Algunos juegos pueden no tener `background_raw`, en cuyo caso se usará `background` o `header_image`
- El tono azulado también puede deberse a la configuración de color del monitor o navegador
