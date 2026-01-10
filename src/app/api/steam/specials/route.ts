import { NextRequest, NextResponse } from 'next/server';
import { getSteamLanguageFromHeader } from '@/lib/steam-languages';

// API para obtener las ofertas especiales de Steam
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('cc') || 'us';
    const count = parseInt(searchParams.get('count') || '20');
    
    // Obtener idioma desde query params o header Accept-Language
    const langParam = searchParams.get('l');
    const acceptLanguage = request.headers.get('accept-language');
    const steamLanguage = langParam || getSteamLanguageFromHeader(acceptLanguage);

    // Steam Featured API - obtiene juegos destacados y en oferta
    const response = await fetch(
      `https://store.steampowered.com/api/featuredcategories?cc=${countryCode}&l=${steamLanguage}`,
      { next: { revalidate: 1800 } } // Cache por 30 minutos
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Steam specials');
    }

    const data = await response.json();
    
    // Obtener juegos en oferta de diferentes categorías
    const specials = data.specials?.items || [];
    const topSellers = data.top_sellers?.items || [];
    const featured = data.featured_win?.items || [];
    
    // Combinar y filtrar solo juegos con descuento
    const allGames = [...specials, ...topSellers, ...featured];
    const gamesWithDiscount = allGames.filter((game: any) => 
      game.discount_percent > 0
    );
    
    // Eliminar duplicados por ID
    const uniqueGames = Array.from(
      new Map(gamesWithDiscount.map((game: any) => [game.id, game])).values()
    );
    
    // Limitar cantidad y formatear respuesta
    const formattedGames = uniqueGames.slice(0, count).map((game: any) => ({
      id: game.id,
      name: game.name,
      discount_percent: game.discount_percent,
      original_price: game.original_price,
      final_price: game.final_price,
      currency: game.currency || 'USD',
      header_image: game.header_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.id}/header.jpg`,
      capsule_image: game.large_capsule_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.id}/library_600x900.jpg`,
      platforms: {
        windows: game.windows_available || false,
        mac: game.mac_available || false,
        linux: game.linux_available || false,
      },
      controller_support: game.controller_support || null,
    }));

    return NextResponse.json({
      success: true,
      country_code: countryCode,
      count: formattedGames.length,
      games: formattedGames,
    });

  } catch (error) {
    console.error('Steam Specials API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Steam specials' },
      { status: 500 }
    );
  }
}
