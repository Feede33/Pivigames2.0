import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obtener IP del usuario
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '127.0.0.1';

    // En desarrollo, usar una IP de prueba
    const testIp = process.env.NODE_ENV === 'development' ? '8.8.8.8' : ip;

    // Usar ipapi.co para obtener información del país (gratis, sin API key)
    const geoResponse = await fetch(`https://ipapi.co/${testIp}/json/`);
    
    if (!geoResponse.ok) {
      throw new Error('Failed to fetch geolocation');
    }

    const geoData = await geoResponse.json();

    // Mapear código de país a código de moneda de Steam
    const countryToCurrency: Record<string, string> = {
      'US': 'us',
      'AR': 'ar',
      'MX': 'mx',
      'BR': 'br',
      'CL': 'cl',
      'CO': 'co',
      'PE': 'pe',
      'UY': 'uy',
      'ES': 'es',
      'GB': 'uk',
      'DE': 'de',
      'FR': 'fr',
      'IT': 'it',
      'RU': 'ru',
      'CN': 'cn',
      'JP': 'jp',
      'KR': 'kr',
      'AU': 'au',
      'NZ': 'nz',
      'IN': 'in',
      'TR': 'tr',
      'PL': 'pl',
      'CA': 'ca',
    };

    const countryCode = geoData.country_code || 'US';
    const steamCountryCode = countryToCurrency[countryCode] || 'us';

    return NextResponse.json({
      ip: testIp,
      country: geoData.country_name || 'United States',
      country_code: countryCode,
      currency: geoData.currency || 'USD',
      steam_country_code: steamCountryCode,
      city: geoData.city,
      region: geoData.region,
    });
  } catch (error) {
    console.error('Geolocation Error:', error);
    // Fallback a US si hay error
    return NextResponse.json({
      ip: '0.0.0.0',
      country: 'United States',
      country_code: 'US',
      currency: 'USD',
      steam_country_code: 'us',
      city: 'Unknown',
      region: 'Unknown',
    });
  }
}
