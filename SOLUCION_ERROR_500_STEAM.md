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
5. **Juegos Específicos**: Algunos juegos (como 223100) devuelven 500 consistentemente

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

### 3. Datos de Fallback en la API (NUEVO)
**Archivo**: `src/app/api/steam/[appid]/route.ts`

En lugar de devolver un error 500, la API ahora devuelve datos básicos de fallback:
```typescript
const fallbackData = {
  appid: parseInt(appid),
  name: `Game ${appid}`,
  type: 'game',
  short_description: 'Unable to load game details from Steam. Please try again later.',
  screenshots: [],
  videos: [],
  header_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
  background: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/page_bg_generated_v6b.jpg`,
  // ... más campos básicos
  _error: errorMessage,
  _fallback: true,
};

// Devolver 200 con datos de fallback en lugar de error
return NextResponse.json(fallbackData, {
  headers: {
    'X-Steam-Error': errorMessage,
    'X-Fallback-Data': 'true',
  },
});
```

### 4. Detección de Fallback en el Cliente (NUEVO)
**Archivo**: `src/components/GameModal.tsx`

El modal ahora detecta cuando recibe datos de fallback y muestra un mensaje apropiado:
```typescript
const [steamError, setSteamError] = useState<string | null>(null);

// En el fetch:
.then(async (res) => {
  const data = await res.json();
  
  // Verificar si es un fallback
  if (data._fallback) {
    console.warn(`Steam API returned fallback data for ${game.steam_appid}:`, data._error);
    setSteamError(data._error || 'Unable to load Steam data');
    // No establecer steamData para usar datos del juego
    return;
  }
  
  // ... resto del código
})
```

### 5. Indicador Visual de Error (NUEVO)
Se agregó un indicador visual cuando hay datos limitados:
```typescript
{steamError && (
  <span className="text-yellow-500 text-xs ml-2" title={steamError}>
    ⚠ Limited info available
  </span>
)}
```

### 6. Manejo de Errores Mejorado
**Archivo**: `src/app/api/steam/[appid]/route.ts`

Se mejoró el manejo de errores para distinguir entre diferentes tipos:
- **504**: Timeout (Steam tardó demasiado)
- **503**: Error de red (no se puede alcanzar Steam)
- **500**: Error general

Pero ahora todos devuelven 200 con datos de fallback en lugar de errores.

## Beneficios
1. **Mayor Resiliencia**: La aplicación SIEMPRE funciona, incluso si Steam falla completamente
2. **Mejor UX**: Los usuarios ven datos básicos en lugar de pantallas de error
3. **Menos Errores 500**: Los reintentos automáticos reducen fallos temporales
4. **Mejor Logging**: Más información para debugging en producción
5. **Degradación Elegante**: El modal muestra lo que puede y avisa cuando hay limitaciones
6. **Sin Bloqueos**: Un juego con error no impide ver otros juegos

## Testing
Para probar los cambios:
1. Desplegar a Vercel
2. Verificar que los juegos se cargan correctamente
3. Revisar los logs de Vercel para confirmar que los reintentos funcionan
4. Verificar que los juegos con errores muestran datos de fallback
5. Confirmar que aparece el indicador "⚠ Limited info available" cuando Steam falla

## Próximos Pasos (Opcional)
1. Implementar caché en Redis/Vercel KV para reducir llamadas a Steam
2. Agregar rate limiting en el lado del servidor
3. Implementar un sistema de cola para solicitudes a Steam
4. Considerar usar la API de Steam con API key para mayor límite de rate
5. Pre-cargar datos de juegos populares en la base de datos

## Resultado Final
Con estos cambios, el error 500 de Steam ya no rompe la aplicación. Los usuarios siempre pueden ver el modal del juego, aunque con información limitada si Steam falla. El sistema es ahora mucho más robusto y tolerante a fallos.
