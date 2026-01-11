# Solución al Error 500 de la API de Steam

## Problema
Los juegos no se cargaban correctamente debido a errores 500 en la API de Steam:
```
GET https://pivigames2-0-7r0rpi5jx-feede33s-projects.vercel.app/api/steam/1013680?l=es&t=1768168932841 500 (Internal Server Error)
```

## Causas Identificadas
1. **Timeouts**: La API de Steam puede tardar mucho en responder desde Vercel
2. **Rate Limiting**: Steam puede bloquear solicitudes si hay demasiadas en poco tiempo
3. **Errores de Red**: Problemas de conectividad entre Vercel y Steam
4. **Manejo de Errores Insuficiente**: El código no manejaba bien los fallos de la API

## Soluciones Implementadas

### 1. Sistema de Reintentos con Backoff Exponencial
**Archivo**: `src/app/api/steam/[appid]/route.ts`

Se agregó una función `fetchWithRetry` que:
- Reintenta hasta 3 veces en caso de error
- Implementa timeout de 10 segundos por solicitud
- Usa backoff exponencial (1s, 2s, 4s) entre reintentos
- Maneja específicamente errores 429 (rate limit) y 503 (service unavailable)

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) return response;
      
      if (response.status === 429 || response.status === 503) {
        const waitTime = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}
```

### 2. Mejora del User-Agent
Se actualizó el User-Agent para simular un navegador moderno:
```typescript
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': steamLanguage,
}
```

### 3. Manejo de Errores Mejorado
**Archivo**: `src/app/api/steam/[appid]/route.ts`

Se mejoró el manejo de errores para distinguir entre diferentes tipos:
- **504**: Timeout (Steam tardó demasiado)
- **503**: Error de red (no se puede alcanzar Steam)
- **500**: Error general

```typescript
if (error.name === 'AbortError') {
  errorMessage = 'Request timeout - Steam API took too long to respond';
  statusCode = 504;
} else if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
  errorMessage = 'Network error - Unable to reach Steam API';
  statusCode = 503;
}
```

### 4. Datos de Fallback en el Cliente
**Archivo**: `src/lib/supabase.ts`

La función `enrichGameWithSteamData` ahora retorna datos básicos si la API falla:
```typescript
catch (err) {
  console.error(`Error loading Steam data for ${game.steam_appid}:`, err);
  
  const fallbackImage = `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steam_appid}/header.jpg`;
  
  return {
    ...game,
    title: game.title || `Game ${game.steam_appid}`,
    genre: game.genre || 'Unknown',
    image: fallbackImage,
    image_fallback: fallbackImage,
    cover_image: fallbackImage,
    rating: 7.0,
    wallpaper: fallbackImage,
    description: 'Unable to load game details. Please try again later.',
    screenshots: []
  };
}
```

### 5. Manejo de Errores en Specials
**Archivo**: `src/app/[locale]/page.tsx`

Se mejoró el manejo de errores al cargar datos de Steam para ofertas especiales:
```typescript
if (response.ok) {
  // Cargar datos completos
} else {
  console.warn(`Steam API failed for ${special.id} (${response.status}), using basic data`);
  // Mantener datos básicos del special
}
```

## Beneficios
1. **Mayor Resiliencia**: La aplicación sigue funcionando aunque Steam falle
2. **Mejor UX**: Los usuarios ven datos básicos en lugar de errores
3. **Menos Errores 500**: Los reintentos automáticos reducen fallos temporales
4. **Mejor Logging**: Más información para debugging en producción

## Testing
Para probar los cambios:
1. Desplegar a Vercel
2. Verificar que los juegos se cargan correctamente
3. Revisar los logs de Vercel para confirmar que los reintentos funcionan
4. Verificar que los juegos con errores muestran datos de fallback

## Próximos Pasos (Opcional)
1. Implementar caché en Redis/Vercel KV para reducir llamadas a Steam
2. Agregar rate limiting en el lado del servidor
3. Implementar un sistema de cola para solicitudes a Steam
4. Considerar usar la API de Steam con API key para mayor límite de rate
