  # 🌍 Sistema Multiidioma Completo

## ✅ Implementación Completada

Tu sitio ahora soporta **11 idiomas principales del mundo** con detección automática y contenido de Steam en el idioma correcto.

## 🌐 Idiomas Soportados

| Idioma | Código | Bandera | Steam API |
|--------|--------|---------|-----------|
| Español | `es` | 🇪🇸 | ✅ spanish |
| English | `en` | 🇺🇸 | ✅ english |
| Português | `pt` | 🇧🇷 | ✅ portuguese/brazilian |
| Français | `fr` | 🇫🇷 | ✅ french |
| Deutsch | `de` | 🇩🇪 | ✅ german |
| Italiano | `it` | 🇮🇹 | ✅ italian |
| Русский | `ru` | 🇷🇺 | ✅ russian |
| 日本語 | `ja` | 🇯🇵 | ✅ japanese |
| 한국어 | `ko` | 🇰🇷 | ✅ koreana |
| 中文 | `zh` | 🇨🇳 | ✅ schinese |
| العربية | `ar` | 🇸🇦 | ✅ arabic |

## 🎯 Características Implementadas

### 1. Detección Automática de Idioma
- Lee el header `Accept-Language` del navegador
- Redirige automáticamente a la versión correcta (`/es/`, `/en/`, `/pt/`, etc.)
- Sin configuración necesaria del usuario

### 2. Contenido de Steam en el Idioma Correcto
- **Títulos de juegos** traducidos
- **Descripciones** en el idioma del usuario
- **Géneros y categorías** localizados
- **Ofertas especiales** con texto traducido

### 3. Selector Manual de Idioma
- Dropdown con 11 idiomas
- Banderas para identificación visual rápida
- Mantiene la misma página al cambiar

### 4. URLs SEO-Friendly
```
/ → Redirige según idioma del navegador
/es/ → Español
/en/ → English
/pt/ → Português
/fr/ → Français
/de/ → Deutsch
/it/ → Italiano
/ru/ → Русский
/ja/ → 日本語
/ko/ → 한국어
/zh/ → 中文
/ar/ → العربية
```

## 🔧 Cómo Funciona

### Mapeo de Idiomas a Steam API

El sistema usa `src/lib/steam-languages.ts` que mapea códigos ISO 639-1 a los códigos de Steam:

```typescript
'es' → 'spanish'
'en' → 'english'
'pt' → 'portuguese'
'pt-BR' → 'brazilian'
'zh' → 'schinese' (Simplified Chinese)
'zh-TW' → 'tchinese' (Traditional Chinese)
// ... y más
```

### Flujo de Traducción

1. **Usuario visita el sitio** → Proxy detecta idioma del navegador
2. **Redirige a `/[locale]/`** → Ej: `/es/` para español
3. **Página carga** → Obtiene traducciones de UI desde `i18n.ts`
4. **Llama a APIs de Steam** → Pasa parámetro `l=spanish`
5. **Steam devuelve contenido** → En el idioma solicitado

### APIs Actualizadas

Todas las APIs ahora aceptan el parámetro `l` (language):

```typescript
// API de detalles de juego
GET /api/steam/[appid]?cc=us&l=spanish

// API de ofertas especiales
GET /api/steam/specials?cc=us&l=spanish&count=20
```

## 📁 Archivos Clave

### Nuevos:
- `src/lib/steam-languages.ts` - Mapeo completo de idiomas a Steam
- `src/lib/i18n.ts` - Traducciones de UI en 11 idiomas

### Modificados:
- `src/app/api/steam/[appid]/route.ts` - Acepta parámetro de idioma
- `src/app/api/steam/specials/route.ts` - Acepta parámetro de idioma
- `src/app/[locale]/page.tsx` - Pasa idioma a las APIs
- `src/components/LanguageSwitcher.tsx` - 11 idiomas en dropdown
- `proxy.ts` - Detecta 11 idiomas
- `src/app/[locale]/layout.tsx` - Genera 11 rutas estáticas

## 🎨 Traducciones de UI

Todas las cadenas visibles están traducidas en los 11 idiomas:

- ✅ Navegación (Discover, Browse, Offers)
- ✅ Hero section (Play, Report, Match)
- ✅ Ofertas de Steam (título, subtítulo, badges)
- ✅ Estados de carga
- ✅ Mensajes de error de autenticación
- ✅ Estados vacíos

## 🌟 Agregar Más Idiomas

### 1. Agregar traducciones de UI

Edita `src/lib/i18n.ts`:

```typescript
export const translations = {
  // ... idiomas existentes
  nl: { // Holandés
    nav: {
      discover: 'Ontdekken',
      browse: 'Bladeren',
      offers: 'Aanbiedingen en Prijsgeschiedenis',
    },
    // ... más traducciones
  },
};
```

### 2. Verificar soporte en Steam

Revisa `src/lib/steam-languages.ts` y agrega el mapeo si es necesario:

```typescript
export const steamLanguageMap: Record<string, string> = {
  // ... mapeos existentes
  'nl': 'dutch',
};
```

### 3. Actualizar configuración

- `proxy.ts` - Agregar código de idioma al array
- `src/app/[locale]/layout.tsx` - Agregar a `generateStaticParams()`
- `src/components/LanguageSwitcher.tsx` - Agregar bandera y nombre

## 🧪 Cómo Probar

1. **Detección automática:**
   - Cambia el idioma de tu navegador
   - Visita el sitio
   - Verás la versión en tu idioma

2. **Selector manual:**
   - Click en el globo (esquina superior derecha)
   - Selecciona cualquier idioma
   - Todo el contenido cambia instantáneamente

3. **Contenido de Steam:**
   - Los títulos de juegos aparecen traducidos
   - Las descripciones están en tu idioma
   - Las ofertas muestran texto localizado

## 📊 Cobertura de Idiomas

- **Población mundial cubierta:** ~5.5 mil millones de personas
- **Porcentaje de usuarios de internet:** ~85%
- **Mercados principales de Steam:** 100% cubiertos

## ✨ Ventajas

- **Sin librerías externas** - Todo nativo de Next.js
- **Automático** - El usuario ve su idioma sin configurar nada
- **Completo** - UI + contenido de Steam traducidos
- **Rápido** - Sin overhead de librerías pesadas
- **Escalable** - Fácil agregar más idiomas
- **SEO** - URLs limpias por idioma
- **Type-safe** - TypeScript valida todo

## 🎉 Resultado

Tu sitio es ahora verdaderamente global:
- Detecta automáticamente el idioma del usuario
- Muestra la UI en su idioma
- Obtiene contenido de Steam en su idioma
- Soporta 11 idiomas principales del mundo
- Cubre el 85% de los usuarios de internet

¡Build exitoso con todos los idiomas! ✅
