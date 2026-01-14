# 🚀 Página de Login Futurista

## Descripción
Sistema de login con diseño futurista cyberpunk, incluyendo login por email/contraseña y OAuth (Google/Discord).

## Archivos Creados

### 1. Componente de Botón Futurista
**`src/components/FuturisticLoginButton.tsx`**
- Botón con efectos de neón y animaciones
- Partículas flotantes de fondo
- Esquinas decorativas animadas
- Línea de escaneo
- Efectos de hover y click
- Redirecciona a `/login`

### 2. Página de Login
**`src/app/login/page.tsx`**
- Formulario de email/contraseña
- Botones de OAuth (Google y Discord)
- Fondo con gradiente cyberpunk
- Partículas animadas
- Manejo de errores
- Estados de loading
- Link a página de registro

### 3. Callback de OAuth
**`src/app/auth/callback/route.ts`**
- Maneja el redirect de OAuth
- Intercambia código por sesión
- Redirige a la página principal

## Características

### Diseño Futurista
- ✅ Gradiente cyberpunk (azul oscuro a morado)
- ✅ Partículas flotantes animadas
- ✅ Efectos de neón verde (#00ff88)
- ✅ Esquinas decorativas rosas (#ff0088)
- ✅ Línea de escaneo animada
- ✅ Efectos de hover suaves
- ✅ Backdrop blur en el card

### Funcionalidad
- ✅ Login con email/contraseña
- ✅ Login con Google OAuth
- ✅ Login con Discord OAuth
- ✅ Validación de formulario
- ✅ Manejo de errores
- ✅ Estados de loading
- ✅ Redirect después de login
- ✅ Link a "Olvidaste tu contraseña"
- ✅ Link a página de registro

## Uso

### Agregar el Botón en tu Página Principal

```tsx
import FuturisticLoginButton from '@/components/FuturisticLoginButton';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e27] via-[#1a1a2e] to-[#16213e]">
      <FuturisticLoginButton />
    </div>
  );
}
```

### Rutas

- **`/login`**: Página de login
- **`/auth/callback`**: Callback de OAuth (automático)
- **`/signup`**: Página de registro (por crear)

## Colores del Tema

```css
/* Fondo */
--bg-primary: #0a0e27
--bg-secondary: #1a1a2e
--bg-tertiary: #16213e

/* Acentos */
--accent-green: #00ff88  /* Neón verde */
--accent-pink: #ff0088   /* Neón rosa */

/* Texto */
--text-primary: #ffffff
--text-secondary: #9ca3af
```

## Animaciones

### Partículas Flotantes
```css
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  50% {
    transform: translateY(-100vh) translateX(50px);
    opacity: 0.3;
  }
}
```

### Pulso de Esquinas
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}
```

### Línea de Escaneo
```css
@keyframes scan {
  0% { top: 0; }
  100% { top: 100%; }
}
```

## Flujo de Autenticación

### Login con Email
```
Usuario → Ingresa email/contraseña → Submit
       → Supabase auth.signInWithPassword()
       → Éxito → Redirect a "/"
       → Error → Mostrar mensaje
```

### Login con OAuth
```
Usuario → Click "Continuar con Google/Discord"
       → Supabase auth.signInWithOAuth()
       → Redirect a proveedor OAuth
       → Usuario autoriza
       → Redirect a /auth/callback
       → Intercambio de código por sesión
       → Redirect a "/"
```

## Configuración Necesaria

### Variables de Entorno
Ya configuradas en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ktakrkxxyezczbogmuiq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### OAuth Providers
Configurar en Supabase Dashboard:
1. Authentication → Providers
2. Habilitar Google y Discord
3. Agregar credenciales (ver `OAUTH-SETUP-GUIDE.md`)
4. Configurar redirect URL:
   ```
   https://ktakrkxxyezczbogmuiq.supabase.co/auth/v1/callback
   ```

## Próximos Pasos

### Página de Registro
Crear `/signup` con:
- Formulario de registro
- Validación de email
- Confirmación de contraseña
- Términos y condiciones
- Mismo diseño futurista

### Recuperación de Contraseña
Crear `/forgot-password` con:
- Input de email
- Envío de link de recuperación
- Página de reset de contraseña

### Perfil de Usuario
Crear `/profile` con:
- Ver y editar nickname
- Cambiar avatar
- Ver estadísticas
- Cerrar sesión

## Personalización

### Cambiar Colores
Edita las clases de Tailwind:
```tsx
// Verde neón → Azul neón
className="text-[#00ff88]" → className="text-[#00d4ff]"

// Rosa neón → Naranja neón
className="border-[#ff0088]" → className="border-[#ff6600]"
```

### Ajustar Animaciones
Modifica las duraciones en el código:
```tsx
// Más rápido
animationDuration: `${4 + Math.random() * 2}s`

// Más lento
animationDuration: `${12 + Math.random() * 6}s`
```

### Cambiar Cantidad de Partículas
```tsx
// Menos partículas (mejor performance)
{[...Array(10)].map((_, i) => ...

// Más partículas (más efecto)
{[...Array(50)].map((_, i) => ...
```

## Performance

### Optimizaciones Aplicadas
- ✅ Animaciones con CSS (GPU accelerated)
- ✅ Partículas con `pointer-events-none`
- ✅ Backdrop blur solo en el card
- ✅ Lazy loading de componentes
- ✅ Memoización de funciones

### Recomendaciones
- Reducir partículas en móviles
- Usar `will-change` con cuidado
- Considerar `prefers-reduced-motion`

## Testing

### Probar Login
1. Inicia la app: `npm run dev`
2. Ve a: `http://localhost:3000/login`
3. Prueba:
   - Login con email (si tienes cuenta)
   - Login con Google
   - Login con Discord
4. Verifica redirect a "/"

### Verificar Animaciones
1. Observa las partículas flotantes
2. Hover sobre el botón de login
3. Click en el botón
4. Verifica la línea de escaneo
5. Observa el pulso de las esquinas

## Troubleshooting

### Las partículas no se ven
- Verifica que el z-index sea correcto
- Asegúrate de que `overflow: hidden` esté en el contenedor

### OAuth no funciona
- Verifica las credenciales en Supabase
- Confirma la URL de callback
- Revisa los logs de Supabase

### Animaciones lentas
- Reduce la cantidad de partículas
- Simplifica las animaciones CSS
- Usa `transform` en lugar de `top/left`

## Resultado Final

Una página de login moderna y futurista con:
- 🎨 Diseño cyberpunk atractivo
- ⚡ Animaciones suaves y fluidas
- 🔐 Autenticación segura
- 📱 Responsive design
- ♿ Accesible
- 🚀 Performance optimizado
