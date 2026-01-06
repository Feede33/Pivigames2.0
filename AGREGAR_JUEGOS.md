# Cómo Agregar Juegos

## Estructura Simplificada

La base de datos ahora solo almacena:
- `steam_appid`: ID del juego en Steam (obligatorio)
- `links`: Link de descarga del juego (opcional)

**Toda la información del juego (título, descripción, imágenes, requisitos, etc.) se obtiene automáticamente de la API de Steam.**

## Cómo Encontrar el Steam App ID

1. Ve a la página del juego en Steam
2. Mira la URL, por ejemplo: `https://store.steampowered.com/app/1091500/Cyberpunk_2077/`
3. El número después de `/app/` es el Steam App ID (en este caso: `1091500`)

## Agregar un Juego Nuevo

### Opción 1: Usando SQL en Supabase

```sql
INSERT INTO games (steam_appid, links) 
VALUES ('1091500', 'https://tu-link-de-descarga.com');
```

### Opción 2: Usando la API de Supabase

```typescript
import { supabase } from '@/lib/supabase';

await supabase
  .from('games')
  .insert({
    steam_appid: '1091500',
    links: 'https://tu-link-de-descarga.com'
  });
```

## Ejemplos de Juegos Populares

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

## Ventajas de Este Sistema

✅ **Datos siempre actualizados**: Precios, descripciones y capturas se obtienen en tiempo real de Steam
✅ **Base de datos ligera**: Solo almacenas 2 campos por juego
✅ **Fácil mantenimiento**: No necesitas actualizar manualmente la información de los juegos
✅ **Información completa**: Obtienes automáticamente screenshots, videos, requisitos del sistema, etc.
