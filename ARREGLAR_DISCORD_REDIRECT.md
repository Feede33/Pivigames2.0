# 🔧 Arreglar "Invalid OAuth2 redirect_uri"

## El Problema
Discord está rechazando la URL de redirect porque no coincide exactamente con las configuradas.

## ✅ Solución Paso a Paso

### 1. Ve a Discord Developer Portal
https://discord.com/developers/applications

### 2. Selecciona tu aplicación "pivigames2.0"

### 3. Ve a OAuth2 → General

### 4. En la sección "Redirects", asegúrate de tener EXACTAMENTE estas 3 URLs:

```
http://localhost:3000/auth/callback
https://pivigames2-0.vercel.app/auth/callback
https://www.pivigames2-0.vercel.app/auth/callback
```

**IMPORTANTE:** 
- ✅ Deben terminar en `/auth/callback`
- ✅ NO debe haber espacios
- ✅ NO debe haber barra final `/` después de callback
- ✅ Deben ser HTTPS para producción (excepto localhost)

### 5. Click en "Save Changes" (abajo)

### 6. Verifica en Supabase

Ve a tu proyecto Supabase → Authentication → URL Configuration:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs (agregar estas):**
```
http://localhost:3000/**
https://pivigames2-0.vercel.app/**
https://www.pivigames2-0.vercel.app/**
```

El `**` permite cualquier ruta después del dominio.

### 7. Prueba el Login

1. Abre tu app en `http://localhost:3000`
2. Click en "Login con Discord"
3. Deberías ver la pantalla de autorización de Discord
4. Autoriza la app
5. Serás redirigido a `/auth/callback`
6. Luego a la página principal con tu sesión activa

## 🐛 Si Sigue Fallando

### Opción A: Verifica la URL exacta que se está usando

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Click en "Login con Discord"
4. Busca el log que dice "Redirect URL: ..."
5. Copia esa URL EXACTA
6. Agrégala en Discord Developer Portal

### Opción B: Limpia y vuelve a intentar

1. En Discord Developer Portal:
   - Elimina TODAS las redirect URLs
   - Agrega solo: `http://localhost:3000/auth/callback`
   - Guarda cambios

2. En Supabase:
   - Ve a Authentication → Providers → Discord
   - Verifica que Client ID y Secret sean correctos
   - Guarda cambios

3. Cierra tu navegador completamente
4. Abre de nuevo y prueba

### Opción C: Verifica que el servidor esté corriendo

```bash
# Asegúrate de estar en el directorio correcto
cd --yess

# Inicia el servidor
bun run dev

# Debería mostrar: http://localhost:3000
```

## 📸 Cómo Debe Verse en Discord

En la sección "Redirects" deberías ver:

```
┌─────────────────────────────────────────────────┐
│ http://localhost:3000/auth/callback        [×] │
├─────────────────────────────────────────────────┤
│ https://pivigames2-0.vercel.app/auth/     [×] │
│ callback                                        │
└─────────────────────────────────────────────────┘
     [Add Another]
```

## ✅ Checklist Final

- [ ] Discord tiene `http://localhost:3000/auth/callback`
- [ ] Discord tiene `https://pivigames2-0.vercel.app/auth/callback`
- [ ] Guardaste los cambios en Discord
- [ ] Supabase tiene las redirect URLs configuradas
- [ ] El servidor está corriendo en `http://localhost:3000`
- [ ] No hay errores en la consola del navegador

## 💡 Tip

Si estás desarrollando, usa SOLO localhost por ahora:
1. Elimina las URLs de Vercel de Discord
2. Deja solo `http://localhost:3000/auth/callback`
3. Prueba que funcione
4. Luego agrega las de producción

---

**¿Sigue sin funcionar?** Comparte:
1. La URL exacta que aparece en la consola
2. Screenshot de tu configuración en Discord
3. El error exacto que ves
