# ✅ Checklist de Verificación del Sistema

## 📋 Antes de Desplegar

### 1. Archivos Creados
- [ ] `/src/app/api/cron/fetch-games/route.ts` existe
- [ ] `/src/app/api/test-cron/route.ts` existe
- [ ] `/src/lib/supabase.ts` actualizado con filtro
- [ ] `vercel.json` creado en la raíz
- [ ] `scripts/init-database.sql` creado
- [ ] `scripts/manage-games.sql` creado

### 2. Variables de Entorno
- [ ] `CRON_SECRET` agregado a `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado
- [ ] `STEAM_API_KEY` configurado

### 3. Base de Datos Supabase
- [ ] Tabla `games` creada
- [ ] Columnas: `id`, `steam_appid`, `links`, `created_at`, `updated_at`
- [ ] Índices creados
- [ ] RLS (Row Level Security) configurado

## 🚀 Después de Desplegar

### 1. Verificar en Vercel
```bash
# Ir a: https://vercel.com/tu-usuario/tu-proyecto

# Verificar:
- [ ] Settings → Cron Jobs → Ver "/api/cron/fetch-games"
- [ ] Settings → Environment Variables → Ver CRON_SECRET
- [ ] Deployments → Latest → Ver que no hay errores
```

### 2. Probar el Sistema
```bash
# Opción 1: Endpoint de prueba
curl https://tu-dominio.vercel.app/api/test-cron

# Opción 2: Cron directo
curl -X GET https://tu-dominio.vercel.app/api/cron/fetch-games \
  -H "Authorization: Bearer pivigames_secret_2026"

# Verificar respuesta:
- [ ] "success": true
- [ ] "inserted": > 0
- [ ] "errors": 0
```

### 3. Verificar en Supabase
```sql
-- Ejecutar en SQL Editor:

-- Ver juegos insertados
SELECT COUNT(*) FROM games;

-- Ver últimos juegos
SELECT * FROM games ORDER BY created_at DESC LIMIT 10;

-- Ver estadísticas
SELECT 
  COUNT(*) as total,
  COUNT(links) as con_link,
  COUNT(*) - COUNT(links) as sin_link
FROM games;

# Verificar:
- [ ] Hay juegos en la tabla
- [ ] Todos tienen steam_appid
- [ ] links es NULL por defecto
```

### 4. Verificar en la Web
```bash
# Abrir tu sitio web

# Verificar:
- [ ] Los juegos SIN link NO aparecen
- [ ] Solo se muestran juegos con links
- [ ] No hay errores en la consola
```

## 🧪 Pruebas Funcionales

### Test 1: Inserción de Juegos
```bash
# Ejecutar cron manualmente
curl https://tu-dominio.vercel.app/api/test-cron

# Esperar respuesta
# Verificar en Supabase que se insertaron juegos
```

### Test 2: Filtro de Links
```sql
-- En Supabase, agregar link a un juego
UPDATE games 
SET links = 'https://test.com/game.zip' 
WHERE id = 1;

-- Verificar en la web que ahora aparece
```

### Test 3: Prevención de Duplicados
```bash
# Ejecutar cron dos veces seguidas
curl https://tu-dominio.vercel.app/api/test-cron
curl https://tu-dominio.vercel.app/api/test-cron

# Verificar que "skipped" aumenta en la segunda ejecución
```

### Test 4: Autorización
```bash
# Intentar sin autorización (debe fallar)
curl https://tu-dominio.vercel.app/api/cron/fetch-games

# Verificar respuesta: 401 Unauthorized
```

## 📊 Monitoreo Continuo

### Diario
- [ ] Revisar logs en Vercel
- [ ] Verificar nuevos juegos en Supabase
- [ ] Agregar links a juegos pendientes

### Semanal
- [ ] Revisar estadísticas de juegos
- [ ] Limpiar juegos antiguos sin link
- [ ] Verificar que el cron se ejecuta correctamente

### Mensual
- [ ] Revisar y actualizar lista de App IDs
- [ ] Optimizar queries de base de datos
- [ ] Backup de la base de datos

## 🚨 Indicadores de Problemas

### ⚠️ Señales de Alerta

1. **Cron no se ejecuta**
   - Verificar logs en Vercel
   - Revisar configuración de `vercel.json`
   - Verificar variables de entorno

2. **Juegos no aparecen en web**
   - Verificar que tengan `links` en Supabase
   - Revisar filtro en `getGames()`
   - Verificar consola del navegador

3. **Duplicados en base de datos**
   - Verificar constraint UNIQUE en `steam_appid`
   - Revisar lógica de `appIdExists()`

4. **Errores 500 en el cron**
   - Revisar logs de Vercel
   - Verificar conexión a Supabase
   - Verificar formato de App IDs

## ✅ Sistema Funcionando Correctamente

Si todo está bien, deberías ver:

1. **En Vercel Logs:**
   ```
   ✓ /api/cron/fetch-games executed successfully
   ✓ Processed 20 games
   ✓ Inserted: 15, Skipped: 5, Errors: 0
   ```

2. **En Supabase:**
   ```
   ✓ 20+ juegos en la tabla
   ✓ Nuevos juegos cada día
   ✓ steam_appid únicos
   ```

3. **En tu Web:**
   ```
   ✓ Solo juegos con links visibles
   ✓ Sin errores en consola
   ✓ Carga rápida de datos
   ```

## 📞 Troubleshooting Rápido

| Síntoma | Causa Probable | Solución |
|---------|----------------|----------|
| 401 Unauthorized | CRON_SECRET incorrecto | Verificar variable en Vercel |
| 500 Internal Error | Error en Supabase | Revisar logs y conexión |
| Juegos no visibles | Falta campo `links` | Agregar links en Supabase |
| Cron no ejecuta | Configuración incorrecta | Verificar `vercel.json` |
| Duplicados | Constraint no aplicado | Ejecutar `init-database.sql` |

## 🎯 Próximos Pasos

Una vez verificado todo:

1. [ ] Documentar tu CRON_SECRET en lugar seguro
2. [ ] Configurar alertas en Vercel (opcional)
3. [ ] Crear proceso de backup de Supabase
4. [ ] Establecer rutina de administración diaria
5. [ ] Expandir lista de App IDs populares

## 📚 Recursos

- **Logs de Vercel**: https://vercel.com/tu-proyecto/logs
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Cron Schedule**: https://crontab.guru/
- **Documentación**: Ver archivos `SISTEMA_AUTOMATICO.md` y `GUIA_RAPIDA_ADMIN.md`

---

**¡Sistema verificado y listo para producción! 🚀**
