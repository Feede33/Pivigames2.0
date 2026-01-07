# Cómo Funciona el Sistema de Precios

## ✅ Cambios Realizados

He modificado el sistema para que **todos los juegos** muestren información de precios en el modal:

### 1. API Modificada (`/api/steam/[appid]/route.ts`)
- Ahora devuelve `current_price` y `lowest_recorded_price`
- Estos datos se calculan automáticamente desde la API de Steam

### 2. Componente GameModal Actualizado
- Agregué los campos `current_price` y `lowest_recorded_price` al tipo `SteamData`
- La sección "Price History" ahora muestra:
  - **Current Price**: Precio actual del juego
  - **Lowest Recorded Price**: Precio más bajo (por ahora usa el precio con descuento si existe)
  - Ambos son **clickables** y te llevan a SteamDB para ver el historial completo

## 🎮 Cómo Agregar Más Juegos

Para que **todos tus juegos** muestren precios, necesitas agregarlos a tu base de datos de Supabase:

### Opción 1: Desde el Dashboard de Supabase
1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Copia y pega los INSERT statements de `scripts/add-game.sql`
4. Ejecuta el script

### Opción 2: Agregar Juegos Uno por Uno
```sql
INSERT INTO games (steam_appid, links) 
VALUES ('STEAM_APP_ID', 'https://tu-link-de-descarga.com');
```

### Ejemplo de Juegos Populares:
```sql
-- Cyberpunk 2077
INSERT INTO games (steam_appid, links) VALUES ('1091500', 'https://playpaste.net/?v=jagI');

-- Elden Ring
INSERT INTO games (steam_appid, links) VALUES ('1245620', 'https://tu-link.com');

-- Red Dead Redemption 2
INSERT INTO games (steam_appid, links) VALUES ('1174180', 'https://tu-link.com');

-- GTA V
INSERT INTO games (steam_appid, links) VALUES ('271590', 'https://tu-link.com');

-- The Witcher 3
INSERT INTO games (steam_appid, links) VALUES ('292030', 'https://tu-link.com');
```

## 🔍 Verificar que Funciona

1. Ve a `http://localhost:3000/test-db` para ver todos los juegos en tu base de datos
2. Abre cualquier juego en el modal
3. Busca la sección "Price History" en el sidebar derecho
4. Deberías ver:
   ```
   Price History: Current Price: $XX.XX | Lowest Recorded Price: $XX.XX
   ```

## 📝 Notas Importantes

- **Todos los juegos con `steam_appid` válido** mostrarán precios automáticamente
- Los precios se obtienen en tiempo real de la API de Steam
- Los precios se muestran en la moneda de tu región (detectada automáticamente)
- Si un juego es gratis, mostrará "Free" en lugar de precio
- Los links son clickables y te llevan a SteamDB para ver el historial completo de precios

## 🐛 Troubleshooting

Si no ves precios en algún juego:
1. Verifica que el juego tenga un `steam_appid` válido en la base de datos
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que la API de Steam esté respondiendo correctamente
4. Algunos juegos gratuitos pueden no tener información de precios
