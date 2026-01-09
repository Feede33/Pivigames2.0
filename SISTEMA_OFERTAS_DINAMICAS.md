# Sistema de Ofertas Dinámicas con Links de Descarga

## Descripción General
Sistema completo para mostrar ofertas de Steam con precios regionales y permitir descargas solo para juegos que tengan links disponibles.

## Arquitectura

### 1. Base de Datos (Supabase)

#### Tabla `steam_specials`
```sql
- id: BIGSERIAL PRIMARY KEY
- steam_appid: TEXT UNIQUE (ID del juego en Steam)
- links: TEXT (Link de descarga, NULL si no disponible)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Propósito:** Almacenar qué juegos en oferta tienen links de descarga disponibles.

### 2. Cron Jobs

#### `/api/cron/sync-specials`
**Frecuencia:** Cada 6 horas (0 */6 * * *)

**Función:**
1. Obtiene ofertas actuales de Steam API
2. Sincroniza con tabla `steam_specials` en Supabase
3. Elimina ofertas expiradas
4. Inserta nuevas ofertas (sin link por defecto)
5. Actualiza timestamps de ofertas existentes

**Resultado:** Base de datos siempre actualizada con ofertas vigentes de Steam.

### 3. Flujo de Funcionamiento

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CRON JOB (Cada 6 horas)                                  │
│    - Obtiene ofertas de Steam                                │
│    - Sincroniza con Supabase                                 │
│    - Elimina ofertas expiradas                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. USUARIO ENTRA A LA PÁGINA                                │
│    - Se detecta su país por IP                               │
│    - Se obtienen ofertas de Steam API (precios regionales)   │
│    - Se consulta Supabase para verificar links              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. VISUALIZACIÓN                                             │
│    - Ofertas con link: Badge "Disponible" (azul)            │
│    - Ofertas sin link: Solo información                      │
│    - Click: Abre modal con detalles completos                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. MODAL DE JUEGO                                            │
│    - Si tiene link: Botón "Descargar"                        │
│    - Si no tiene link: Botón "Ver en Steam"                  │
└─────────────────────────────────────────────────────────────┘
```

## Características Implementadas

### ✅ Ofertas Dinámicas
- Las ofertas se actualizan automáticamente cada 6 horas
- Solo se muestran juegos que están actualmente en oferta en Steam
- Ofertas expiradas se eliminan automáticamente

### ✅ Precios Regionales
- Cada usuario ve precios en su moneda local
- Detección automática por IP
- Soporta 20+ países y monedas

### ✅ Sistema de Links
- Solo ofertas con link en Supabase pueden descargarse
- Badge visual "Disponible" para ofertas descargables
- Administrador puede agregar/quitar links manualmente

### ✅ Interfaz Intuitiva
- Cards grandes (460×215px) con portadas de Steam
- Badge de descuento (-X%)
- Badge de disponibilidad (azul)
- Indicadores de plataforma
- Hover effects

## Gestión de Links de Descarga

### Agregar Link a una Oferta

**Opción 1: SQL Directo**
```sql
UPDATE steam_specials 
SET links = 'https://tu-link-de-descarga.com'
WHERE steam_appid = '730';
```

**Opción 2: Desde la Aplicación** (futuro)
- Panel de administración
- Interfaz para gestionar links

### Verificar Ofertas con Links
```sql
SELECT steam_appid, links 
FROM steam_specials 
WHERE links IS NOT NULL;
```

### Eliminar Link de una Oferta
```sql
UPDATE steam_specials 
SET links = NULL
WHERE steam_appid = '730';
```

## Ventajas del Sistema

### 🎯 Dinámico
- No necesitas actualizar manualmente las ofertas
- Se sincroniza automáticamente con Steam
- Ofertas siempre actuales

### 🔒 Controlado
- Tú decides qué ofertas tienen link de descarga
- No todos los juegos en oferta son descargables
- Control total sobre el contenido

### 💰 Precios Reales
- Usuarios ven precios de su región
- Información actualizada de Steam
- Descuentos reales

### 📊 Escalable
- Fácil agregar más ofertas
- Sistema automático de limpieza
- Performance optimizada

## Configuración Inicial

### 1. Crear Tabla en Supabase
Ejecuta el script: `scripts/create-specials-table.sql`

### 2. Configurar Cron Job
Ya está configurado en `vercel.json`:
```json
{
  "path": "/api/cron/sync-specials",
  "schedule": "0 */6 * * *"
}
```

### 3. Primera Sincronización
Ejecuta manualmente el cron:
```bash
curl -X GET https://tu-dominio.vercel.app/api/cron/sync-specials \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

### 4. Agregar Links
Usa SQL o interfaz de Supabase para agregar links a las ofertas que desees.

## Monitoreo

### Ver Ofertas Actuales
```sql
SELECT 
  steam_appid,
  CASE WHEN links IS NOT NULL THEN 'Con link' ELSE 'Sin link' END as estado,
  updated_at
FROM steam_specials
ORDER BY updated_at DESC;
```

### Estadísticas
```sql
SELECT 
  COUNT(*) as total_ofertas,
  COUNT(links) as con_link,
  COUNT(*) - COUNT(links) as sin_link
FROM steam_specials;
```

## Próximas Mejoras

- [ ] Panel de administración para gestionar links
- [ ] Notificaciones cuando hay nuevas ofertas
- [ ] Historial de precios
- [ ] Alertas de precio deseado
- [ ] Sistema de favoritos
- [ ] Comparador de precios entre regiones

## Notas Técnicas

- **Cache:** Ofertas de Steam se cachean 30 minutos
- **Sincronización:** Cada 6 horas (configurable)
- **Límite:** 20 ofertas por página (configurable)
- **Fallback:** Si falla geolocalización, usa 'us' por defecto
