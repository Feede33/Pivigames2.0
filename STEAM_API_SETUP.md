# Steam API Integration

## Configuración

### 1. Agregar Steam API Key
Ya agregaste tu Steam API key en `.env.local`:
```env
STEAM_API_KEY=TU_STEAM_API_KEY_AQUI
```

### 2. Actualizar la base de datos
Ejecuta el script SQL en Supabase:
```bash
# Copia el contenido de supabase-add-steam-appid.sql
# y ejecútalo en el SQL Editor de Supabase
```

### 3. Agregar Steam App IDs a tus juegos
Actualiza tus juegos en Supabase con el `steam_appid`:

```sql
-- Ejemplo: Counter-Strike 2
UPDATE games 
SET steam_appid = '730' 
WHERE title = 'Counter-Strike 2';

-- Ejemplo: Dota 2
UPDATE games 
SET steam_appid = '570' 
WHERE title = 'Dota 2';

-- Ejemplo: GTA V
UPDATE games 
SET steam_appid = '271590' 
WHERE title = 'Grand Theft Auto V';
```

## Cómo encontrar Steam App IDs

### Método 1: Desde la URL de Steam
Visita la página del juego en Steam Store:
```
https://store.steampowered.com/app/730/CounterStrike_2/
                                    ^^^
                                    Este es el App ID
```

### Método 2: Usando SteamDB
1. Ve a https://steamdb.info/
2. Busca el juego
3. El App ID aparece en la página

### Método 3: API de búsqueda
```bash
# Buscar por nombre (no oficial, pero funciona)
curl "https://store.steampowered.com/api/storesearch/?term=counter-strike&l=spanish&cc=US"
```

## Juegos populares con sus App IDs

| Juego | App ID |
|-------|--------|
| Counter-Strike 2 | 730 |
| Dota 2 | 570 |
| GTA V | 271590 |
| Red Dead Redemption 2 | 1174180 |
| Cyberpunk 2077 | 1091500 |
| The Witcher 3 | 292030 |
| Elden Ring | 1245620 |
| Baldur's Gate 3 | 1086940 |
| Hogwarts Legacy | 990080 |
| Starfield | 1716740 |

## Qué datos obtienes de Steam

Cuando agregas un `steam_appid` a un juego, el modal automáticamente carga:

### Screenshots ✅
- Imágenes en alta resolución
- Thumbnails optimizados
- Galería completa del juego

### Videos/Trailers ✅
- Trailers oficiales
- Videos de gameplay
- Múltiples calidades (480p, 1080p, etc.)
- Formatos WebM y MP4

### Información del juego ✅
- **Géneros**: Action, RPG, Strategy, etc.
- **Categorías/Tags**: Single-player, Multiplayer, Co-op, etc.
- **Desarrollador**: Nombre del estudio
- **Publisher**: Nombre del publicador
- **Fecha de lanzamiento**: Fecha oficial
- **Rating Metacritic**: Score de críticos (si existe)
- **Precio**: Precio actual o "Free"

### Plataformas ✅
- Windows 🪟
- Mac 🍎
- Linux 🐧

### Idiomas ✅
- Lista completa de idiomas soportados
- Interface, audio, subtítulos

### Requisitos del sistema ✅
- Requisitos mínimos
- Requisitos recomendados
- Formateados automáticamente

### Otros datos disponibles (no implementados aún)
- Descuentos actuales
- Reviews de usuarios
- DLCs disponibles
- Logros

## Uso en el código

El `GameModal` automáticamente detecta si un juego tiene `steam_appid` y carga los datos:

```typescript
// En tu base de datos
{
  id: 1,
  title: "Counter-Strike 2",
  steam_appid: "730",  // ← Agrega esto
  // ... otros campos
}
```

El modal mostrará:
- ✓ Indicador verde cuando los datos de Steam se carguen
- Screenshots de Steam en lugar de las locales
- Videos/trailers de Steam

## Fallbacks

Si no hay `steam_appid` o falla la carga:
- Usa las screenshots del campo `screenshots` de tu DB
- Usa el trailer del campo `trailer` de tu DB
- Usa el `wallpaper` como última opción

## API Endpoint

Endpoint creado: `/api/steam/[appid]`

Ejemplo de uso:
```typescript
const response = await fetch('/api/steam/730');
const data = await response.json();

// Retorna:
{
  appid: 730,
  name: "Counter-Strike 2",
  screenshots: [...],
  videos: [...],
  header_image: "...",
  background: "...",
  genres: ["Action", "FPS"],
  categories: ["Multi-player", "Online Co-Op", "Steam Achievements"],
  languages: ["English", "Spanish", "French", ...],
  platforms: { windows: true, mac: true, linux: true },
  developers: ["Valve"],
  publishers: ["Valve"],
  release_date: "Sep 27, 2023",
  metacritic: 81,
  pc_requirements: {
    minimum: "OS: Windows 10\nCPU: Intel Core i5...",
    recommended: "OS: Windows 10\nCPU: Intel Core i7..."
  },
  price: "Free",
  is_free: true
}
```

## Notas importantes

1. **No requiere Steam API Key**: Usamos la API pública de Steam Store que no requiere autenticación
2. **Cache**: Los datos se cachean por 1 hora para mejorar performance
3. **Idioma**: Los datos se obtienen en español (`l=spanish`)
4. **Rate Limits**: Steam tiene límites, pero son generosos para uso normal

## Próximos pasos sugeridos

1. Agregar selector de videos (si hay múltiples trailers)
2. Mostrar precio y descuentos de Steam
3. Sincronizar requisitos del sistema desde Steam
4. Agregar botón "Ver en Steam" con link directo
5. Mostrar reviews/ratings de Steam
