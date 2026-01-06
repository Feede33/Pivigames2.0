# 🎮 Sistema de Juegos con Steam API

## 📋 Resumen

Este proyecto utiliza un sistema simplificado donde la base de datos solo almacena el **Steam App ID** y el **link de descarga**. Toda la información del juego se obtiene automáticamente de la API de Steam.

## 🗄️ Estructura de la Base de Datos

```
Tabla: games
├── id (bigint) - Auto-incremento
├── steam_appid (text) - ID del juego en Steam [OBLIGATORIO, ÚNICO]
└── links (text) - Link de descarga [OPCIONAL]
```

## 🔄 Flujo de Datos

```
1. Usuario visita la página
   ↓
2. Se obtienen los steam_appid de la DB
   ↓
3. Para cada juego, se consulta la API de Steam
   ↓
4. Se obtiene automáticamente:
   - Título, descripción, imágenes
   - Screenshots, videos, trailers
   - Requisitos del sistema
   - Precio regional
   - Géneros, categorías
   - Desarrollador, publisher
   - Y mucho más...
   ↓
5. Se muestra todo en la interfaz
```

## ✅ Ventajas

| Antes | Ahora |
|-------|-------|
| 20+ campos en la DB | Solo 2 campos |
| Actualización manual | Actualización automática |
| Datos desactualizados | Datos en tiempo real |
| Sin precios regionales | Precios por país |
| Mantenimiento complejo | Mantenimiento simple |

## 🚀 Agregar un Juego

```sql
-- Solo necesitas esto:
INSERT INTO games (steam_appid, links) 
VALUES ('1091500', 'https://tu-link.com');

-- El resto es automático ✨
```

## 📊 Datos que se Obtienen Automáticamente

### Información Básica
- ✅ Nombre del juego
- ✅ Descripción corta y detallada
- ✅ Desarrollador y Publisher
- ✅ Fecha de lanzamiento
- ✅ Clasificación por edad

### Multimedia
- ✅ Imagen de cabecera
- ✅ Wallpaper/Background
- ✅ Screenshots (múltiples)
- ✅ Videos/Trailers

### Detalles Técnicos
- ✅ Requisitos mínimos del sistema
- ✅ Requisitos recomendados
- ✅ Plataformas (Windows, Mac, Linux)
- ✅ Idiomas soportados

### Clasificación
- ✅ Géneros
- ✅ Categorías/Tags
- ✅ Puntuación Metacritic

### Precio
- ✅ Precio base
- ✅ Precio con descuento
- ✅ Porcentaje de descuento
- ✅ Moneda regional (ARS, USD, EUR, etc.)
- ✅ Detección automática del país del usuario

## 🌍 Precios Regionales

El sistema detecta automáticamente el país del usuario y muestra el precio en su moneda local:

```javascript
// Ejemplo de respuesta de precio
{
  currency: "ARS",
  initial: 15999,
  final: 11999,
  discount_percent: 25,
  initial_formatted: "ARS$ 15.999",
  final_formatted: "ARS$ 11.999"
}
```

## 📁 Archivos Importantes

- `src/lib/supabase.ts` - Funciones para obtener juegos con datos de Steam
- `src/app/api/steam/[appid]/route.ts` - API que consulta Steam
- `src/app/api/geolocation/route.ts` - Detecta el país del usuario
- `scripts/add-game.sql` - Ejemplos para agregar juegos
- `AGREGAR_JUEGOS.md` - Documentación completa
- `INICIO_RAPIDO_JUEGOS.md` - Guía rápida

## 🎯 Juegos Populares (App IDs)

| Juego | Steam App ID |
|-------|--------------|
| Cyberpunk 2077 | 1091500 |
| Elden Ring | 1245620 |
| Red Dead Redemption 2 | 1174180 |
| GTA V | 271590 |
| The Witcher 3 | 292030 |
| Hogwarts Legacy | 990080 |
| Baldur's Gate 3 | 1086940 |
| Starfield | 1716740 |
| Spider-Man Remastered | 1817070 |
| God of War | 1593500 |

## 🔧 Configuración

Variables de entorno necesarias (`.env.local`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key

# Steam API (opcional, la API pública no requiere key)
STEAM_API_KEY=tu-key
```

## 📝 Notas

- La API de Steam tiene cache de 1 hora para optimizar rendimiento
- Los precios se actualizan automáticamente según las ofertas de Steam
- Si un juego no está en Steam, no se puede agregar con este sistema
- La geolocalización usa la API de ipapi.co (gratuita)

## 🆘 Soporte

Si tienes problemas:
1. Verifica que el Steam App ID sea correcto
2. Revisa la consola del navegador para errores
3. Asegúrate de que el juego esté disponible en Steam
4. Verifica que las variables de entorno estén configuradas

## 📚 Documentación Adicional

- [Steam Web API Documentation](https://partner.steamgames.com/doc/webapi)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
