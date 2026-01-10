// Diccionario de traducciones
export const translations = {
  es: {
    // Navigation
    nav: {
      discover: 'Descubrir',
      browse: 'Explorar',
      offers: 'Ofertas e Historial de Precios',
    },
    // Hero section
    hero: {
      match: 'Match',
      play: 'Jugar',
      report: 'Reportar',
    },
    // Offers section
    offers: {
      title: '🔥 Ofertas Especiales de Steam',
      subtitle: 'Descuentos exclusivos actualizados diariamente',
      save: 'Ahorra',
      available: 'DISPONIBLE',
      viewMore: 'Ver más ofertas',
      viewPrevious: 'Ver anteriores',
    },
    // Loading states
    loading: {
      games: 'Cargando juegos...',
      info: 'Cargando información...',
    },
    // Empty states
    empty: {
      noGames: 'No hay juegos disponibles',
      addGames: 'Agrega juegos en tu base de datos de Supabase',
    },
    // Auth errors
    auth: {
      error: 'Error al iniciar sesión',
      emailRequired: '⚠️ Para iniciar sesión con Discord, necesitas tener tu email verificado. Por favor verifica tu email en Discord e intenta nuevamente.',
      accessDenied: 'Acceso denegado. Necesitas autorizar la aplicación para continuar.',
    },
    // Common
    common: {
      loading: 'Cargando...',
      unknown: 'Desconocido',
    },
  },
  en: {
    // Navigation
    nav: {
      discover: 'Discover',
      browse: 'Browse',
      offers: 'Offers & Price History',
    },
    // Hero section
    hero: {
      match: 'Match',
      play: 'Play',
      report: 'Report',
    },
    // Offers section
    offers: {
      title: '🔥 Steam Special Offers',
      subtitle: 'Exclusive discounts updated daily',
      save: 'Save',
      available: 'AVAILABLE',
      viewMore: 'View more offers',
      viewPrevious: 'View previous',
    },
    // Loading states
    loading: {
      games: 'Loading games...',
      info: 'Loading information...',
    },
    // Empty states
    empty: {
      noGames: 'No games available',
      addGames: 'Add games to your Supabase database',
    },
    // Auth errors
    auth: {
      error: 'Login error',
      emailRequired: '⚠️ To sign in with Discord, you need to have your email verified. Please verify your email in Discord and try again.',
      accessDenied: 'Access denied. You need to authorize the application to continue.',
    },
    // Common
    common: {
      loading: 'Loading...',
      unknown: 'Unknown',
    },
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKeys = typeof translations.es;

// Hook para usar traducciones
export function useTranslations(locale: Locale = 'es') {
  return translations[locale] || translations.es;
}
