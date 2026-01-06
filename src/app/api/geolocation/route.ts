import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obtener IP del usuario desde headers de Vercel
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip');

    // Usar ipapi.co para obtener información del país
    const geoResponse = await fetch(
      ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/'
    );
    
    if (!geoResponse.ok) {
      return NextResponse.json({ error: 'Geolocation service unavailable' }, { status: 503 });
    }

    const geoData = await geoResponse.json();

    // Mapear código de país a código de Steam
    const countryToSteam: Record<string, string> = {
      'US': 'us', 'AR': 'ar', 'MX': 'mx', 'BR': 'br', 'CL': 'cl',
      'CO': 'co', 'PE': 'pe', 'UY': 'uy', 'ES': 'es', 'GB': 'uk',
      'DE': 'de', 'FR': 'fr', 'IT': 'it', 'RU': 'ru', 'CN': 'cn',
      'JP': 'jp', 'KR': 'kr', 'AU': 'au', 'NZ': 'nz', 'IN': 'in',
      'TR': 'tr', 'PL': 'pl', 'CA': 'ca',
    };

    const countryCode = geoData.country_code || 'US';
    const steamCountryCode = countryToSteam[countryCode] || 'us';

    return NextResponse.json({
      ip: geoData.ip || ip,
      country: geoData.country_name,
      country_code: countryCode,
      currency: geoData.currency,
      steam_country_code: steamCountryCode,
      city: geoData.city,
      region: geoData.region,
    });
  } catch (error) {
    console.error('Geolocation Error:', error);
    return NextResponse.json({ error: 'Failed to detect location' }, { status: 500 });
  }
}
