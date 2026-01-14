# Sistema de Autenticación Seguro con Perfiles Anónimos

## Descripción
Sistema de autenticación que protege la información sensible de los usuarios mediante perfiles anónimos con nicknames aleatorios y avatares generados.

## Problema Resuelto
- ❌ **Antes**: Datos de OAuth (nombre, email, avatar) expuestos en el frontend
- ✅ **Ahora**: Solo se expone nickname y avatar personalizable, sin datos sensibles

## Archivos Creados

### 1. Base de Datos
- **`supabase-user-profiles-migration.sql`**: 
  - Tabla `user_profiles` con nickname único y avatar
  - Función `generate_unique_nickname()` que genera nombres como "SwiftWarrior1234"
  - Trigger automático que crea perfil al registrarse
  - Políticas RLS para privacidad

### 2. Librería de Perfiles
- **`src/lib/user-profiles.ts`**:
  - `getCurrentUserProfile()`: Obtener perfil del usuario actual
  - `getUserProfile(userId)`: Obtener perfil de otro usuario
  - `updateNickname(newNickname)`: Cambiar nickname (con validación)
  - `updateAvatarUrl(avatarUrl)`: Cambiar avatar personalizado
  - `generateAvatarUrl(seed)`: Generar avatar con DiceBear API
  - `getUserAvatar(profile)`: Obtener URL del avatar (personalizado o generado)
  - `isNicknameAvailable(nickname)`: Verificar disponibilidad

### 3. Componente de Autenticación
- **`src/components/AuthProviderDialog.tsx`**:
  - Diálogo modal con opciones de Discord y Google
  - Diseño moderno con iconos y colores de marca
  - Estados de loading durante autenticación
  - No solicita permisos adicionales de OAuth

### 4. Integración en Comentarios
- **`src/components/GameModal/CommentSection.tsx`** actualizado:
  - Usa perfiles de usuario en lugar de datos de OAuth
  - Muestra nicknames y avatares generados
  - Botón "Iniciar sesión" abre diálogo de proveedores
  - Sin exposición de emails o nombres reales

## Generación de Nicknames

### Formato
`[Adjetivo][Sustantivo][Número]`

Ejemplos:
- `SwiftWarrior1234`
- `MysticMage5678`
- `CyberNinja9012`
- `GoldenKnight3456`

### Listas de Palabras
- **32 Adjetivos**: Swift, Brave, Clever, Mighty, Silent, Golden, Shadow, Cosmic, etc.
- **32 Sustantivos**: Warrior, Hunter, Mage, Rogue, Knight, Wizard, Ranger, Paladin, etc.
- **Números**: 0000-9999 (4 dígitos)

### Unicidad
- Verifica que el nickname no exista antes de asignarlo
- Si después de 100 intentos no encuentra uno único, agrega timestamp
- Garantiza que cada usuario tenga un nickname único

## Generación de Avatares

### DiceBear API
Usamos [DiceBear](https://www.dicebear.com/) para generar avatares SVG únicos:

```typescript
https://api.dicebear.com/7.x/avataaars/svg?seed={userId}
```

### Estilos Disponibles
- `avataaars`: Estilo Avataaars (por defecto)
- `bottts`: Robots
- `identicon`: Patrones geométricos
- `pixel-art`: Estilo pixel art
- `initials`: Iniciales del nickname

### Características
- Generados del lado del servidor (DiceBear)
- Consistentes (mismo seed = mismo avatar)
- Sin almacenamiento necesario
- Personalizables (usuario puede subir su propio avatar)

## Flujo de Autenticación

### 1. Usuario No Autenticado
```
Usuario → Click "Iniciar sesión" → Diálogo con opciones
       → Selecciona Discord/Google → OAuth redirect
       → Callback → Trigger crea perfil automáticamente
       → Nickname aleatorio asignado
       → Avatar generado con seed = userId
```

### 2. Perfil Creado Automáticamente
```sql
-- Trigger ejecuta al crear usuario
INSERT INTO user_profiles (id, nickname, avatar_seed)
VALUES (
  new_user_id,
  'SwiftWarrior1234',  -- Generado por función
  new_user_id          -- Seed para avatar
);
```

### 3. Usuario Puede Personalizar
- Cambiar nickname (debe ser único, 3-20 caracteres, solo letras/números/_)
- Subir avatar personalizado
- Mantener avatar generado

## Seguridad

### Datos NO Expuestos en Frontend
- ❌ Email del usuario
- ❌ Nombre real del proveedor OAuth
- ❌ Avatar original de Discord/Google
- ❌ Metadata de OAuth

### Datos Expuestos (Seguros)
- ✅ Nickname aleatorio/personalizado
- ✅ Avatar generado/personalizado
- ✅ ID de usuario (UUID, no identificable)
- ✅ Fechas de creación/actualización

### Validación de Nickname
```typescript
// Reglas de validación
- Mínimo 3 caracteres
- Máximo 20 caracteres
- Solo letras, números y guiones bajos
- Debe ser único en la base de datos
```

### Row Level Security (RLS)
```sql
-- Todos pueden ver perfiles públicos
SELECT * FROM user_profiles; -- ✅ Permitido

-- Solo el dueño puede actualizar su perfil
UPDATE user_profiles SET nickname = 'NewName' 
WHERE id = auth.uid(); -- ✅ Permitido

UPDATE user_profiles SET nickname = 'NewName' 
WHERE id = other_user_id; -- ❌ Bloqueado
```

## Próximos Pasos

### Página de Perfil
- Ver y editar nickname
- Cambiar avatar (subir imagen o elegir estilo)
- Ver estadísticas (comentarios, likes, etc.)
- Historial de actividad

### Moderación
- Reportar nicknames inapropiados
- Sistema de filtro de palabras prohibidas
- Forzar cambio de nickname por admin

### Gamificación
- Badges/insignias en perfil
- Niveles basados en actividad
- Avatares especiales desbloqueables

## Uso

### Para Desarrolladores

```typescript
// Obtener perfil del usuario actual
const profile = await getCurrentUserProfile();
console.log(profile.nickname); // "SwiftWarrior1234"

// Obtener avatar
const avatarUrl = getUserAvatar(profile);
// https://api.dicebear.com/7.x/avataaars/svg?seed=user-id

// Cambiar nickname
await updateNickname("MiNuevoNick");

// Verificar disponibilidad
const available = await isNicknameAvailable("TestNick");
```

### Para Usuarios

1. **Iniciar sesión**: Click en "Iniciar sesión" → Elegir Discord o Google
2. **Nickname automático**: Se asigna automáticamente (ej: "SwiftWarrior1234")
3. **Comentar**: Aparece con nickname y avatar generado
4. **Personalizar** (futuro): Ir a perfil → Cambiar nickname/avatar

## Ventajas del Sistema

### Privacidad
- No se expone información personal
- Usuario controla su identidad pública
- Cumple con GDPR y regulaciones de privacidad

### Seguridad
- No hay inyección de datos de OAuth en frontend
- RLS protege datos sensibles
- Validación estricta de nicknames

### Experiencia de Usuario
- Onboarding rápido (nickname automático)
- Personalización opcional
- Avatares únicos y atractivos

### Escalabilidad
- Avatares generados (no almacenamiento)
- Sistema de nicknames puede generar millones de combinaciones
- Fácil de extender con nuevas features
