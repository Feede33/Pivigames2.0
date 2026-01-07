# 🎮 Sistema Automático de Juegos - Pivigames 2.0

## 🌟 ¿Qué hace este sistema?

Obtiene automáticamente **20 juegos de Steam cada 24 horas** y los sube a tu base de datos. Los juegos solo aparecen en tu web cuando les agregas un link de descarga.

## 🔄 Flujo Automático

```
┌─────────────────────────────────────────────────────────────┐
│                    CADA 24 HORAS                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Cron Job se ejecuta automáticamente                    │
│     → Obtiene 20 App IDs aleatorios de Steam               │
│     → Verifica que no existan duplicados                   │
│     → Inserta nuevos juegos en Supabase                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Juegos en Supabase (links = NULL)                      │
│     → Estado: OCULTOS en la web                            │
│     → Esperando que agregues el link de descarga           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Tú agregas los links manualmente                       │
│     → Panel de Supabase o SQL Editor                       │
│     → UPDATE games SET links = 'url' WHERE ...             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Juegos VISIBLES en tu web                              │
│     → Automáticamente aparecen en la página                │
│     → Los usuarios pueden verlos y descargarlos            │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Archivos Creados

### 🔧 Código del Sistema
- `/src/app/api/cron/fetch-games/route.ts` - Lógica del cron job
- `/src/app/api/test-cron/route.ts` - Endpoint para probar el sistema
- `/src/lib/supabase.ts` - Filtro para mostrar solo juegos con links
- `vercel.json` - Configuración del cron (cada 24 horas)

### 📚 Documentación
- `SISTEMA_AUTOMATICO.md` - Documentación técnica completa
- `GUIA_RAPIDA_ADMIN.md` - Guía de administración diaria
- `PASOS_INSTALACION.md` - Instalación paso a paso
- `README_SISTEMA_AUTOMATICO.md` - Este archivo (resumen)

### 🗄️ Scripts de Base de Datos
- `scripts/init-database.sql` - Crear tabla y configuración inicial
- `scripts/manage-games.sql` - Queries útiles para administración

### ⚙️ Configuración
- `.env.local` - Variables de entorno (actualizado con CRON_SECRET)
- `.env.local.example` - Ejemplo de configuración

## 🚀 Inicio Rápido (3 pasos)

### 1. Configurar Base de Datos
```sql
-- En Supabase SQL Editor, ejecuta:
-- scripts/init-database.sql
```

### 2. Agregar Variable de Entorno
```bash
# En .env.local, agrega:
CRON_SECRET=pivigames_secret_2026
```

### 3. Desplegar
```bash
git add .
git commit -m "Add automatic game system"
git push
```

¡Listo! El sistema se ejecutará automáticamente cada 24 horas.

## 🧪 Probar el Sistema

### Opción 1: Endpoint de Prueba (Más Fácil)
```bash
curl https://tu-dominio.vercel.app/api/test-cron
```

### Opción 2: Llamar al Cron Directamente
```bash
curl -X GET https://tu-dominio.vercel.app/api/cron/fetch-games \
  -H "Authorization: Bearer pivigames_secret_2026"
```

### Respuesta Esperada:
```json
{
  "success": true,
  "message": "Processed 20 games",
  "results": {
    "total": 20,
    "inserted": 15,
    "skipped": 5,
    "errors": 0
  }
}
```

## 📊 Administración Diaria

### Ver juegos pendientes (sin link):
```sql
SELECT id, steam_appid, created_at 
FROM games 
WHERE links IS NULL 
ORDER BY created_at DESC;
```

### Agregar link de descarga:
```sql
UPDATE games 
SET links = 'https://mega.nz/file/abc123' 
WHERE steam_appid = '730';
```

### Ver estadísticas:
```sql
SELECT 
  COUNT(*) as total,
  COUNT(links) as visibles,
  COUNT(*) - COUNT(links) as ocultos
FROM games;
```

## 🎯 Características Principales

✅ **Automático**: Se ejecuta cada 24 horas sin intervención  
✅ **Sin Duplicados**: Verifica que los juegos no existan antes de insertar  
✅ **Filtrado Inteligente**: Solo muestra juegos con link de descarga  
✅ **Seguro**: Endpoint protegido con CRON_SECRET  
✅ **Escalable**: Fácil de personalizar cantidad y frecuencia  
✅ **Mantenible**: Scripts SQL para administración fácil  

## ⚙️ Personalización

### Cambiar frecuencia (en `vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/fetch-games",
    "schedule": "0 */12 * * *"  // Cada 12 horas
  }]
}
```

### Cambiar cantidad de juegos:
En `/src/app/api/cron/fetch-games/route.ts`:
```typescript
const randomAppIds = getRandomAppIds(50); // 50 en vez de 20
```

### Agregar más App IDs:
Expande el array `POPULAR_STEAM_APPIDS` en el mismo archivo.

## 🔒 Seguridad

- Endpoint protegido con `CRON_SECRET`
- Solo Vercel Cron puede ejecutarlo
- Row Level Security (RLS) en Supabase
- Validación de App IDs antes de insertar

## 📈 Monitoreo

### En Vercel:
1. Ve a tu proyecto
2. Logs → Functions
3. Busca `/api/cron/fetch-games`
4. Verifica ejecuciones diarias

### En Supabase:
1. Table Editor → games
2. Verifica nuevos registros diarios
3. Revisa el campo `created_at`

## 🚨 Solución de Problemas

| Problema | Solución |
|----------|----------|
| Juegos no aparecen en web | Verifica que tengan `links` en Supabase |
| Cron no se ejecuta | Asegúrate de estar en Vercel (no local) |
| Error 401 | Verifica `CRON_SECRET` en variables de entorno |
| Duplicados | El sistema los previene automáticamente |

## 📚 Documentación Completa

Para más detalles, consulta:

1. **PASOS_INSTALACION.md** - Instalación completa paso a paso
2. **SISTEMA_AUTOMATICO.md** - Documentación técnica detallada
3. **GUIA_RAPIDA_ADMIN.md** - Administración y mantenimiento diario
4. **scripts/manage-games.sql** - Todas las queries útiles

## 💡 Tips y Mejores Prácticas

1. **Revisa diariamente** los juegos nuevos sin link
2. **Usa servicios confiables** para los links (Mega, Google Drive)
3. **Mantén un backup** de los links en un documento
4. **Limpia juegos antiguos** sin link después de 30 días
5. **Monitorea las estadísticas** semanalmente

## 🎉 Resultado Final

Con este sistema:
- ✅ Tu web se actualiza automáticamente cada día
- ✅ Solo muestras juegos que tienen descarga disponible
- ✅ No hay duplicados en la base de datos
- ✅ Fácil de administrar y mantener
- ✅ Escalable para crecer con tu proyecto

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel
2. Verifica las variables de entorno
3. Ejecuta las queries de diagnóstico en Supabase
4. Prueba el endpoint manualmente con `/api/test-cron`

---

**¡Tu sistema automático está listo para funcionar! 🚀**

Ahora solo necesitas:
1. Esperar que el cron agregue juegos (cada 24h)
2. Agregar los links de descarga en Supabase
3. ¡Disfrutar de tu web actualizada automáticamente!
