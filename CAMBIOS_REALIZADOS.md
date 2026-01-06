# Cambios Realizados - Sistema Simplificado con Steam API

## 🎯 Objetivo
Simplificar la base de datos para que solo almacene el `steam_appid` y el link de descarga. Toda la información del juego (título, descripción, imágenes, requisitos, etc.) se obtiene automáticamente de la API de Steam.

## 📊 Cambios en la Base de Datos

### Migración Aplicada
Se eliminaron las siguientes columnas de la tabla `games`:
- ❌ `title` (ahora viene de Steam)
- ❌ `genre` (ahora viene de Steam)
- ❌ `image` (ahora viene de Steam)
- ❌ `cover_image` (ahora viene de Steam)
- ❌ `rating` (ahora viene de Steam)
- ❌ `wallpaper` (ahora viene de Steam)
- ❌ `description` (ahora viene de Steam)
- ❌ `trailer` (ahora viene de Steam)
- ❌ `screenshots` (ahora viene de Steam)
- ❌ `min_os`, `min_cpu`, `min_ram`, `min_gpu`, `min_storage` (ahora viene de Steam)
- ❌ `rec_os`, `rec_cpu`, `rec_ram`, `rec_gpu`, `rec_storage` (ahora viene de Steam)

### Estructura Final
La tabla `games` ahora solo tiene:
- ✅ `id` (auto-incremento)
- ✅ `steam_appid` (obligatorio, único)
- ✅ `links` (opcional - link de descarga)
- ✅ `created_at` (timestamp)
- ✅ `updated_at` (timestamp)

## 🔧 Cambios en el Código

### 1. `src/lib/supabase.ts`
- Actualizado el tipo `Game` para reflejar la nueva estructura simplificada
- Creado nuevo tipo `GameWithSteamData` que incluye los datos de Steam
- Modificada la función `getGames()` para obtener datos de Steam automáticamente
- Modificada la función `getGameById()` para obtener datos de Steam
- Eliminadas funciones `searchGames()` y `getGamesByGenre()` (ya no son necesarias)

### 2. `src/app/page.tsx`
- Actualizado para usar `GameWithSteamData` en lugar de `Game`
- Los juegos ahora se cargan con toda la información de Steam incluida

### 3. `src/components/GameModal.tsx`
- Actualizado para usar `GameWithSteamData`
- Eliminadas referencias a campos que ya no existen en la DB
- Los requisitos del sistema ahora solo vienen de Steam API

## 📝 Archivos Nuevos Creados

### 1. `AGREGAR_JUEGOS.md`
Documentación completa sobre:
- Cómo encontrar el Steam App ID
- Cómo agregar juegos nuevos
- Ejemplos de juegos populares con sus App IDs
- Ventajas del nuevo sistema

### 2. `scripts/add-game.sql`
Script SQL con ejemplos para agregar juegos fácilmente:
- 10 juegos populares pre-configurados
- Solo necesitas cambiar el link de descarga

## ✅ Ventajas del Nuevo Sistema

1. **Datos Siempre Actualizados**: Precios, descripciones y capturas se obtienen en tiempo real
2. **Base de Datos Ligera**: Solo 2 campos por juego (steam_appid + links)
3. **Fácil Mantenimiento**: No necesitas actualizar manualmente la información
4. **Información Completa**: Screenshots, videos, requisitos del sistema, etc. automáticos
5. **Precios Regionales**: Los precios se muestran en la moneda del usuario
6. **Multilenguaje**: La información viene en el idioma configurado (español)

## 🚀 Cómo Agregar un Juego Nuevo

```sql
INSERT INTO games (steam_appid, links) 
VALUES ('1091500', 'https://tu-link-de-descarga.com');
```

¡Eso es todo! El resto se obtiene automáticamente de Steam.

## 🔍 Datos Actuales en la DB

Actualmente hay 2 juegos:
- Cyberpunk 2077 (steam_appid: 1091500)
- Elden Ring (steam_appid: 1214650)

## 🎮 API de Steam

La ruta `/api/steam/[appid]` ya está implementada y devuelve:
- Información básica (nombre, descripción, desarrollador, etc.)
- Screenshots y videos
- Requisitos del sistema
- Precios regionales
- Géneros y categorías
- Plataformas soportadas
- Idiomas disponibles
- Y mucho más...

## ⚠️ Notas Importantes

- La API de Steam tiene un límite de rate limiting, pero con el cache de 1 hora debería ser suficiente
- Los precios se muestran en la moneda del país del usuario (detectado por geolocalización)
- Si un juego no está en Steam, no se podrá agregar con este sistema
