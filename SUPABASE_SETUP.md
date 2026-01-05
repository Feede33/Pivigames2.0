# Configuración de Supabase

## Pasos para configurar Supabase

### 1. Crear un proyecto en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se inicialice (toma ~2 minutos)

### 2. Obtener las credenciales
1. Ve a **Settings** → **API**
2. Copia el **Project URL** (algo como `https://xxxxx.supabase.co`)
3. Copia el **anon/public key**

### 3. Configurar las variables de entorno
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza los valores:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

### 4. Crear la tabla en Supabase
1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Crea una nueva query
3. Copia y pega todo el contenido del archivo `supabase-schema.sql`
4. Ejecuta la query (botón **Run**)

### 5. Verificar la tabla
1. Ve a **Table Editor**
2. Deberías ver la tabla `games` con un registro de ejemplo
3. Puedes agregar más juegos manualmente o mediante la API

## Estructura de la tabla `games`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | ID único (auto-incrementa) |
| title | text | Nombre del juego |
| genre | text | Género (Action, Adventure, Sports, etc.) |
| image | text | URL de la imagen de portada |
| rating | decimal | Calificación (0-10) |
| wallpaper | text | URL del wallpaper/fondo |
| description | text | Descripción del juego |
| trailer | text | URL del trailer de YouTube |
| links | text | Link único de descarga (Mediafire, Mega, GDrive, etc.) |
| screenshots | text[] | Array de URLs de screenshots |
| created_at | timestamptz | Fecha de creación |
| updated_at | timestamptz | Fecha de actualización |

## Uso en el código

```typescript
import { getGames, searchGames, getGamesByGenre } from '@/lib/supabase';

// Obtener todos los juegos
const games = await getGames();

// Buscar juegos
const results = await searchGames('south park');

// Obtener por género
const actionGames = await getGamesByGenre('Action');
```

## Agregar juegos manualmente

Puedes agregar juegos desde el **Table Editor** de Supabase o usando SQL:

```sql
INSERT INTO games (title, genre, image, rating, wallpaper, description, trailer, links, screenshots)
VALUES (
  'Nombre del Juego',
  'Action',
  'https://url-imagen.jpg',
  8.5,
  'https://url-wallpaper.jpg',
  'Descripción del juego...',
  'https://youtube.com/watch?v=xxxxx',
  'https://mediafire.com/file/xxxxx',
  ARRAY['https://screenshot1.jpg', 'https://screenshot2.jpg']
);
```

## Seguridad

- La tabla tiene **Row Level Security (RLS)** habilitado
- Lectura pública permitida (cualquiera puede ver los juegos)
- Para permitir escritura, descomenta la política en `supabase-schema.sql`
