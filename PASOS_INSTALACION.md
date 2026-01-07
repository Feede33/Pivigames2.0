# 🚀 Pasos de Instalación del Sistema Automático

## 📋 Requisitos Previos

- Cuenta de Vercel
- Proyecto de Supabase
- Git configurado

## 🔧 Instalación Paso a Paso

### 1. Configurar Base de Datos en Supabase

1. Ve a https://supabase.com/dashboard
2. Abre tu proyecto
3. Ve a "SQL Editor"
4. Copia y pega el contenido de `scripts/init-database.sql`
5. Haz clic en "Run"
6. Verifica que la tabla se creó correctamente

### 2. Configurar Variables de Entorno

Edita tu archivo `.env.local` y agrega:

```bash
# Ya tienes estas:
NEXT_PUBLIC_SUPABASE_URL=https://ktakrkxxyezczbogmuiq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
STEAM_API_KEY=F7CDC2706E69146FB7907E4854A2DCC6

# NUEVA - Agrega esta:
CRON_SECRET=pivigames_secret_2026
```

### 3. Configurar Variables en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - `CRON_SECRET` = `pivigames_secret_2026`
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu key
   - `STEAM_API_KEY` = tu key

### 4. Desplegar el Proyecto

```bash
# Asegúrate de estar en la carpeta del proyecto
cd --yess

# Agregar todos los cambios
git add .

# Hacer commit
git commit -m "Add automatic game fetching system"

# Subir a Vercel
git push
```

### 5. Verificar que el Cron está Activo

1. Ve a tu proyecto en Vercel
2. Settings → Cron Jobs
3. Deberías ver: `/api/cron/fetch-games` con schedule `0 0 * * *`

### 6. Probar el Sistema Manualmente

```bash
# Opción 1: Usar el endpoint de prueba
curl https://tu-dominio.vercel.app/api/test-cron

# Opción 2: Llamar directamente al cron
curl -X GET https://tu-dominio.vercel.app/api/cron/fetch-games \
  -H "Authorization: Bearer pivigames_secret_2026"
```

### 7. Verificar en Supabase

1. Ve a Table Editor → games
2. Deberías ver 20 juegos nuevos
3. Todos con `links = null`

## ✅ Verificación de Instalación

### Checklist:

- [ ] Tabla `games` creada en Supabase
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Variables de entorno configuradas en Vercel
- [ ] Proyecto desplegado en Vercel
- [ ] Cron job visible en Vercel Settings
- [ ] Prueba manual ejecutada exitosamente
- [ ] Juegos visibles en Supabase

## 🎯 Próximos Pasos

1. **Esperar 24 horas** para que el cron se ejecute automáticamente
2. **Agregar links** a los juegos en Supabase
3. **Verificar** que los juegos aparezcan en tu web

## 🔍 Verificar que Todo Funciona

### En Supabase (SQL Editor):

```sql
-- Ver estadísticas
SELECT 
  COUNT(*) as total,
  COUNT(links) as con_link,
  COUNT(*) - COUNT(links) as sin_link
FROM games;

-- Ver últimos juegos agregados
SELECT * FROM games 
ORDER BY created_at DESC 
LIMIT 10;
```

### En tu Web:

1. Abre tu sitio web
2. Los juegos SIN link NO deberían aparecer
3. Solo verás juegos que tengan `links` configurado

## 🚨 Solución de Problemas

### Error: "Table games does not exist"
✅ Ejecuta `scripts/init-database.sql` en Supabase

### Error: "Unauthorized" al probar el cron
✅ Verifica que `CRON_SECRET` esté configurado correctamente

### Los juegos no aparecen en la web
✅ Asegúrate de agregar `links` a los juegos en Supabase

### El cron no se ejecuta
✅ Verifica que `vercel.json` esté en la raíz del proyecto
✅ Asegúrate de haber hecho push a Vercel

## 📚 Documentación Adicional

- `SISTEMA_AUTOMATICO.md` - Documentación técnica completa
- `GUIA_RAPIDA_ADMIN.md` - Guía de administración diaria
- `scripts/manage-games.sql` - Queries útiles para administración

## 💡 Tips Finales

1. El cron se ejecuta **cada 24 horas a medianoche UTC**
2. Puedes cambiar la frecuencia en `vercel.json`
3. Los juegos se insertan sin duplicados automáticamente
4. Solo los juegos con `links` se muestran en la web
5. Puedes probar manualmente con `/api/test-cron`

## 🎉 ¡Listo!

Tu sistema automático está configurado y funcionando. Ahora solo necesitas:
1. Esperar que el cron agregue juegos
2. Agregar los links de descarga
3. ¡Disfrutar de tu web actualizada automáticamente!
