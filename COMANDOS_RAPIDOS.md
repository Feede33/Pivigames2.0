# ⚡ Comandos Rápidos

## 🚀 Despliegue

```bash
# Desplegar todo el sistema
git add .
git commit -m "Add automatic game fetching system"
git push
```

## 🧪 Testing

```bash
# Probar el sistema (más fácil)
curl https://tu-dominio.vercel.app/api/test-cron

# Probar el cron directamente
curl -X GET https://tu-dominio.vercel.app/api/cron/fetch-games \
  -H "Authorization: Bearer pivigames_secret_2026"

# Desarrollo local
curl -X GET http://localhost:3000/api/cron/fetch-games \
  -H "Authorization: Bearer pivigames_secret_2026"
```

## 📊 Queries SQL Rápidas

```sql
-- Ver estadísticas
SELECT 
  COUNT(*) as total,
  COUNT(links) as visibles,
  COUNT(*) - COUNT(links) as ocultos
FROM games;

-- Ver últimos juegos
SELECT * FROM games 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver juegos sin link
SELECT id, steam_appid, created_at 
FROM games 
WHERE links IS NULL 
ORDER BY created_at DESC;

-- Agregar link a un juego
UPDATE games 
SET links = 'https://mega.nz/file/abc123' 
WHERE steam_appid = '730';

-- Agregar links a varios juegos
UPDATE games 
SET links = CASE steam_appid
  WHEN '730' THEN 'https://link1.com'
  WHEN '570' THEN 'https://link2.com'
  WHEN '440' THEN 'https://link3.com'
END
WHERE steam_appid IN ('730', '570', '440');

-- Eliminar juegos antiguos sin link
DELETE FROM games 
WHERE links IS NULL 
AND created_at < NOW() - INTERVAL '30 days';
```

## 🔧 Configuración Rápida

```bash
# Agregar variable de entorno en .env.local
echo "CRON_SECRET=pivigames_secret_2026" >> .env.local

# Ver variables de entorno
cat .env.local

# Verificar que vercel.json existe
cat vercel.json
```

## 📁 Navegación de Archivos

```bash
# Ver estructura del proyecto
tree --yess -L 3

# Ver archivos de documentación
ls --yess/*.md

# Ver scripts SQL
ls --yess/scripts/*.sql

# Ver APIs
ls --yess/src/app/api/*/route.ts
```

## 🔍 Verificación Rápida

```bash
# Verificar que los archivos existen
test -f --yess/vercel.json && echo "✅ vercel.json" || echo "❌ vercel.json"
test -f --yess/src/app/api/cron/fetch-games/route.ts && echo "✅ Cron API" || echo "❌ Cron API"
test -f --yess/scripts/init-database.sql && echo "✅ Init SQL" || echo "❌ Init SQL"

# Verificar variables de entorno
grep -q "CRON_SECRET" --yess/.env.local && echo "✅ CRON_SECRET" || echo "❌ CRON_SECRET"
```

## 📝 Logs y Monitoreo

```bash
# Ver logs en Vercel (desde CLI)
vercel logs --yess

# Ver últimos deployments
vercel ls --yess

# Ver información del proyecto
vercel inspect --yess
```

## 🗄️ Supabase CLI (Opcional)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Ver proyectos
supabase projects list

# Ejecutar migrations
supabase db push
```

## 🔄 Mantenimiento

```bash
# Backup de la base de datos (desde Supabase Dashboard)
# Settings → Database → Backups → Download

# Limpiar node_modules
rm -rf --yess/node_modules
cd --yess && npm install

# Limpiar .next
rm -rf --yess/.next
cd --yess && npm run build
```

## 📊 Estadísticas Rápidas

```sql
-- Dashboard completo
SELECT 
  'Total Juegos' as metrica,
  COUNT(*)::text as valor
FROM games
UNION ALL
SELECT 
  'Con Link (Visibles)',
  COUNT(*)::text
FROM games WHERE links IS NOT NULL
UNION ALL
SELECT 
  'Sin Link (Ocultos)',
  COUNT(*)::text
FROM games WHERE links IS NULL
UNION ALL
SELECT 
  'Agregados Hoy',
  COUNT(*)::text
FROM games WHERE DATE(created_at) = CURRENT_DATE
UNION ALL
SELECT 
  'Agregados Esta Semana',
  COUNT(*)::text
FROM games WHERE created_at > NOW() - INTERVAL '7 days';
```

## 🎯 Workflow Diario

```bash
# 1. Ver juegos nuevos
# En Supabase SQL Editor:
SELECT * FROM games WHERE links IS NULL ORDER BY created_at DESC LIMIT 20;

# 2. Agregar links (ejemplo)
UPDATE games SET links = 'https://...' WHERE steam_appid = '730';

# 3. Verificar en la web
# Abrir: https://tu-dominio.vercel.app

# 4. Ver estadísticas
SELECT COUNT(*) as total, COUNT(links) as visibles FROM games;
```

## 🚨 Troubleshooting Rápido

```bash
# Ver logs del cron en Vercel
# Dashboard → Functions → /api/cron/fetch-games

# Probar conexión a Supabase
curl https://ktakrkxxyezczbogmuiq.supabase.co/rest/v1/games \
  -H "apikey: tu_anon_key"

# Verificar que el cron está configurado
cat --yess/vercel.json

# Ver errores en desarrollo
cd --yess && npm run dev
# Abrir: http://localhost:3000
```

## 📚 Documentación Rápida

```bash
# Ver documentación principal
cat --yess/README_SISTEMA_AUTOMATICO.md

# Ver guía de instalación
cat --yess/PASOS_INSTALACION.md

# Ver guía de administración
cat --yess/GUIA_RAPIDA_ADMIN.md

# Ver queries útiles
cat --yess/scripts/manage-games.sql
```

## 🔐 Seguridad

```bash
# Cambiar CRON_SECRET
# 1. Generar nuevo secret
openssl rand -base64 32

# 2. Actualizar en .env.local
# CRON_SECRET=nuevo_secret_aqui

# 3. Actualizar en Vercel
# Settings → Environment Variables → CRON_SECRET

# 4. Redeploy
git commit --allow-empty -m "Update CRON_SECRET"
git push
```

## 💡 Tips Útiles

```bash
# Ver tamaño de la base de datos
# En Supabase: Settings → Database → Database Size

# Exportar juegos a CSV
# En Supabase: Table Editor → games → Export → CSV

# Importar juegos desde CSV
# En Supabase: Table Editor → games → Import → CSV

# Ver uso de API
# En Supabase: Settings → API → API Usage
```

## 🎉 Comandos de Celebración

```bash
# Cuando todo funciona:
echo "🎮 Sistema automático funcionando perfectamente!"
echo "✅ Cron ejecutándose cada 24 horas"
echo "✅ Juegos filtrándose correctamente"
echo "✅ Web actualizada automáticamente"
```

---

**Guarda este archivo para referencia rápida! 📌**
