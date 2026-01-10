import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Obtener el idioma del navegador
  const acceptLanguage = request.headers.get('accept-language');
  const pathname = request.nextUrl.pathname;
  
  // Si ya tiene un locale en la URL, continuar
  const pathnameHasLocale = ['es', 'en'].some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameHasLocale) {
    return NextResponse.next();
  }
  
  // Detectar idioma preferido del navegador
  let locale = 'es'; // Default
  if (acceptLanguage) {
    // Parsear el header Accept-Language
    const languages = acceptLanguage.split(',').map(lang => {
      const [code, q = 'q=1'] = lang.trim().split(';');
      return { code: code.split('-')[0], quality: parseFloat(q.replace('q=', '')) };
    });
    
    // Ordenar por calidad
    languages.sort((a, b) => b.quality - a.quality);
    
    // Buscar el primer idioma soportado
    const supportedLang = languages.find(lang => ['es', 'en'].includes(lang.code));
    if (supportedLang) {
      locale = supportedLang.code;
    }
  }
  
  // Redirigir a la URL con el locale
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
