# Sistema de Reportes de Comentarios

## Descripción
Sistema completo para reportar comentarios inapropiados con diferentes categorías de razones y almacenamiento en Supabase.

## Archivos Creados

### 1. Base de Datos
- **`supabase-comment-reports-migration.sql`**: Migración de Supabase que crea:
  - Tabla `comment_reports` con campos: id, comment_id, reporter_id, reason, details, status, timestamps
  - Índices para optimizar consultas
  - Políticas RLS para seguridad
  - Trigger para actualizar `updated_at` automáticamente
  - Constraint UNIQUE para evitar reportes duplicados

### 2. Librería
- **`src/lib/comment-reports.ts`**: Funciones para manejar reportes:
  - `createCommentReport()`: Crear un nuevo reporte
  - `hasUserReportedComment()`: Verificar si el usuario ya reportó
  - `getCommentReports()`: Obtener reportes de un comentario (admins)
  - `getPendingReports()`: Obtener reportes pendientes (admins)
  - `updateReportStatus()`: Actualizar estado de reporte (admins)

### 3. Componentes UI
- **`src/components/GameModal/ReportCommentDialog.tsx`**: Diálogo modal con:
  - 6 categorías de reportes predefinidas
  - Campo de texto para detalles adicionales
  - Validación y manejo de errores
  - Estados de loading

### 4. Integración
- **`src/components/GameModal/CommentSection.tsx`**: Actualizado para:
  - Mostrar "Eliminar" solo al dueño del comentario
  - Mostrar "Reportar" a otros usuarios
  - Integrar el diálogo de reportes
  - Manejar el envío de reportes

## Categorías de Reportes

1. **Spam o publicidad**: Contenido promocional no deseado
2. **Acoso o intimidación**: Comportamiento abusivo
3. **Discurso de odio**: Contenido que promueve odio
4. **Desinformación**: Información falsa o engañosa
5. **Contenido inapropiado**: Contenido sexual, violento o perturbador
6. **Otro**: Otras razones no listadas

## Características de Seguridad

- **RLS (Row Level Security)**: Los usuarios solo pueden ver sus propios reportes
- **Prevención de duplicados**: Un usuario no puede reportar el mismo comentario dos veces
- **Roles de admin**: Solo los admins pueden ver todos los reportes y cambiar su estado
- **Cascada de eliminación**: Si se elimina un comentario, se eliminan sus reportes

## Estados de Reportes

- `pending`: Reporte nuevo, esperando revisión
- `reviewed`: Reporte revisado por un admin
- `resolved`: Acción tomada, problema resuelto
- `dismissed`: Reporte descartado (no requiere acción)

## Uso

### Para Usuarios
1. Click en el menú de tres puntos (⋮) en cualquier comentario
2. Si es tu comentario: aparece "Eliminar"
3. Si es de otro usuario: aparece "Reportar"
4. Selecciona una razón y opcionalmente agrega detalles
5. Click en "Enviar reporte"

### Para Admins (Futuro)
- Panel de administración para ver reportes pendientes
- Capacidad de revisar y cambiar estado de reportes
- Ver historial de reportes por comentario o usuario

## Próximos Pasos

1. Crear panel de administración para gestionar reportes
2. Agregar notificaciones para admins cuando hay nuevos reportes
3. Implementar acciones automáticas (ej: ocultar comentario tras X reportes)
4. Agregar estadísticas de reportes
