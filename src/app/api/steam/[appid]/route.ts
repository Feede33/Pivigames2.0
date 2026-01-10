import { NextRequest, NextResponse } from 'next/server';
import { getSteamLanguageFromHeader, getSteamLanguage } from '@/lib/steam-languages';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appid: string }> }
) {
  const { appid } = await params;

  try {
    // Obtener el código de país desde query params (enviado desde el cliente)
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('cc') || 'us';
    
    // Obtener idioma desde query params, referer (URL), o header Accept-Language
    let steamLanguage = searchParams.get('l');
    
    if (!steamLanguage) {
      // Intentar extraer el locale de la URL del referer
      const referer = request.headers.get('referer');
      if (referer) {
        const match = referer.match(/\/(es|en|pt|fr|de|it|ru|ja|ko|zh|ar)\//);
        if (match) {
          steamLanguage = getSteamLanguage(match[1]);
        }
      }
    }
    
    // Si aún no hay idioma, usar Accept-Language
    if (!steamLanguage) {
      const acceptLanguage = request.headers.get('accept-language');
      steamLanguage = getSteamLanguageFromHeader(acceptLanguage);
    }

    console.log(`[Steam API] Fetching appid ${appid} in language: ${steamLanguage}`);

    // Steam Store API con código de país para precios regionales e idioma
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&l=${steamLanguage}&cc=${countryCode}`,
      { next: { revalidate: 3600 } } // Cache por 1 hora
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Steam API');
    }

    const data = await response.json();

    if (!data[appid]?.success) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    const gameData = data[appid].data;

    // Extraer screenshots
    const screenshots = gameData.screenshots?.map((screenshot: any) => ({
      id: screenshot.id,
      thumbnail: screenshot.path_thumbnail,
      full: screenshot.path_full,
    })) || [];

    // IMPORTANTE: Obtener el mejor wallpaper de alta calidad
    // Steam proporciona diferentes URLs para backgrounds, priorizamos calidad
    
    // Detectar si background es una URL dinámica de baja calidad
    const isDynamicBackground = gameData.background?.includes('storepagebackground');
    
    // Intentar obtener page_bg_raw de alta calidad (1920x1080 o superior)
    const highQualityBg = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/page_bg_raw.jpg`;
    
    let bestBackground = '';
    
    // Prioridad 1: page_bg_raw de alta calidad (verificar si existe)
    try {
      const bgCheck = await fetch(highQualityBg, { method: 'HEAD' });
      if (bgCheck.ok) {
        bestBackground = highQualityBg;
        console.log(`✓ Using high-quality page_bg_raw for ${gameData.name}`);
      }
    } catch (e) {
      // Si falla, continuar con otras opciones
    }
    
    // Prioridad 2: background_raw si existe y no es dinámico
    if (!bestBackground && gameData.background_raw && !gameData.background_raw.includes('storepagebackground')) {
      bestBackground = gameData.background_raw;
      console.log(`✓ Using background_raw for ${gameData.name}`);
    }
    
    // Prioridad 3: Primer screenshot en alta calidad si background es dinámico o de baja calidad
    if (!bestBackground && screenshots.length > 0 && (isDynamicBackground || !gameData.background)) {
      bestBackground = screenshots[0].full;
      console.log(`⚠ Using first screenshot as background for ${gameData.name}`);
    }
    
    // Prioridad 4: background normal si no es dinámico
    if (!bestBackground && gameData.background && !isDynamicBackground) {
      bestBackground = gameData.background;
      console.log(`⚠ Using standard background for ${gameData.name}`);
    }
    
    // Prioridad 5: header_image como último recurso
    if (!bestBackground) {
      bestBackground = gameData.header_image;
      console.log(`⚠ Using header_image as fallback for ${gameData.name}`);
    }

    console.log(`Wallpaper URL for ${gameData.name}:`, bestBackground);

    // Extraer videos/trailers
    const videos = gameData.movies?.map((movie: any) => {
      console.log('Raw movie data:', JSON.stringify(movie, null, 2));
      return {
        id: movie.id,
        name: movie.name,
        thumbnail: movie.thumbnail,
        // Steam ahora usa HLS y DASH en lugar de MP4/WebM directo
        hls: movie.hls_h264 || null,
        dash: movie.dash_h264 || null,
        dash_av1: movie.dash_av1 || null,
        // Mantener compatibilidad con formato antiguo si existe
        webm: movie.webm || {},
        mp4: movie.mp4 || {},
      };
    }) || [];

    // Extraer géneros
    const genres = gameData.genres?.map((g: any) => g.description) || [];

    // Extraer categorías/tags
    const categories = gameData.categories?.map((c: any) => c.description) || [];

    // Extraer idiomas soportados
    const languages = gameData.supported_languages
      ?.replace(/<[^>]*>/g, '') // Remover HTML tags
      .replace(/\*/g, '') // Remover asteriscos
      .split(',')
      .map((lang: string) => lang.trim())
      .filter(Boolean) || [];

    // Extraer plataformas
    const platforms = {
      windows: gameData.platforms?.windows || false,
      mac: gameData.platforms?.mac || false,
      linux: gameData.platforms?.linux || false,
    };

    // Extraer desarrolladores y publishers
    const developers = gameData.developers || [];
    const publishers = gameData.publishers || [];

    // Extraer fecha de lanzamiento
    const releaseDate = gameData.release_date?.date || null;
    const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;

    // Extraer Metacritic score (si existe)
    const metacritic = gameData.metacritic?.score || null;

    // Extraer edad requerida (ESRB/PEGI)
    const requiredAge = gameData.required_age || 0;

    // Extraer descripción corta
    const shortDescription = gameData.short_description || null;
    const detailedDescription = gameData.detailed_description?.replace(/<[^>]*>/g, '') || null;

    // Extraer requisitos del sistema
    const pcRequirements = gameData.pc_requirements || {};

    // Extraer información de precio detallada
    const priceInfo = gameData.price_overview ? {
      currency: gameData.price_overview.currency || 'USD',
      initial: gameData.price_overview.initial || 0,
      final: gameData.price_overview.final || 0,
      discount_percent: gameData.price_overview.discount_percent || 0,
      initial_formatted: gameData.price_overview.initial_formatted || null,
      final_formatted: gameData.price_overview.final_formatted || null,
    } : null;

    // Calcular precio actual y precio más bajo (simulado por ahora)
    // En una implementación real, esto vendría de una base de datos de historial de precios
    const currentPrice = priceInfo?.final_formatted || (gameData.is_free ? 'Free' : null);
    const lowestRecordedPrice = priceInfo ? 
      (priceInfo.discount_percent > 0 ? priceInfo.final_formatted : priceInfo.initial_formatted) : 
      currentPrice;

    return NextResponse.json({
      appid: gameData.steam_appid,
      name: gameData.name,
      type: gameData.type,
      short_description: shortDescription,
      detailed_description: detailedDescription,
      about: gameData.about_the_game,
      screenshots,
      videos,
      header_image: gameData.header_image,
      background: bestBackground, // Usar el mejor background disponible
      background_raw: gameData.background_raw,
      genres,
      categories,
      languages,
      platforms,
      developers,
      publishers,
      release_date: releaseDate,
      release_year: releaseYear,
      metacritic,
      required_age: requiredAge,
      pc_requirements: {
        minimum: pcRequirements.minimum?.replace(/<[^>]*>/g, '\n').trim() || null,
        recommended: pcRequirements.recommended?.replace(/<[^>]*>/g, '\n').trim() || null,
      },
      price: gameData.is_free ? 'Free' : gameData.price_overview?.final_formatted || null,
      price_info: priceInfo,
      current_price: currentPrice,
      lowest_recorded_price: lowestRecordedPrice,
      is_free: gameData.is_free || false,
      steam_appid: gameData.steam_appid,
    });
  } catch (error) {
    console.error('Steam API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game data' },
      { status: 500 }
    );
  }
}
