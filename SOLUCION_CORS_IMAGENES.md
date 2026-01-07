# Solución CORS para Imágenes de Steam

## Problema
Las imágenes de Steam estaban siendo bloqueadas por CORS cuando se intentaban cargar directamente desde el cliente:
```
Access to image at 'https://store.akamai.steamstatic.com/...' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Causa
- Steam no proporciona headers CORS (`Access-Control-Allow-Origin`) en sus imágenes
- El componente `WallpaperImage` intentaba analizar las imágenes usando canvas, lo cual requiere CORS
- Las imágenes se cargaban directamente desde URLs de Steam en el cliente

## Solución Implementada

### 1. API Proxy para Imágenes (`/api/proxy-image/route.ts`)
Creamos un endpoint que:
- Recibe la URL de la imagen como parámetro
- Descarga la imagen desde Steam en el servidor (sin restricciones CORS)
- Sirve la imagen al cliente con headers CORS apropiados
- Cachea las imágenes para mejor rendimiento

### 2. Utilidad de Proxy (`/lib/image-proxy.ts`)
Funciones helper para:
- `proxySteamImage(url)`: Convierte URLs de Steam a URLs proxy
- `proxySteamImages(urls)`: Convierte arrays de URLs

### 3. Actualización de Componentes
- **WallpaperImage**: Usa el proxy automáticamente para imágenes de Steam
- **GameModal**: Usa el proxy para screenshots y thumbnails
- **page.tsx**: Usa el proxy para imágenes de tarjetas de juegos

## Beneficios
✅ Elimina errores CORS
✅ Permite análisis de color de imágenes
✅ Mejora el rendimiento con caché
✅ Funciona en producción (Vercel)
✅ No requiere cambios en la base de datos

## Uso
Las imágenes de Steam ahora se cargan automáticamente a través del proxy:
```typescript
// Antes
<img src={game.image} />

// Ahora
<img src={proxySteamImage(game.image)} />
```

El componente `WallpaperImage` maneja esto automáticamente.
