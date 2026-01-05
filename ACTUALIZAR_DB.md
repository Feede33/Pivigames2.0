# Actualizar Base de Datos - Agregar columna LINKS

## Pasos para actualizar tu base de datos en Supabase

### 1. Ir al SQL Editor
1. Abre tu proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**

### 2. Ejecutar el script
1. Abre el archivo `supabase-add-links-column.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (o presiona Ctrl+Enter)

### 3. Verificar la columna
1. Ve a **Table Editor**
2. Selecciona la tabla `games`
3. Deberías ver la nueva columna `links`

### 4. Agregar links a tus juegos
Ahora puedes agregar el link de descarga único para cada juego:

**Opción A: Desde el Table Editor**
1. Ve a **Table Editor** → `games`
2. Haz clic en la fila del juego que quieres editar
3. En la columna `links`, pega el link de descarga
4. Guarda los cambios

**Opción B: Con SQL**
```sql
-- Actualizar un juego específico
UPDATE games 
SET links = 'https://mediafire.com/file/tu-archivo-aqui' 
WHERE id = 1;

-- Actualizar varios juegos
UPDATE games SET links = 'https://mega.nz/file/juego1' WHERE title = 'South Park';
UPDATE games SET links = 'https://drive.google.com/file/juego2' WHERE title = 'GTA V';
```

## Cómo funciona

- Cada juego tiene su propia columna `links` en la base de datos
- Cuando agregas un link en Supabase, ese link aparecerá automáticamente en el botón "Download" del modal
- Si un juego no tiene link, el botón de descarga no se mostrará
- Puedes usar cualquier servicio: Mediafire, Mega, Google Drive, Dropbox, etc.

## Ejemplo completo

```sql
-- Agregar un nuevo juego con su link
INSERT INTO games (
  title, 
  genre, 
  image, 
  rating, 
  wallpaper, 
  description, 
  trailer, 
  links,
  screenshots
)
VALUES (
  'Elden Ring',
  'Action RPG',
  'https://ejemplo.com/elden-ring-cover.jpg',
  9.5,
  'https://ejemplo.com/elden-ring-wallpaper.jpg',
  'Un juego épico de mundo abierto...',
  'https://youtube.com/watch?v=xxxxx',
  'https://mediafire.com/file/elden-ring-download',
  ARRAY[
    'https://ejemplo.com/screenshot1.jpg',
    'https://ejemplo.com/screenshot2.jpg'
  ]
);
```

## Notas importantes

✅ Cada juego tiene su propio link único
✅ El botón solo aparece si el juego tiene un link
✅ Puedes usar cualquier servicio de hosting de archivos
✅ El link se abre en una nueva pestaña cuando el usuario hace clic
