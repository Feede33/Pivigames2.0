# 🔧 Solución: Error de Email en Discord OAuth

## Error Completo
```
error=server_error
error_code=unexpected_failure
error_description=Error getting user email from external provider
```

## ¿Por qué sucede?

Discord no está compartiendo el email del usuario con tu aplicación. Esto puede pasar por 3 razones:

### 1. **El usuario no tiene email verificado en Discord** ⚠️
   - Discord SOLO comparte emails verificados
   - Si el usuario no verificó su email, Discord rechaza compartirlo

### 2. **Falta el scope `email` en la configuración de Supabase** 
   - Discord requiere que solicites explícitamente el permiso de email
   - Por defecto solo da acceso a `identify` (nombre, avatar, ID)

### 3. **Configuración incorrecta en Discord Developer Portal**
   - Los scopes deben estar habilitados en la aplicación de Discord

---

## ✅ Solución Completa

### Paso 1: Verificar Configuración en Discord Developer Portal

1. Ve a https://discord.com/developers/applications
2. Selecciona tu aplicación
3. Ve a **OAuth2** → **General**
4. En **Default Authorization Link**, asegúrate de que esté en "In-app Authorization"
5. En **Scopes**, verifica que estén seleccionados:
   - ✅ `identify` (información básica del usuario)
   - ✅ `email` (dirección de email)

### Paso 2: Configurar Scopes en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **Authentication** → **Providers** → **Discord**
3. En el campo **"Scopes"**, asegúrate de que diga:
   ```
   identify email
   ```
4. Si no existe el campo, está bien - el código ya lo maneja
5. Guarda los cambios

### Paso 3: Código Actualizado (Ya aplicado)

El código en `AuthContext.tsx` ahora incluye explícitamente el scope de email:

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'discord',
  options: {
    scopes: 'identify email', // ← Solicita explícitamente el email
    skipBrowserRedirect: false,
  },
});
```

### Paso 4: Instrucciones para los Usuarios

**Si un usuario tiene este error, debe:**

1. **Verificar su email en Discord:**
   - Abrir Discord
   - Ir a **Configuración de Usuario** → **Mi Cuenta**
   - Si el email no está verificado, hacer clic en "Verificar Email"
   - Revisar su bandeja de entrada y hacer clic en el link de verificación

2. **Volver a intentar el login:**
   - Una vez verificado el email, volver a tu sitio
   - Hacer clic en "Login con Discord"
   - Ahora debería funcionar correctamente

---

## 🎯 Alternativa: Hacer el Email Opcional

Si quieres permitir login sin email verificado, puedes modificar la configuración de Supabase:

### Opción A: Usar solo `identify` (sin email)

**Ventajas:**
- ✅ Funciona aunque el usuario no tenga email verificado
- ✅ Más usuarios pueden hacer login

**Desventajas:**
- ❌ No tendrás el email del usuario
- ❌ No podrás enviar notificaciones por email
- ❌ Más difícil recuperar cuentas

**Implementación:**
```typescript
// En AuthContext.tsx
scopes: 'identify' // Solo información básica, sin email
```

### Opción B: Manejar el error gracefully

Ya implementado en el código:
```typescript
catch (error) {
  console.error('Error signing in with Discord:', error);
  alert('Error al iniciar sesión con Discord. Asegúrate de que tu email de Discord esté verificado.');
}
```

---

## 📋 Checklist de Verificación

Antes de que un usuario intente hacer login, verifica:

- [ ] Discord Developer Portal tiene los scopes `identify email`
- [ ] Supabase tiene Discord habilitado con los scopes correctos
- [ ] Las redirect URLs coinciden exactamente en Discord y Supabase
- [ ] El usuario tiene su email verificado en Discord
- [ ] Las variables de entorno están configuradas en Vercel

---

## 🔍 Debugging

### Ver qué scopes está usando Discord:

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña **Network**
3. Haz clic en "Login con Discord"
4. Busca la petición a `discord.com/api/oauth2/authorize`
5. Revisa el parámetro `scope` en la URL
6. Debe decir: `scope=identify%20email` (identify email en URL encoding)

### Ver el error completo en Supabase:

1. Ve a Supabase Dashboard
2. Ve a **Authentication** → **Logs**
3. Busca el error del usuario
4. Verás más detalles sobre por qué falló

---

## 💡 Mensaje para Usuarios

Puedes agregar este mensaje en tu página de login:

```
⚠️ Nota: Para iniciar sesión con Discord, necesitas tener tu email verificado.

Si ves un error, por favor:
1. Abre Discord
2. Ve a Configuración → Mi Cuenta
3. Verifica tu email
4. Vuelve a intentar el login
```

---

## 🚀 Próximos Pasos

Una vez solucionado:

1. **Prueba con diferentes usuarios** para confirmar que funciona
2. **Agrega un mensaje de error más amigable** en la UI
3. **Considera agregar login alternativo** (Google, GitHub) como backup
4. **Documenta el proceso** para futuros usuarios

---

## 📞 Soporte

Si el problema persiste después de seguir estos pasos:

1. Verifica los logs de Supabase
2. Revisa la consola del navegador
3. Confirma que Discord Developer Portal esté configurado correctamente
4. Prueba con tu propia cuenta primero (que sabes que funciona)
5. Compara las diferencias entre tu cuenta y la del usuario con problemas
