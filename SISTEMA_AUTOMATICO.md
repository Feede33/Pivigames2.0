# Sistema Automático de Juegos

## 📋 Descripción

Sistema que obtiene automáticamente 20 App IDs de Steam cada 24 horas y los sube a Supabase. Los juegos solo se muestran en la web si tienen un link de descarga configurado.

## 🔧 Componentes

### 1. API Route de Cron Job
**Archivo:** `/src/app/api/cron/fetch-games/route.ts`

- Se ejecuta cada 24 horas (configurado en `vercel.json`)
- Obtiene 20 App IDs aleatorios de una lista de juegos populares
- Verifica si ya existen en la base de datos
- Inserta solo los nuevos (sin duplicados)
- Los juegos se insertan con `links: null` por defecto

### 2. Filtro en Supabase
**Archivo:** `/src/lib/supabase.ts`

La función `getGames()` ahora incluye el filtro:
```typescript
.not('links', 'is', null) // Solo juegos con link de descarga
```

### 3. Configuración de Cron
**Archivo:** `vercel.json`

```json
{
  "crons": [{
    "path": "/api/cron/fetch-games",
    "schedule": "0 0 * * *"  // Cada día a medianoche
  }]
}
```

## 🚀 Configuración

### 1. Variables de Entorno
Agrega a tu `.env.local`:

```bash
CRON_SECRET=tu_clave_secreta_aqui
```

### 2. Desplegar en Vercel

El cron job se ejecutará automáticamente en Vercel. Para desarrollo local, puedes probar manualmente:

```bash
curl -X GET http://localhost:3000/api/cron/fetch-games \
  -H "Authorization: Bearer tu_clave_secreta_aqui"
```

### 3. Estructura de la Tabla en Supabase

Asegúrate de que tu tabla `games` tenga esta estructura:

```sql
CREATE TABLE games (
  id BIGSERIAL PRIMARY KEY,
  steam_appid TEXT NOT NULL UNIQUE,
  links TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📊 Flujo de Trabajo

1. **Cron Job se ejecuta** (cada 24 horas)
   - Selecciona 20 App IDs aleatorios
   - Verifica duplicados
   - Inserta nuevos juegos con `links: null`

2. **Administrador agrega links**
   - Manualmente actualiza el campo `links` en Supabase
   - Puede usar el panel de Supabase o un script

3. **Web muestra juegos**
   - Solo se muestran juegos donde `links IS NOT NULL`
   - Los juegos sin link permanecen ocultos

## 🛠️ Administración Manual

### Ver juegos sin link de descarga:
```sql
SELECT id, steam_appid, created_at 
FROM games 
WHERE links IS NULL 
ORDER BY created_at DESC;
```

### Agregar link de descarga:
```sql
UPDATE games 
SET links = 'https://tu-link-de-descarga.com' 
WHERE steam_appid = '730';
```

### Ver estadísticas:
```sql
SELECT 
  COUNT(*) as total,
  COUNT(links) as con_link,
  COUNT(*) - COUNT(links) as sin_link
FROM games;
```

## 🔒 Seguridad

- El endpoint está protegido con `CRON_SECRET`
- Solo Vercel Cron puede ejecutarlo con la autorización correcta
- Los App IDs se validan antes de insertar

## 📝 Personalización

### Cambiar frecuencia del cron:
Edita `vercel.json`:
- `0 */12 * * *` - Cada 12 horas
- `0 */6 * * *` - Cada 6 horas
- `0 0 * * 0` - Cada domingo

### Cambiar cantidad de juegos:
En `/src/app/api/cron/fetch-games/route.ts`:
```typescript
const randomAppIds = getRandomAppIds(50); // Cambiar de 20 a 50
```

### Agregar más App IDs:
Expande el array `POPULAR_STEAM_APPIDS` en el mismo archivo.

## 🧪 Testing

### Probar el endpoint manualmente:
```bash
# Desarrollo local
curl -X GET http://localhost:3000/api/cron/fetch-games \
  -H "Authorization: Bearer tu_clave_secreta"

# Producción
curl -X GET https://tu-dominio.vercel.app/api/cron/fetch-games \
  -H "Authorization: Bearer tu_clave_secreta"
```

### Respuesta esperada:
```json
{
  "success": true,
  "message": "Processed 20 games",
  "results": {
    "total": 20,
    "inserted": 15,
    "skipped": 5,
    "errors": 0,
    "details": [...]
  },
  "timestamp": "2026-01-07T..."
}
```

## ⚠️ Notas Importantes

1. Los juegos se insertan SIN link de descarga por defecto
2. Debes agregar los links manualmente en Supabase
3. Solo los juegos con link se mostrarán en la web
4. El sistema evita duplicados automáticamente
5. El cron job solo funciona en Vercel (no en desarrollo local)
