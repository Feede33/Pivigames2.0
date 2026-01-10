import type { Locale } from './i18n';

// Mapeo de códigos de idioma ISO 639-1 a códigos de Steam
// Steam usa nombres completos en inglés para sus idiomas
export const steamLanguageMap: Record<string, string> = {
  // Idiomas principales
  'es': 'spanish',
  'en': 'english',
  'pt': 'portuguese',
  'fr': 'french',
  'de': 'german',
  'it': 'italian',
  'ru': 'russian',
  'zh': 'schinese', // Chino simplificado
  'ja': 'japanese',
  'ko': 'koreana',
  
  // Idiomas adicionales
  'ar': 'arabic',
  'bg': 'bulgarian',
  'cs': 'czech',
  'da': 'danish',
  'nl': 'dutch',
  'fi': 'finnish',
  'el': 'greek',
  'hu': 'hungarian',
  'id': 'indonesian',
  'no': 'norwegian',
  'pl': 'polish',
  'ro': 'romanian',
  'sv': 'swedish',
  'th': 'thai',
  'tr': 'turkish',
  'uk': 'ukrainian',
  'vi': 'vietnamese',
  
  // Variantes regionales
  'pt-BR': 'brazilian',
  'zh-TW': 'tchinese', // Chino tradicional
  'es-ES': 'spanish',
  'es-MX': 'latam', // Español latinoamericano
  'en-US': 'english',
  'en-GB': 'english',
  'fr-FR': 'french',
  'de-DE': 'german',
};

// Idiomas soportados por Steam (completo)
export const supportedSteamLanguages = [
  'arabic',
  'bulgarian',
  'schinese', // Simplified Chinese
  'tchinese', // Traditional Chinese
  'czech',
  'danish',
  'dutch',
  'english',
  'finnish',
  'french',
  'german',
  'greek',
  'hungarian',
  'indonesian',
  'italian',
  'japanese',
  'koreana',
  'norwegian',
  'polish',
  'portuguese',
  'brazilian', // Portuguese-Brazil
  'romanian',
  'russian',
  'spanish',
  'latam', // Spanish-Latin America
  'swedish',
  'thai',
  'turkish',
  'ukrainian',
  'vietnamese',
];

/**
 * Convierte un código de idioma ISO 639-1 o locale completo a código de Steam
 * @param locale - Código de idioma (ej: 'es', 'en', 'pt-BR')
 * @returns Código de idioma de Steam (ej: 'spanish', 'english', 'brazilian')
 */
export function getSteamLanguage(locale: string): string {
  // Intentar con el locale completo primero (ej: pt-BR)
  if (steamLanguageMap[locale]) {
    return steamLanguageMap[locale];
  }
  
  // Intentar con solo el código de idioma (ej: pt de pt-BR)
  const languageCode = locale.split('-')[0];
  if (steamLanguageMap[languageCode]) {
    return steamLanguageMap[languageCode];
  }
  
  // Default a inglés si no se encuentra
  return 'english';
}

/**
 * Obtiene el idioma de Steam desde el header Accept-Language
 * @param acceptLanguage - Header Accept-Language del navegador
 * @returns Código de idioma de Steam
 */
export function getSteamLanguageFromHeader(acceptLanguage: string | null): string {
  if (!acceptLanguage) return 'english';
  
  // Parsear el header Accept-Language
  const languages = acceptLanguage.split(',').map(lang => {
    const [code, q = 'q=1'] = lang.trim().split(';');
    return { 
      code: code.trim(), 
      quality: parseFloat(q.replace('q=', '')) 
    };
  });
  
  // Ordenar por calidad
  languages.sort((a, b) => b.quality - a.quality);
  
  // Buscar el primer idioma soportado
  for (const lang of languages) {
    const steamLang = getSteamLanguage(lang.code);
    if (steamLang !== 'english' || lang.code.startsWith('en')) {
      return steamLang;
    }
  }
  
  return 'english';
}
