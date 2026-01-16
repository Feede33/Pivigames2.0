import { NextRequest, NextResponse } from 'next/server';
import { getSteamLanguageFromHeader, getSteamLanguage } from '@/lib/steam-languages';

const RAWG_API_KEY = process.env.RAWG_API_KEY;

// Función para convertir nombre de juego a slug de RAWG
function gameNameToSlug(gameName: string): string {
  return gameName
    .toLowerCase()
    .replace(/[™®©]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Función para obtener rating de RAWG
async function getRawgRating(gameName: string): Promise<number> {
  if (!RAWG_API_KEY) {
    console.warn('[RAWG] API key not configured');
    return 0;
  }

  try {
    const slug = gameNameToSlug(gameName);
    const response = await fetch(
      `https://api.rawg.io/api/games/${slug}?key=${RAWG_API_KEY}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 86400 },
      }
    );

    if (!response.ok) {
      console.warn(`[RAWG] Failed to fetch rating for ${gameName} (${response.status})`);
      return 0;
    }

    const data = await response.json();
    const rating = (data.rating || 0) * 2; // Convertir de 0-5 a 0-10
    
    console.log(`[RAWG] Rating for ${gameName}: ${rating}/10`);
    return rating;
  } catch (error) {
    console.error(`[RAWG] Error fetching rating for ${gameName}:`, error);
    return 0;
  }
}

// Función auxiliar para reintentar fetch con backoff exponencial
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
      
      // Si es 429 (rate limit) o 503 (service unavailable), reintentar
      if (response.status === 429 || response.status === 503) {
        const waitTime = Math.pow(2, i) * 1000; // Backoff exponencial
        console.log(`[Steam API] Rate limited or unavailable, retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Para otros errores, no reintentar
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Si es timeout o error de red, reintentar
      if (i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`[Steam API] Request failed, retrying in ${waitTime}ms...`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

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
    
    // Si viene un locale desde query params, convertirlo a formato Steam
    if (steamLanguage) {
      steamLanguage = getSteamLanguage(steamLanguage);
    } else {
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
    const response = await fetchWithRetry(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&l=${steamLanguage}&cc=${countryCode}`,
      { 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': steamLanguage,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error(`[Steam API] Error ${response.status} for appid ${appid}`);
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`[Steam API] Error details:`, errorText);
      throw new Error(`Steam API error: ${response.status}`);
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
    
    let bestBackground = '';
    
    // Prioridad 1: page_bg_raw de alta calidad (verificar si existe)
    // Nota: No verificamos con HEAD para evitar errores 500, asumimos que existe
    // Si no existe, el navegador mostrará error pero no rompe la API
    
    // Prioridad 2: background_raw si existe y no es dinámico
    if (gameData.background_raw && !gameData.background_raw.includes('storepagebackground')) {
      bestBackground = gameData.background_raw;
      console.log(`✓ Using background_raw for ${gameData.name}`);
    }
    // Prioridad 3: Primer screenshot en alta calidad si background es dinámico o de baja calidad
    else if (screenshots.length > 0 && (isDynamicBackground || !gameData.background)) {
      bestBackground = screenshots[0].full;
      console.log(`⚠ Using first screenshot as background for ${gameData.name}`);
    }
    // Prioridad 4: background normal si no es dinámico
    else if (gameData.background && !isDynamicBackground) {
      bestBackground = gameData.background;
      console.log(`⚠ Using standard background for ${gameData.name}`);
    }
    // Prioridad 5: header_image como último recurso
    else {
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

    // Obtener rating de RAWG si no hay Metacritic
    let rawgRating = 0;
    if (!metacritic) {
      rawgRating = await getRawgRating(gameData.name);
    }

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

    const responseData = {
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
      rawg_rating: rawgRating, // Rating de RAWG (0-10)
      required_age: requiredAge,
      pc_requirements: {
        minimum: pcRequirements.minimum || null,
        recommended: pcRequirements.recommended || null,
      },
      price: gameData.is_free ? 'Free' : gameData.price_overview?.final_formatted || null,
      price_info: priceInfo,
      current_price: currentPrice,
      lowest_recorded_price: lowestRecordedPrice,
      is_free: gameData.is_free || false,
      steam_appid: gameData.steam_appid,
    };

    // Retornar con headers de caché apropiados
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error(`[Steam API] Error fetching appid ${appid}:`, error);
    
    // Determinar el tipo de error
    let errorMessage = 'Failed to fetch game data';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Si es timeout o abort
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - Steam API took too long to respond';
        statusCode = 504;
      }
      // Si es error de red
      else if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Network error - Unable to reach Steam API';
        statusCode = 503;
      }
    }
    
    console.error(`[Steam API] Returning error ${statusCode}: ${errorMessage}`);
    
    // En lugar de devolver solo error, devolver datos básicos de fallback
    // Esto permite que el cliente muestre algo en lugar de fallar completamente
    const fallbackData = {
      appid: parseInt(appid),
      name: `Game ${appid}`,
      type: 'game',
      short_description: 'Unable to load game details from Steam. Please try again later.',
      detailed_description: null,
      about: null,
      screenshots: [],
      videos: [],
      header_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
      background: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/page_bg_generated_v6b.jpg`,
      background_raw: null,
      genres: [],
      categories: [],
      languages: [],
      platforms: {
        windows: true,
        mac: false,
        linux: false,
      },
      developers: [],
      publishers: [],
      release_date: null,
      release_year: null,
      metacritic: null,
      required_age: 0,
      pc_requirements: {
        minimum: null,
        recommended: null,
      },
      price: null,
      price_info: null,
      current_price: null,
      lowest_recorded_price: null,
      is_free: false,
      steam_appid: parseInt(appid),
      _error: errorMessage,
      _fallback: true,
    };
    
    // Devolver 200 con datos de fallback en lugar de error
    // Esto evita que el cliente falle y permite mostrar información básica
    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Steam-Error': errorMessage,
        'X-Fallback-Data': 'true',
      },
    });
  }
}
