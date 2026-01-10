# Sistema de Internacionalización (i18n)

## Configuración

Tu sitio ahora soporta múltiples idiomas de forma automática:

- **Español (es)** - Idioma por defecto
- **Inglés (en)**

## Cómo funciona

### Detección automática de idioma

El sistema detecta automáticamente el idioma preferido del usuario basándose en:

1. **Header Accept-Language del navegador** - El navegador envía el idioma preferido del usuario
2. **Redirección automática** - El middleware redirige a `/es/` o `/en/` según el idioma detectado

### Estructura de URLs

- `/` → Redirige automáticamente a `/es/` o `/en/`
- `/es/` → Versión en español
- `/en/` → Versión en inglés

### Agregar nuevas traducciones

Edita el archivo `src/lib/i18n.ts`:

```typescript
export const translations = {
  es: {
    nav: {
      discover: 'Descubrir',
      // ... más traducciones
    },
  },
  en: {
    nav: {
      discover: 'Discover',
      // ... más traducciones
    },
  },
};
```

### Usar traducciones en componentes

```typescript
import { useTranslations, type Locale } from "@/lib/i18n";

export default function MyComponent({ params }: { params: { locale: Locale } }) {
  const t = useTranslations(params.locale);
  
  return <h1>{t.nav.discover}</h1>;
}
```

### Agregar más idiomas

1. Edita `src/lib/i18n.ts` y agrega el nuevo idioma:
```typescript
export const translations = {
  es: { /* ... */ },
  en: { /* ... */ },
  fr: { /* traducciones en francés */ },
};
```

2. Actualiza `src/middleware.ts` para incluir el nuevo locale:
```typescript
const pathnameHasLocale = ['es', 'en', 'fr'].some(/* ... */);
```

3. Actualiza `src/app/[locale]/layout.tsx`:
```typescript
export async function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }, { locale: 'fr' }];
}
```

## Ventajas

✅ **Sin librerías externas** - Usa funcionalidad nativa de Next.js
✅ **Detección automática** - El usuario ve su idioma preferido sin configurar nada
✅ **SEO friendly** - URLs limpias con locale (`/es/`, `/en/`)
✅ **TypeScript** - Autocompletado y type-safety en las traducciones
✅ **Fácil de mantener** - Todas las traducciones en un solo archivo

## Notas

- Las rutas de API (`/api/*`) y auth (`/auth/*`) no están afectadas por el sistema de i18n
- El idioma se detecta una sola vez al cargar la página
- Los usuarios pueden cambiar manualmente el idioma visitando `/es/` o `/en/`
