# 🎮 Guía Rápida de Administración

## ⚡ Inicio Rápido

### 1. Configurar el Sistema

Agrega esta variable a tu `.env.local`:
```bash
CRON_SECRET=pivigames_secret_2026
```

### 2. Desplegar en Vercel

```bash
git add .
git commit -m "Add automatic game fetching system"
git push
```

El cron job se activará automáticamente y ejecutará cada 24 horas.

## 🔄 Flujo Automático

```
Cada 24 horas:
1. Sistema obtiene 20 App IDs aleatorios
2. Los inserta en Supabase (sin link)
3. Juegos quedan OCULTOS en la web
4. Tú agregas los links manualmente
5. Juegos se MUESTRAN automáticamente
```

## 📝 Agregar Links de Descarga

### Opción 1: Panel de Supabase (Más Fácil)

1. Ve a https://supabase.com/dashboard
2. Abre tu proyecto
3. Ve a "Table Editor" → "games"
4. Haz clic en la fila del juego
5. Edita el campo "links"
6. Guarda

### Opción 2: SQL Editor

```sql
-- Agregar link a UN juego
UPDATE games 
SET links = 'https://mega.nz/file/abc123' 
WHERE steam_appid = '730';

-- Agregar links a VARIOS juegos
UPDATE games 
SET links = CASE steam_appid
  WHEN '730' THEN 'https://mega.nz/file/1'
  WHEN '570' THEN 'https://mega.nz/file/2'
  WHEN '440' THEN 'https://mega.nz/file/3'
END
WHERE steam_appid IN ('730', '570', '440');
```

## 📊 Ver Estadísticas

```sql
-- Ver cuántos juegos tienes
SELECT 
  COUNT(*) as total,
  COUNT(links) as visibles,
  COUNT(*) - COUNT(links) as ocultos
FROM games;
```

## 🔍 Consultas Útiles

### Ver juegos sin link (pendientes de agregar)
```sql
SELECT id, steam_appid, created_at 
FROM games 
WHERE links IS NULL 
ORDER BY created_at DESC;
```

### Ver juegos visibles en la web
```sql
SELECT id, steam_appid, links 
FROM games 
WHERE links IS NOT NULL 
ORDER BY created_at DESC;
```

### Ver juegos agregados hoy
```sql
SELECT * FROM games 
WHERE DATE(created_at) = CURRENT_DATE;
```

## 🧪 Probar el Sistema Manualmente

```bash
# Ejecutar el cron job manualmente (desarrollo)
curl -X GET http://localhost:3000/api/cron/fetch-games \
  -H "Authorization: Bearer pivigames_secret_2026"

# Ejecutar en producción
curl -X GET https://tu-dominio.vercel.app/api/cron/fetch-games \
  -H "Authorization: Bearer pivigames_secret_2026"
```

## ⚙️ Personalización

### Cambiar frecuencia (en `vercel.json`)

```json
{
  "crons": [{
    "path": "/api/cron/fetch-games",
    "schedule": "0 */12 * * *"  // Cada 12 horas
  }]
}
```

Opciones comunes:
- `0 0 * * *` - Cada día a medianoche
- `0 */12 * * *` - Cada 12 horas
- `0 */6 * * *` - Cada 6 horas
- `0 0 * * 0` - Cada domingo

### Cambiar cantidad de juegos

En `/src/app/api/cron/fetch-games/route.ts`:
```typescript
const randomAppIds = getRandomAppIds(50); // Cambiar de 20 a 50
```

## 🚨 Solución de Problemas

### Los juegos no aparecen en la web
✅ Verifica que tengan `links` configurado en Supabase

### El cron no se ejecuta
✅ Asegúrate de estar en Vercel (no funciona en local)
✅ Verifica que `vercel.json` esté en la raíz del proyecto

### Error 401 al probar manualmente
✅ Verifica que `CRON_SECRET` esté configurado correctamente

## 📚 Archivos Importantes

- `/src/app/api/cron/fetch-games/route.ts` - Lógica del cron job
- `/src/lib/supabase.ts` - Filtro de juegos con links
- `vercel.json` - Configuración del cron
- `scripts/manage-games.sql` - Queries útiles para administración

## 💡 Tips

1. **Revisa diariamente** los juegos nuevos sin link
2. **Usa Mega.nz o Google Drive** para los links de descarga
3. **Mantén un backup** de los links en un documento
4. **Elimina juegos antiguos** sin link después de 30 días
5. **Monitorea las estadísticas** regularmente

## 🎯 Workflow Recomendado

```
Lunes - Viernes:
1. Revisar juegos nuevos sin link (5 min)
2. Buscar y agregar links de descarga (15 min)
3. Verificar que se muestren en la web (2 min)

Fin de semana:
1. Revisar estadísticas generales
2. Limpiar juegos antiguos sin link
3. Agregar más App IDs populares si es necesario
```
