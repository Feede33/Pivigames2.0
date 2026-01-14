# ⚡ Configuración Rápida de OAuth

## 🎯 Tu URL de Callback de Supabase
```
https://ktakrkxxyezczbogmuiq.supabase.co/auth/v1/callback
```
**Copia esta URL, la necesitarás en Discord y Google**

---

## 🎮 Discord OAuth (5 minutos)

### 1. Crear App
- Ve a: https://discord.com/developers/applications
- Click **"New Application"**
- Nombre: "Jueguitosflix"
- Click **"Create"**

### 2. Configurar OAuth2
- Menú lateral → **"OAuth2"**
- En **"Redirects"**, agrega:
  ```
  https://ktakrkxxyezczbogmuiq.supabase.co/auth/v1/callback
  ```
- Click **"Save Changes"**

### 3. Copiar Credenciales
- **Client ID**: Copia este valor
- **Client Secret**: Click "Reset Secret" → Copia el valor

### 4. Configurar en Supabase
- Ve a: https://supabase.com/dashboard/project/ktakrkxxyezczbogmuiq/auth/providers
- Busca **Discord**
- Habilítalo
- Pega Client ID y Client Secret
- Click **"Save"**

✅ **Discord listo!**

---

## 🔍 Google OAuth (10 minutos)

### 1. Crear Proyecto
- Ve a: https://console.cloud.google.com/
- Click selector de proyectos → **"NEW PROJECT"**
- Nombre: "Jueguitosflix"
- Click **"CREATE"**

### 2. Habilitar API
- Menú → **"APIs & Services"** → **"Library"**
- Busca **"Google+ API"**
- Click **"ENABLE"**

### 3. Pantalla de Consentimiento
- **"APIs & Services"** → **"OAuth consent screen"**
- Selecciona **"External"**
- Click **"CREATE"**
- Completa:
  - App name: **Jueguitosflix**
  - User support email: **tu-email@ejemplo.com**
  - Developer email: **tu-email@ejemplo.com**
- Click **"SAVE AND CONTINUE"** (3 veces)

### 4. Crear Credenciales
- **"APIs & Services"** → **"Credentials"**
- **"CREATE CREDENTIALS"** → **"OAuth client ID"**
- Tipo: **"Web application"**
- Nombre: **"Jueguitosflix Web"**
- **Authorized redirect URIs**:
  ```
  https://ktakrkxxyezczbogmuiq.supabase.co/auth/v1/callback
  ```
- Click **"CREATE"**

### 5. Copiar Credenciales
- **Client ID**: Copia este valor
- **Client Secret**: Copia este valor

### 6. Configurar en Supabase
- Ve a: https://supabase.com/dashboard/project/ktakrkxxyezczbogmuiq/auth/providers
- Busca **Google**
- Habilítalo
- Pega Client ID y Client Secret
- Click **"Save"**

✅ **Google listo!**

---

## 🧪 Probar

1. Inicia tu app: `npm run dev`
2. Ve a cualquier juego
3. Scroll a comentarios
4. Click **"Iniciar sesión"**
5. Prueba Discord y Google

---

## 📝 Variables de Entorno (Opcional)

Si quieres guardar los Client IDs en tu `.env.local`:

```env
# OAuth (Opcional - ya están en Supabase)
NEXT_PUBLIC_DISCORD_CLIENT_ID=tu_discord_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_google_client_id
```

**Nota**: No es necesario, las credenciales ya están en Supabase.

---

## 🐛 Problemas Comunes

### "Invalid redirect URI"
- Verifica que la URL sea exactamente:
  ```
  https://ktakrkxxyezczbogmuiq.supabase.co/auth/v1/callback
  ```
- Sin espacios, sin HTTP (debe ser HTTPS)

### "Client ID incorrect"
- Copia de nuevo las credenciales
- Asegúrate de no tener espacios al inicio/final
- Guarda los cambios en Supabase

### No se crea el perfil
- Ve a Supabase SQL Editor
- Ejecuta el archivo: `supabase-user-profiles-migration.sql`

---

## ✅ Checklist

- [ ] Discord App creada
- [ ] Discord redirect URI configurado
- [ ] Discord credenciales en Supabase
- [ ] Google proyecto creado
- [ ] Google+ API habilitada
- [ ] Google pantalla de consentimiento configurada
- [ ] Google credenciales creadas
- [ ] Google credenciales en Supabase
- [ ] Probado Discord login
- [ ] Probado Google login
- [ ] Perfil de usuario se crea automáticamente

---

## 🎉 ¡Listo!

Ahora tienes:
- ✅ Login con Discord
- ✅ Login con Google
- ✅ Nicknames aleatorios
- ✅ Avatares generados
- ✅ Sin datos sensibles expuestos
