# 🔧 Solución: Error de Email en Discord OAuth

## Error Completo
```
error=server_error
error_code=unexpected_failure
error_description=Error getting user email from external provider
```

## ¿Por qué sucede?

Discord no está compartiendo el email del usuario. Esto sucede porque:

### **El usuario NO tiene su email verificado en Discord** ⚠️
   - Discord SOLO comparte emails verificados por seguridad
   - Si el usuario no verificó su email, Discord rechaza compartirlo
   - Esto es una política de seguridad de Discord, no un error de tu app

---

## ✅ Solución para el Usuario

### El usuario debe verificar su email en Discord:

1. **Abrir Discord** (app o web)
2. Ir a **Configuración de Usuario** (⚙️ abajo a la izquierda)
3. Ir a **Mi Cuenta**
4. Buscar la sección de **Email**
5. Si dice "No verificado", hacer clic en **"Verificar Email"**
6. Revisar la bandeja de entrada (y spam)
7. Hacer clic en el link de verificación de Discord
8. **Volver a tu sitio y hacer login nuevamente**

---

## 🔍 Verificación Técnica

### El código YA está configurado correctamente:

En `src/contexts/AuthContext.tsx`:
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'discord',
  options: {
    scopes: 'identify email', // ✅ Ya solicita el email
    skipBrowserRedirect: false,
  },
});
```

### Verificar en Discord Developer Portal:

1. Ve a https://discord.com/developers/applications
2. Selecciona tu aplicación
3. Ve a **OAuth2** → **General**
4. En **Default Authorization Link**, debe estar en "In-app Authorization"
5. Los scopes se manejan desde el código, NO desde Discord Portal

### Verificar Redirect URLs en Discord:

Asegúrate de tener estas URLs en **OAuth2** → **Redirects**:
```
http://localhost:3000/auth/callback
https://pivigames2-0.vercel.app/auth/callback
```

---

## 💡 Mensaje para Usuarios en tu Sitio

Puedes agregar este aviso en tu página de login:

```
⚠️ Importante: Para iniciar sesión con Discord, 
necesitas tener tu email verificado en Discord.

Si ves un error:
1. Abre Discord
2. Ve a Configuración → Mi Cuenta
3. Verifica tu email
4. Vuelve a intentar el login
```

---

## 🎯 Notificación Automática

Ya implementado en `page.tsx` - cuando un usuario tiene este error, verá automáticamente:

> ⚠️ Para iniciar sesión con Discord, necesitas tener tu email verificado. 
> Por favor verifica tu email en Discord e intenta nuevamente.

---

## 🔧 Debugging

### Ver el error en tiempo real:

1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Intenta hacer login
4. Verás el error completo de Discord

### Ver logs en Supabase:

1. Ve a Supabase Dashboard
2. **Authentication** → **Logs**
3. Busca el intento de login fallido
4. Verás: "Error getting user email from external provider"

---

## ❓ FAQ

### ¿Por qué a ti te funciona pero a otros no?

Porque TU email de Discord está verificado, pero el de ellos no.

### ¿Puedo hacer el email opcional?

Sí, pero NO es recomendado porque:
- ❌ No podrás identificar usuarios únicamente
- ❌ No podrás enviar notificaciones
- ❌ Problemas de seguridad y recuperación de cuenta

### ¿Hay alternativa al email?

Sí, Discord también proporciona:
- `id` - ID único del usuario (siempre disponible)
- `username` - Nombre de usuario (siempre disponible)
- `avatar` - Avatar del usuario (siempre disponible)

Pero el email es importante para:
- Identificación única confiable
- Comunicación con usuarios
- Recuperación de cuentas
- Cumplimiento legal (GDPR, etc.)

---

## 🚀 Resumen

**El problema NO es tu código** ✅

**El problema es:** El usuario no tiene su email verificado en Discord

**La solución es:** El usuario debe verificar su email en Discord

**Tu app ya maneja esto correctamente** mostrando un mensaje de error claro

---

## 📞 Si el problema persiste

Si después de verificar el email el error continúa:

1. Cerrar sesión completamente de Discord
2. Volver a iniciar sesión en Discord
3. Confirmar que el email ahora dice "Verificado"
4. Limpiar cookies del navegador
5. Intentar el login nuevamente en tu sitio

Si aún así falla, puede ser un problema temporal de Discord API.
