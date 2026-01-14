# Sistema de Comentarios - Configuración

## 1. Ejecutar la migración en Supabase

### Si ya tienes la tabla `comments` creada:

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `supabase-comments-update.sql`
4. Ejecuta el script

### Si es una instalación nueva:

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `supabase-comments-migration.sql`
4. Ejecuta el script

Esto creará/actualizará:
- Tabla `comments` con campo `game_id`
- Tabla `comment_likes`
- Índices para mejor performance
- Políticas RLS (Row Level Security)
- Trigger para actualizar `updated_at` automáticamente

## 2. Configurar autenticación con Discord

1. Ve a **Authentication > Providers** en Supabase
2. Habilita **Discord** como provider
3. Configura las credenciales de Discord:
   - Ve a https://discord.com/developers/applications
   - Crea una nueva aplicación o usa una existente
   - En **OAuth2**, agrega la URL de callback de Supabase:
     ```
     https://[TU-PROJECT-REF].supabase.co/auth/v1/callback
     ```
   - Copia el **Client ID** y **Client Secret**
   - Pégalos en la configuración de Discord en Supabase

## 3. Características implementadas

### ✅ Autenticación
- Solo usuarios autenticados con Discord pueden comentar
- Usuarios no autenticados ven un botón para iniciar sesión
- Avatar y nombre de Discord se muestran automáticamente

### ✅ Comentarios
- Crear comentarios principales
- Responder a comentarios (anidados)
- Eliminar propios comentarios
- Ver comentarios en tiempo real (actualización automática)

### ✅ Likes
- Dar/quitar like a comentarios
- Contador de likes
- Indicador visual de si el usuario ya dio like

### ✅ Seguridad
- RLS habilitado: usuarios solo pueden modificar sus propios comentarios
- Validación de autenticación en todas las operaciones
- Protección contra SQL injection

### ✅ UX
- Skeleton loaders mientras carga
- Tiempo relativo ("hace 2 días")
- Avatares de Discord
- Actualización en tiempo real con Supabase Realtime

## 4. Estructura de datos

### Tabla `comments`
```sql
- id: UUID (PK)
- user_id: UUID (FK a auth.users)
- game_id: INTEGER (ID del juego)
- content: TEXT (contenido del comentario)
- parent_id: UUID (FK a comments, para respuestas)
- likes: INTEGER (contador de likes)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabla `comment_likes`
```sql
- id: UUID (PK)
- comment_id: UUID (FK a comments)
- user_id: UUID (FK a auth.users)
- created_at: TIMESTAMP
- UNIQUE(comment_id, user_id) - Un usuario solo puede dar 1 like por comentario
```

## 5. Uso en el código

El componente `CommentSection` se usa así:

```tsx
<CommentSection gameId={game.id} />
```

El `gameId` debe ser el ID numérico del juego en tu base de datos.

## 6. Próximos pasos opcionales

- [ ] Agregar paginación para muchos comentarios
- [ ] Agregar edición de comentarios
- [ ] Agregar reportes de comentarios
- [ ] Agregar moderación
- [ ] Agregar notificaciones de respuestas
- [ ] Agregar menciones (@usuario)
- [ ] Agregar reacciones (emojis)
