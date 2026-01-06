# 🎮 Inicio Rápido - Agregar Juegos

## ¿Qué necesitas?

Solo 2 cosas:
1. **Steam App ID** del juego
2. **Link de descarga** (opcional)

## 🔍 Paso 1: Encontrar el Steam App ID

1. Ve a Steam: https://store.steampowered.com
2. Busca el juego que quieres agregar
3. Mira la URL, por ejemplo:
   ```
   https://store.steampowered.com/app/1091500/Cyberpunk_2077/
                                    ^^^^^^^^
                                    Este es el App ID
   ```

## ➕ Paso 2: Agregar el Juego

### Opción A: Desde Supabase Dashboard

1. Ve a tu proyecto en Supabase
2. Abre el SQL Editor
3. Ejecuta:
   ```sql
   INSERT INTO games (steam_appid, links) 
   VALUES ('1091500', 'https://tu-link-de-descarga.com');
   ```

### Opción B: Usar el Script Incluido

1. Abre el archivo `scripts/add-game.sql`
2. Copia uno de los ejemplos
3. Cambia el link de descarga
4. Ejecuta en Supabase

## 🎯 Ejemplos Rápidos

```sql
-- Cyberpunk 2077
INSERT INTO games (steam_appid, links) 
VALUES ('1091500', 'https://playpaste.net/?v=jagI');

-- Elden Ring  
INSERT INTO games (steam_appid, links)
VALUES ('1245620', 'https://tu-link.com');

-- GTA V
INSERT INTO games (steam_appid, links)
VALUES ('271590', 'https://tu-link.com');

-- The Witcher 3
INSERT INTO games (steam_appid, links)
VALUES ('292030', 'https://tu-link.com');
```

## ✨ ¡Eso es Todo!

El sistema automáticamente obtendrá:
- ✅ Título del juego
- ✅ Descripción
- ✅ Imágenes y wallpapers
- ✅ Screenshots
- ✅ Videos/Trailers
- ✅ Requisitos del sistema
- ✅ Precio (en la moneda del usuario)
- ✅ Géneros y categorías
- ✅ Desarrollador y publisher
- ✅ Fecha de lanzamiento
- ✅ Y mucho más...

## 🌍 Precios Regionales

Los precios se muestran automáticamente en la moneda del país del usuario:
- 🇦🇷 Argentina → ARS
- 🇺🇸 USA → USD
- 🇪🇸 España → EUR
- 🇧🇷 Brasil → BRL
- etc.

## 📚 Más Información

- Ver `AGREGAR_JUEGOS.md` para documentación completa
- Ver `scripts/add-game.sql` para más ejemplos
- Ver `CAMBIOS_REALIZADOS.md` para detalles técnicos
