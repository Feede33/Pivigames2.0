# Guía de Configuración OAuth - Discord y Google

## 📋 Resumen
Esta guía te ayudará a configurar Discord y Google como proveedores de autenticación en Supabase.

---

## 🎮 Configuración de Discord OAuth

### Paso 1: Crear Aplicación en Discord

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Click en **"New Application"**
3. Ingresa el nombre de tu aplicación (ej: "Jueguitosflix")
4. Acepta los términos y click en **"Create"**

### Paso 2: Configurar OAuth2

1. En el menú lateral, click en **"OAuth2"**
2. En **"Redirects"**, agrega tu URL de callback de Supabase:
   ```
   https://[TU-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   Ejemplo:
   ```
   https://ktakrkxxyezczbogmuiq.supabase.co/auth/v1/callback
   ```

3. **Guarda los cambios**

### Paso 3: Obtener Credenciales

1. En la sección **"OAuth2"**, encontrarás:
   - **Client ID**: Copia este valor
   - **Client Secret**: Click en **"Reset Secret"** → **"Yes, do it!"** → Copia el valor

⚠️ **IMPORTANTE**: Guarda el Client Secret inmediatamente, no podrás verlo de nuevo.

### Paso 4: Configurar en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Authentication** → **Providers**
3. Busca **Discord** y habilítalo
4. Ingresa:
   - **Client ID**: El que copiaste de Discord
   - **Client Secret**: El que copiaste de Discord
5. Click en **"Save"**

### Variables de Entorno (.env.local)

```env
# Discord OAuth (opcional, ya está en Supabase)
NEXT_PUBLIC_DISCORD_CLIENT_ID=tu_discord_client_id_aqui
```

---

## 🔍 Configuración de Google OAuth

### Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Click en el selector de proyectos (arriba a la izquierda)
3. Click en **"NEW PROJECT"**
4. Ingresa:
   - **Project name**: "Jueguitosflix" (o el nombre que prefieras)
   - **Organization**: Déjalo en blanco si no tienes
5. Click en **"CREATE"**
6. Espera a que se cree el proyecto y selecciónalo

### Paso 2: Habilitar Google+ API

1. En el menú lateral, ve a **"APIs & Services"** → **"Library"**
2. Busca **"Google+ API"**
3. Click en **"Google+ API"**
4. Click en **"ENABLE"**

### Paso 3: Configurar Pantalla de Consentimiento

1. Ve a **"APIs & Services"** → **"OAuth consent screen"**
2. Selecciona **"External"** (para usuarios fuera de tu organización)
3. Click en **"CREATE"**

4. **Información de la aplicación**:
   - **App name**: Jueguitosflix
   - **User support email**: tu-email@ejemplo.com
   - **App logo**: (opcional) Sube tu logo
   - **Application home page**: https://tu-dominio.com
   - **Application privacy policy**: https://tu-dominio.com/privacy
   - **Application terms of service**: https://tu-dominio.com/terms

5. **Developer contact information**:
   - **Email addresses**: tu-email@ejemplo.com

6. Click en **"SAVE AND CONTINUE"**

7. **Scopes** (Permisos):
   - Click en **"ADD OR REMOVE SCOPES"**
   - Selecciona:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click en **"UPDATE"**
   - Click en **"SAVE AND CONTINUE"**

8. **Test users** (opcional para desarrollo):
   - Agrega emails de prueba si quieres
   - Click en **"SAVE AND CONTINUE"**

9. **Summary**:
   - Revisa todo
   - Click en **"BACK TO DASHBOARD"**

### Paso 4: Crear Credenciales OAuth

1. Ve a **"APIs & Services"** → **"Credentials"**
2. Click en **"CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Selecciona **"Web application"**
4. Configura:
   - **Name**: "Jueguitosflix Web Client"
   
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://tu-dominio.com
     https://tu-dominio.vercel.app
     ```
   
   - **Authorized redirect URIs**:
     ```
     https://[TU-PROJECT-REF].supabase.co/auth/v1/callback
     ```
     Ejemplo:
     ```
     https://ktakrkxxyezczbogmuiq.supabase.co/auth/v1/callback
     ```

5. Click en **"CREATE"**

### Paso 5: Obtener Credenciales

Aparecerá un modal con:
- **Client ID**: Copia este valor
- **Client Secret**: Copia este valor

⚠️ **IMPORTANTE**: Guarda ambos valores, los necesitarás para Supabase.

### Paso 6: Configurar en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Authentication** → **Providers**
3. Busca **Google** y habilítalo
4. Ingresa:
   - **Client ID**: El que copiaste de Google
   - **Client Secret**: El que copiaste de Google
5. Click en **"Save"**

### Variables de Entorno (.env.local)

```env
# Google OAuth (opcional, ya está en Supabase)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_google_client_id_aqui
```

---

## 🔧 Configuración de Supabase

### Obtener tu Project Reference

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **General**
4. Copia el **Reference ID** (ej: `ktakrkxxyezczbogmuiq`)

### URL de Callback

Tu URL de callback siempre será:
```
https://[REFERENCE-ID].supabase.co/auth/v1/callback
```

Ejemplo:
```
https://ktakrkxxyezczbogmuiq.supabase.co/auth/v1/callback
```

---

## 📝 Archivo .env.local Completo

Crea o actualiza tu archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ktakrkxxyezczbogmuiq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui

# Discord OAuth (opcional)
NEXT_PUBLIC_DISCORD_CLIENT_ID=tu_discord_client_id_aqui

# Google OAuth (opcional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_google_client_id_aqui

# Otros
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Cómo obtener las claves de Supabase:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ✅ Verificación

### Probar Discord OAuth

1. Inicia tu aplicación: `npm run dev`
2. Ve a la sección de comentarios
3. Click en **"Iniciar sesión"**
4. Click en **"Continuar con Discord"**
5. Deberías ser redirigido a Discord para autorizar
6. Después de autorizar, deberías volver a tu app autenticado

### Probar Google OAuth

1. En la misma pantalla de login
2. Click en **"Continuar con Google"**
3. Selecciona tu cuenta de Google
4. Autoriza los permisos
5. Deberías volver a tu app autenticado

### Verificar Perfil Creado

Después de autenticarte, verifica en Supabase:

1. Ve a **Table Editor** → **user_profiles**
2. Deberías ver tu perfil con:
   - `id`: Tu UUID de usuario
   - `nickname`: Nickname aleatorio generado (ej: "SwiftWarrior1234")
   - `avatar_seed`: Tu user ID
   - `created_at`: Fecha de creación

---

## 🐛 Solución de Problemas

### Error: "Invalid redirect URI"

**Causa**: La URL de callback no está configurada correctamente.

**Solución**:
1. Verifica que la URL en Discord/Google coincida exactamente con:
   ```
   https://[TU-PROJECT-REF].supabase.co/auth/v1/callback
   ```
2. No debe tener espacios ni caracteres extra
3. Debe usar HTTPS (no HTTP)

### Error: "Client ID or Secret incorrect"

**Causa**: Las credenciales en Supabase no coinciden con Discord/Google.

**Solución**:
1. Ve a Discord/Google y copia nuevamente las credenciales
2. Pégalas en Supabase
3. Asegúrate de no tener espacios al inicio o final
4. Guarda los cambios

### Error: "Access denied"

**Causa**: El usuario canceló la autorización o hay un problema con los scopes.

**Solución**:
1. Intenta de nuevo
2. Verifica que los scopes en Google incluyan email y profile
3. Verifica que la app no esté en modo restringido

### No se crea el perfil automáticamente

**Causa**: El trigger no está funcionando.

**Solución**:
1. Ve a Supabase SQL Editor
2. Ejecuta:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
3. Si no existe, ejecuta la migración completa de `supabase-user-profiles-migration.sql`

### Avatar no se muestra

**Causa**: DiceBear API puede estar caída o bloqueada.

**Solución**:
1. Verifica que la URL sea accesible: `https://api.dicebear.com/7.x/avataaars/svg?seed=test`
2. Si no funciona, puedes cambiar a otro proveedor en `src/lib/user-profiles.ts`

---

## 🔒 Seguridad

### Producción

Cuando despliegues a producción:

1. **Actualiza las URLs de redirect** en Discord y Google:
   ```
   https://tu-dominio.com
   https://tu-dominio.vercel.app
   ```

2. **Actualiza las variables de entorno** en Vercel/tu hosting:
   - Ve a tu proyecto en Vercel
   - Settings → Environment Variables
   - Agrega todas las variables de `.env.local`

3. **Publica la pantalla de consentimiento de Google**:
   - Ve a Google Cloud Console
   - OAuth consent screen
   - Click en **"PUBLISH APP"**
   - Completa el proceso de verificación si es necesario

### Variables Secretas

⚠️ **NUNCA** expongas en el frontend:
- Client Secrets de Discord/Google
- Service Role Key de Supabase
- Claves privadas

✅ **Seguro para el frontend**:
- Client IDs (NEXT_PUBLIC_*)
- Supabase URL y Anon Key
- URLs públicas

---

## 📚 Referencias

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Discord OAuth2 Docs](https://discord.com/developers/docs/topics/oauth2)
- [Google OAuth2 Docs](https://developers.google.com/identity/protocols/oauth2)
- [DiceBear API](https://www.dicebear.com/)

---

## 🎉 ¡Listo!

Ahora tienes configurado:
- ✅ Discord OAuth
- ✅ Google OAuth
- ✅ Perfiles de usuario con nicknames aleatorios
- ✅ Avatares generados automáticamente
- ✅ Sistema seguro sin exposición de datos sensibles
