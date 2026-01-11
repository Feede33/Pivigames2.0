# Solución a Problemas de Caché

## Problema
Errores 500 en las llamadas a `/api/steam/[appid]` debido a respuestas cacheadas incorrectamente por Next.js, Vercel y el navegador.

## ⚡ Solución Rápida

1. **Ejecuta el script de limpieza:**
   ```bash
   clear-cache.bat
   ```

2. **Redeploya en Vercel:**
   ```bash
   git add .
   git commit -m "Fix: Disable cache for Steam API routes"
   git push
   ```

3. **Limpia el caché de Vercel:**
   - Ve a https://vercel.com → tu proyecto
   - Settings → Data Cache → "Purge Everything"

## Cambios Realizados

### 1. API Routes
#### `src/app/api/steam/[appid]/route.ts`
- ✅ Agregado `cache: 'no-store'` al fetch de Steam API
- ✅ Headers de respuesta con `Cache-Control: no-store, no-cache, must-revalidate`
- ✅ Mejor manejo de errores con detalles específicos
- ✅ User-Agent en las peticiones a Steam

#### `src/app/api/steam/specials/route.ts`
- ✅ Agregado `cache: 'no-store'` al fetch de Steam API
- ✅ Headers de respuesta con `Cache-Control: no-store, no-cache, must-revalidate`
- ✅ Mejor manejo de errores con detalles específicos
- ✅ User-Agent en las peticiones a Steam

### 2. Cliente
#### `GameModal.tsx`
- ✅ Timestamp `?t=${Date.now()}` para evitar caché del navegador
- ✅ Headers `Cache-Control` y `Pragma` en las peticiones fetch
- ✅ Opción `cache: 'no-store'` en fetch

#### `page.tsx`
- ✅ Timestamp en llamadas a `/api/steam/[appid]`
- ✅ Timestamp en llamadas a `/api/steam/specials`
- ✅ Headers anti-caché en todas las peticiones

#### `lib/supabase.ts`
- ✅ Timestamp en llamadas a `/api/steam/[appid]`
- ✅ Headers anti-caché en fetch

### 3. Configuración Vercel (`vercel.json`)
- ✅ Headers globales para rutas `/api/steam/*` con:
  - `Cache-Control: no-store, no-cache, must-revalidate`
  - `Pragma: no-cache`
  - `Expires: 0`

## Pasos para Limpiar el Caché

### Opción 1: Script Automático (Windows)
```bash
# Ejecutar el script de limpieza
clear-cache.bat

# Luego iniciar el servidor
npm run dev
```

### Opción 2: Manual (Local)
```bash
# Eliminar carpeta .next
rmdir /s /q .next

# Eliminar cache de node_modules
rmdir /s /q node_modules\.cache

# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias (opcional)
npm install

# Iniciar servidor
npm run dev
```

### Opción 3: Desde Vercel Dashboard
1. Ve a tu proyecto en https://vercel.com
2. Settings → Data Cache
3. Click en "Purge Everything"

### Opción 4: Desde Vercel CLI
```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Login
vercel login

# Limpiar caché y redeployar
vercel --prod --force
```

### Opción 5: Redeployar
```bash
# Hacer un cambio mínimo y pushear
git commit --allow-empty -m "Clear cache"
git push
```

## Verificar que Funciona

1. Abre DevTools (F12)
2. Ve a Network tab
3. Deshabilita caché: ☑️ "Disable cache"
4. Recarga la página
5. Busca las peticiones a `/api/steam/[appid]`
6. Verifica que:
   - Status sea 200 (no 500)
   - Response Headers incluyan `Cache-Control: no-store`
   - Cada petición tenga un timestamp diferente en la URL

## Prevención Futura

Los cambios realizados previenen problemas de caché:
- El servidor nunca cachea respuestas de Steam
- El navegador no cachea las respuestas de la API
- Vercel no cachea las rutas de Steam API
- Cada petición incluye un timestamp único

## Notas Importantes

⚠️ **Rate Limiting de Steam**: Steam puede bloquear tu IP si haces demasiadas peticiones. Los errores 500 también pueden ser por:
- Demasiadas peticiones simultáneas
- IP bloqueada temporalmente
- AppID inválido o juego no disponible

Si los errores persisten después de limpiar el caché, considera:
1. Agregar un delay entre peticiones
2. Implementar un sistema de cola
3. Cachear respuestas exitosas en tu base de datos
