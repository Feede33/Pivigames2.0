# 🔧 Cómo Funciona el Sistema de Idiomas

## 📋 Flujo Completo

### 1. Usuario visita el sitio

```
Usuario → https://tupagina.com/
```

**Proxy detecta idioma:**
- Lee header `Accept-Language` del navegador
- Ejemplo: `es-ES,es;q=0.9,en;q=0.8`
- Extrae el idioma principal: `es`

**Redirige automáticamente:**
```
https://tupagina.com/ → https://tupagina.com/es/
```

### 2. Página carga con el idioma correcto

**URL actual:** `/es/`

**Layout carga:**
- `src/app/[locale]/layout.tsx` recibe `params.locale = 'es'`
- Establece `<html lang="es">`

**Página carga:**
- `src/app/[locale]/page.tsx` recibe `params.locale = 'es'`
- Usa `useTranslations('es')` para obtener textos de UI
- Muestra: "Descubrir", "Explorar", "Ofertas", etc.

### 3. Usuario ve ofertas de Steam

**Cliente hace petición:**
```javascript
fetch('/api/steam/specials?cc=us&count=20')
```

**API detecta idioma automáticamente:**

```typescript
// 1. Intenta obtener de query params
let steamLanguage = searchParams.get('l'); // null

// 2. Extrae del referer (URL actual)
const referer = request.headers.get('referer');
// referer = "https://tupagina.com/es/"
const match = referer.match(/\/(es|en|pt|fr|de|it|ru|ja|ko|zh|ar)\//);
// match[1] = "es"
steamLanguage = getSteamLanguage('es'); // "spanish"

// 3. Si falla, usa Accept-Language
// (fallback)
```

**API llama a Steam:**
```
https://store.steampowered.com/api/featuredcategories?cc=us&l=spanish
```

**Steam devuelve:**
- Títulos en español: "Grand Theft Auto V"
- Descripciones en español
- Géneros en español: "Acción", "Aventura"

### 4. Usuario cambia de idioma

**Click en selector de idioma:**
```javascript
switchLanguage('en')
```

**Router navega:**
```
/es/ → /en/
```

**Página recarga:**
- Layout: `<html lang="en">`
- Traducciones: "Discover", "Browse", "Offers"
- APIs detectan nuevo idioma desde URL `/en/`
- Steam devuelve contenido en inglés

## 🔄 Detección Automática de Idioma en APIs

Las APIs usan un sistema de 3 niveles para detectar el idioma:

### Nivel 1: Query Parameter (Explícito)
```javascript
fetch('/api/steam/specials?l=spanish')
```
✅ Más confiable - El cliente especifica exactamente qué quiere

### Nivel 2: Referer URL (Automático)
```javascript
// Cliente está en: https://tupagina.com/es/
// API lee el referer y extrae "es"
const referer = request.headers.get('referer');
const match = referer.match(/\/(es|en|pt|...)\//);
```
✅ Funciona automáticamente sin pasar parámetros

### Nivel 3: Accept-Language (Fallback)
```javascript
// Si no hay referer, usa el header del navegador
const acceptLanguage = request.headers.get('accept-language');
```
✅ Siempre disponible como último recurso

## 🗺️ Mapeo de Idiomas

### ISO 639-1 → Steam API

```typescript
// src/lib/steam-languages.ts
'es' → 'spanish'
'en' → 'english'
'pt' → 'portuguese'
'pt-BR' → 'brazilian'
'zh' → 'schinese' (Simplified Chinese)
'zh-TW' → 'tchinese' (Traditional Chinese)
'ja' → 'japanese'
'ko' → 'koreana'
'ru' → 'russian'
'fr' → 'french'
'de' → 'german'
'it' → 'italian'
'ar' → 'arabic'
```

## 📊 Ejemplo Completo

### Usuario español visita el sitio

1. **Navegador envía:**
   ```
   GET https://tupagina.com/
   Accept-Language: es-ES,es;q=0.9
   ```

2. **Proxy redirige:**
   ```
   302 → https://tupagina.com/es/
   ```

3. **Página carga:**
   - UI en español: "Descubrir", "Explorar"
   - `<html lang="es">`

4. **Cliente pide ofertas:**
   ```javascript
   fetch('/api/steam/specials?cc=us&count=20')
   // Referer: https://tupagina.com/es/
   ```

5. **API detecta idioma:**
   ```typescript
   referer.match(/\/es\//) → "es"
   getSteamLanguage("es") → "spanish"
   ```

6. **API llama a Steam:**
   ```
   GET https://store.steampowered.com/api/featuredcategories?cc=us&l=spanish
   ```

7. **Steam responde:**
   ```json
   {
     "specials": {
       "items": [
         {
           "id": 271590,
           "name": "Grand Theft Auto V",
           "discount_percent": 50,
           ...
         }
       ]
     }
   }
   ```

8. **Usuario ve:**
   - Título: "Grand Theft Auto V"
   - Descripción en español
   - Géneros en español

### Usuario cambia a inglés

1. **Click en selector:**
   ```javascript
   switchLanguage('en')
   ```

2. **Router navega:**
   ```
   /es/ → /en/
   router.refresh() // Forzar recarga
   ```

3. **Página recarga:**
   - UI en inglés: "Discover", "Browse"
   - `<html lang="en">`

4. **Cliente pide ofertas:**
   ```javascript
   fetch('/api/steam/specials?cc=us&count=20')
   // Referer: https://tupagina.com/en/
   ```

5. **API detecta nuevo idioma:**
   ```typescript
   referer.match(/\/en\//) → "en"
   getSteamLanguage("en") → "english"
   ```

6. **Steam responde en inglés:**
   ```json
   {
     "name": "Grand Theft Auto V",
     "short_description": "When a young street hustler..."
   }
   ```

## 🎯 Ventajas de Este Sistema

1. **Automático** - No necesitas pasar idioma manualmente
2. **Confiable** - 3 niveles de detección (query → referer → header)
3. **Eficiente** - Las APIs detectan el idioma sin código extra en el cliente
4. **Consistente** - El idioma siempre coincide con la URL
5. **SEO-friendly** - URLs limpias por idioma
6. **Sin estado** - No necesita cookies ni localStorage

## 🐛 Debugging

### Ver qué idioma detecta la API

Revisa los logs del servidor:
```
[Steam API] Fetching appid 271590 in language: spanish
[Steam Specials API] Fetching specials in language: spanish
```

### Forzar un idioma específico

Puedes pasar el parámetro `l` explícitamente:
```javascript
fetch('/api/steam/specials?cc=us&l=english')
```

### Verificar el referer

En las DevTools del navegador:
```
Network → Headers → Request Headers → Referer
```

## ✅ Resultado

El sistema funciona completamente automático:
- Usuario visita → Detecta idioma → Redirige
- Página carga → UI en su idioma
- APIs llaman → Detectan idioma desde URL
- Steam responde → Contenido en el idioma correcto
- Usuario cambia idioma → Todo se actualiza

Sin configuración, sin parámetros manuales, sin complicaciones.
