import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obtener IP del usuario desde headers de Vercel
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip');

    // Intentar con ip-api.com (sin límites estrictos para uso personal)
    const geoResponse = await fetch(
      `http://ip-api.com/json/${ip || ''}?fields=status,message,country,countryCode,region,city,currency,query`
    );
    
    if (!geoResponse.ok) {
      throw new Error('Geolocation service unavailable');
    }

    const geoData = await geoResponse.json();

    if (geoData.status === 'fail') {
      throw new Error(geoData.message || 'Geolocation failed');
    }

    // Mapear código de país a código de Steam
    const countryToSteam: Record<string, string> = {
      'US': 'us', 'AR': 'ar', 'MX': 'mx', 'BR': 'br', 'CL': 'cl',
      'CO': 'co', 'PE': 'pe', 'UY': 'uy', 'ES': 'es', 'GB': 'uk',
      'DE': 'de', 'FR': 'fr', 'IT': 'it', 'RU': 'ru', 'CN': 'cn',
      'JP': 'jp', 'KR': 'kr', 'AU': 'au', 'NZ': 'nz', 'IN': 'in',
      'TR': 'tr', 'PL': 'pl', 'CA': 'ca',
    };

    const countryCode = geoData.countryCode || 'US';
    const steamCountryCode = countryToSteam[countryCode] || 'us';

    return NextResponse.json({
      ip: geoData.query || ip,
      country: geoData.country,
      country_code: countryCode,
      currency: geoData.currency,
      steam_country_code: steamCountryCode,
      city: geoData.city,
      region: geoData.region,
    });
  } catch (error) {
    console.error('Geolocation Error:', error);
    // Sin ubicación, no cargar precios
    return NextResponse.json({ error: 'Failed to detect location' }, { status: 500 });
  }
}
