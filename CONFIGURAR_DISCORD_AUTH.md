# 🎮 Configurar Login con Discord

## Paso 1: Crear Aplicación en Discord

1. Ve a https://discord.com/developers/applications
2. Click en "New Application"
3. Dale un nombre (ej: "Pivigames")
4. Ve a la sección "OAuth2"
5. Copia el **Client ID** y **Client Secret**
6. En "Redirects", agrega AMBAS URLs:
   ```
   http://localhost:3000/auth/callback
   https://TU_DOMINIO.vercel.app/auth/callback
   ```
   (Reemplaza TU_DOMINIO con tu dominio de producción)

## Paso 2: Configurar en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **Authentication** > **Providers**
3. Busca **Discord** y habilítalo
4. Pega el **Client ID** y **Client Secret** de Discord
5. En "Site URL", pon: `http://localhost:3000` (desarrollo) o tu dominio de producción
6. En "Redirect URLs", agrega:
   ```
   http://localhost:3000/auth/callback
   https://TU_DOMINIO.vercel.app/auth/callback
   ```
7. Guarda los cambios

## Paso 3: Variables de Entorno

Ya están configuradas en tu `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
```

## Paso 4: ¡Listo!

El código ya está implementado. Los usuarios pueden:
- ✅ Usar el sitio sin login
- ✅ Hacer login con Discord (opcional)
- ✅ Ver su perfil de Discord
- ✅ Cerrar sesión cuando quieran

## Características Implementadas

### Sin Login:
- Navegar por todos los juegos
- Ver ofertas
- Abrir modales de juegos
- Acceder a toda la información

### Con Login:
- Avatar de Discord visible
- Nombre de usuario mostrado
- Posibilidad de guardar favoritos (futuro)
- Historial de descargas (futuro)
- Comentarios y reviews (futuro)

## Flujo de Usuario

1. Usuario entra al sitio → Puede usar todo sin login
2. Click en "Login con Discord" → Popup de Discord
3. Autoriza la app → Vuelve al sitio logueado
4. Su avatar aparece en la esquina superior derecha
5. Click en avatar → Menú con opciones y logout

## Seguridad

- ✅ OAuth2 seguro con Discord
- ✅ Tokens manejados por Supabase
- ✅ No se almacenan contraseñas
- ✅ Sesión persistente en localStorage
- ✅ Logout limpia toda la sesión

## Próximas Funcionalidades (Opcional)

Una vez que tengas usuarios logueados, puedes agregar:
- Sistema de favoritos
- Historial de descargas
- Comentarios y ratings
- Perfil personalizado
- Logros y badges
- Lista de deseos
